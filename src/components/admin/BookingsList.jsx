"use client";

import { useState, useEffect } from "react";
import {
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    InputNumber,
    message,
    Tooltip,
    Popconfirm,
    Card,
    Row,
    Col,
    Select,
    DatePicker,
    Drawer,
    Descriptions,
    Progress,
    Alert,
    Switch,
} from "antd";
import {
    EditOutlined,
    SearchOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    ExclamationCircleOutlined,
    SafetyOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
// import ModelExplanation from "./ModelExplanation";
import AxiosInstance from "../../AxiosInstance";

const { Option } = Select;
const { confirm } = Modal;

// Create axios instance only for the model
const modelApi = axios.create({
    baseURL: "http://localhost:5000",
});

const BookingsList = ({ refreshDashboard }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [filterFlagged, setFilterFlagged] = useState(null);
    const [filterRefunded, setFilterRefunded] = useState(null);
    const [fraudDetailsVisible, setFraudDetailsVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [fraudDetails, setFraudDetails] = useState(null);
    const [fraudCheckLoading, setFraudCheckLoading] = useState({});
    const [users, setUsers] = useState([]);
    const [explanationVisible, setExplanationVisible] = useState(false);
    const [explanationData, setExplanationData] = useState(null);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get("/api/bookings/getAll");
            if (response.data.success) {
                setBookings(response.data.bookings);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            message.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await AxiosInstance.get("/api/users/getAllUsers");
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchUsers();
    }, []);

    const handleEdit = (booking) => {
        setEditingBooking(booking);
        form.setFieldsValue({
            ...booking,
            bookingTime: booking.bookingTime
                ? moment(booking.bookingTime)
                : null,
        });
        setIsModalVisible(true);
    };

    const handleCancelBooking = async (id) => {
        try {
            const response = await AxiosInstance.patch(
                `/api/bookings/cancel/${id}`
            );
            if (response.data.success) {
                message.success("Booking cancelled successfully");
                fetchBookings();
                refreshDashboard();
            }
        } catch (error) {
            console.error("Error cancelling booking:", error);
            message.error("Failed to cancel booking");
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingBooking(null);
        form.resetFields();
    };

    const handleModalSave = async () => {
        try {
            const values = await form.validateFields();

            // Convert date to ISO string
            if (values.bookingTime) {
                values.bookingTime = values.bookingTime.toISOString();
            }

            const response = await AxiosInstance.put(
                `/api/bookings/update/${editingBooking._id}`,
                values
            );

            if (response.data.success) {
                message.success("Booking updated successfully");
                setIsModalVisible(false);
                fetchBookings();
                refreshDashboard();
            }
        } catch (error) {
            console.error("Error updating booking:", error);
            message.error("Failed to update booking");
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleFilterFlaggedChange = (value) => {
        setFilterFlagged(value);
    };

    const handleFilterRefundedChange = (value) => {
        setFilterRefunded(value);
    };

    const checkFraudStatus = async (booking) => {
        // Set loading state for this specific booking
        setFraudCheckLoading((prev) => ({ ...prev, [booking._id]: true }));
        setSelectedBooking(booking);

        try {
            // Find user data
            const user = users.find((u) => u._id === booking.userId);

            // Prepare user data for fraud detection
            const userData = {
                total_tickets: user ? user.totalTicketsBought || 0 : 0,
                booking_count: user ? user.numBookings || 0 : 0,
                distinct_payment_methods: 1, // Default value
                distinct_ip_addresses: 1, // Default value
                payment_method: booking.paymentMethod,
                ip_address: booking.ipAddress,
            };

            // Prepare booking data for fraud detection
            const bookingData = {
                num_tickets: booking.numTickets,
                payment_method: booking.paymentMethod,
                ip_address: booking.ipAddress,
                user_booking_count: user ? user.numBookings || 0 : 0,
                user_avg_tickets:
                    user && user.numBookings > 0
                        ? user.totalTicketsBought / user.numBookings
                        : 0,
            };

            // Call the fraud detection model for user
            const userResponse = await modelApi.post("/predict_user", [
                userData,
            ]);

            // Call the fraud detection model for booking
            const bookingResponse = await modelApi.post("/predict_booking", [
                bookingData,
            ]);

            if (userResponse.data && bookingResponse.data) {
                const userFraudResult =
                    userResponse.data.user_fraud_prediction[0];
                const bookingFraudResult =
                    bookingResponse.data.booking_fraud_prediction[0];

                // Determine if suspicious
                const isSuspicious =
                    userFraudResult === 1 || bookingFraudResult === 1;

                // Generate risk factors
                const riskFactors = [];
                if (userFraudResult === 1) {
                    riskFactors.push("User has suspicious booking patterns");
                    if (userData.distinct_payment_methods > 2) {
                        riskFactors.push(
                            "User has used multiple payment methods"
                        );
                    }
                    if (userData.distinct_ip_addresses > 2) {
                        riskFactors.push(
                            "User has booked from multiple IP addresses"
                        );
                    }
                    if (userData.total_tickets > 20) {
                        riskFactors.push(
                            "User has booked an unusually high number of tickets"
                        );
                    }
                }

                if (bookingFraudResult === 1) {
                    riskFactors.push(
                        "This specific booking has suspicious characteristics"
                    );
                    if (booking.numTickets > 5) {
                        riskFactors.push(
                            "Large number of tickets in a single booking"
                        );
                    }

                    // Check booking time (if between midnight and 5am)
                    const bookingHour = new Date(
                        booking.bookingTime
                    ).getHours();
                    if (bookingHour >= 0 && bookingHour < 5) {
                        riskFactors.push(
                            "Booking made during unusual hours (midnight to 5am)"
                        );
                    }
                }

                // Create fraud details object
                const fraudDetails = {
                    isSuspicious: isSuspicious,
                    suspiciousProbability: isSuspicious ? 0.85 : 0.15, // Simplified for demo
                    userFraudResult: userFraudResult,
                    bookingFraudResult: bookingFraudResult,
                    riskFactors: riskFactors,
                };

                // Update the booking with the fraud prediction
                await AxiosInstance.put(`/api/bookings/update/${booking._id}`, {
                    isFlaggedAsSuspicious: isSuspicious,
                });

                // Show the fraud details
                setFraudDetails(fraudDetails);
                setFraudDetailsVisible(true);

                // Refresh the bookings list
                fetchBookings();
                refreshDashboard();

                message.success("Fraud check completed");
            }
        } catch (error) {
            console.error("Error checking fraud status:", error);
            message.error("Failed to check fraud status: " + error.message);
        } finally {
            // Clear loading state for this specific booking
            setFraudCheckLoading((prev) => ({ ...prev, [booking._id]: false }));
        }
    };

    const showExplanation = (booking) => {
        // Prepare booking data for explanation
        const explanationData = {
            num_tickets: booking.numTickets,
            payment_method: booking.paymentMethod,
            ip_address: booking.ipAddress,
            user_booking_count:
                users.find((u) => u._id === booking.userId)?.numBookings || 0,
            user_avg_tickets:
                users.find((u) => u._id === booking.userId)
                    ?.totalTicketsBought /
                    (users.find((u) => u._id === booking.userId)?.numBookings ||
                        1) || 0,
        };

        setExplanationData(explanationData);
        setExplanationVisible(true);
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch = searchText
            ? booking.ticketId.toLowerCase().includes(searchText.toLowerCase())
            : true;

        const matchesFlag =
            filterFlagged !== null
                ? booking.isFlaggedAsSuspicious === filterFlagged
                : true;

        const matchesRefund =
            filterRefunded !== null
                ? booking.isRefunded === filterRefunded
                : true;

        return matchesSearch && matchesFlag && matchesRefund;
    });

    const columns = [
        {
            title: "Ticket ID",
            dataIndex: "ticketId",
            key: "ticketId",
            sorter: (a, b) => a.ticketId.localeCompare(b.ticketId),
        },
        {
            title: "User",
            dataIndex: "userId",
            key: "userId",
            render: (userId) => {
                const user = users.find((u) => u._id === userId);
                return user
                    ? `${user.fname} ${user.lname}`
                    : userId.substring(0, 8) + "...";
            },
        },
        {
            title: "Tickets",
            dataIndex: "numTickets",
            key: "numTickets",
            sorter: (a, b) => a.numTickets - b.numTickets,
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `LKR ${price}`,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: "Payment",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
            filters: [
                { text: "Credit Card", value: "credit_card" },
                { text: "Debit Card", value: "debit_card" },
                { text: "PayPal", value: "paypal" },
            ],
            onFilter: (value, record) => record.paymentMethod === value,
        },
        {
            title: "Booking Time",
            dataIndex: "bookingTime",
            key: "bookingTime",
            render: (text) => (text ? new Date(text).toLocaleString() : "N/A"),
            sorter: (a, b) => new Date(a.bookingTime) - new Date(b.bookingTime),
        },
        {
            title: "Suspicious",
            dataIndex: "isFlaggedAsSuspicious",
            key: "isFlaggedAsSuspicious",
            render: (value, record) => (
                <Tooltip
                    title={
                        value
                            ? "Click to view details"
                            : "Not flagged as suspicious"
                    }
                >
                    <Tag
                        color={value ? "red" : "green"}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setSelectedBooking(record);
                            checkFraudStatus(record);
                        }}
                    >
                        {value ? (
                            <>
                                <WarningOutlined /> Flagged
                            </>
                        ) : (
                            <>
                                <CheckCircleOutlined /> Safe
                            </>
                        )}
                    </Tag>
                </Tooltip>
            ),
            filters: [
                { text: "Flagged", value: true },
                { text: "Safe", value: false },
            ],
            onFilter: (value, record) => record.isFlaggedAsSuspicious === value,
        },
        {
            title: "Refunded",
            dataIndex: "isRefunded",
            key: "isRefunded",
            render: (value) => (
                <Tag color={value ? "volcano" : "blue"}>
                    {value ? "Cancelled" : "Valid"}
                </Tag>
            ),
            filters: [
                { text: "Cancelled", value: true },
                { text: "Valid", value: false },
            ],
            onFilter: (value, record) => record.isRefunded === value,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit Booking">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            disabled={record.isRefunded}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Check for Fraud">
                        <Button
                            icon={<SafetyOutlined />}
                            onClick={() => checkFraudStatus(record)}
                            loading={fraudCheckLoading[record._id]}
                            disabled={record.isRefunded}
                            type="primary"
                            danger={record.isFlaggedAsSuspicious}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Explain Prediction">
                        <Button
                            icon={<InfoCircleOutlined />}
                            onClick={() => showExplanation(record)}
                            size="small"
                            type="default"
                        />
                    </Tooltip>
                    <Tooltip title="Cancel Booking">
                        <Popconfirm
                            title="Are you sure you want to cancel this booking?"
                            onConfirm={() => handleCancelBooking(record._id)}
                            okText="Yes"
                            cancelText="No"
                            disabled={record.isRefunded}
                        >
                            <Button
                                danger
                                disabled={record.isRefunded}
                                size="small"
                            >
                                Cancel
                            </Button>
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Input
                            placeholder="Search by ticket ID"
                            prefix={<SearchOutlined />}
                            onChange={(e) => handleSearch(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={8} md={5}>
                        <Select
                            placeholder="Filter by fraud status"
                            style={{ width: "100%" }}
                            onChange={handleFilterFlaggedChange}
                            allowClear
                        >
                            <Option value={true}>Flagged Bookings</Option>
                            <Option value={false}>Safe Bookings</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={5}>
                        <Select
                            placeholder="Filter by refund status"
                            style={{ width: "100%" }}
                            onChange={handleFilterRefundedChange}
                            allowClear
                        >
                            <Option value={true}>Cancelled Bookings</Option>
                            <Option value={false}>Valid Bookings</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Button
                            type="primary"
                            icon={<SyncOutlined />}
                            onClick={fetchBookings}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Table
                columns={columns}
                dataSource={filteredBookings}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                rowClassName={(record) =>
                    record.isRefunded
                        ? "bg-gray-100 text-gray-400"
                        : record.isFlaggedAsSuspicious
                        ? "bg-red-50"
                        : ""
                }
            />

            <Modal
                title="Edit Booking"
                open={isModalVisible}
                onCancel={handleModalCancel}
                onOk={handleModalSave}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ ...editingBooking }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="ticketId"
                                label="Ticket ID"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter ticket ID",
                                    },
                                ]}
                            >
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="userId" label="User ID">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="numTickets"
                                label="Number of Tickets"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please enter number of tickets",
                                    },
                                    {
                                        type: "number",
                                        min: 1,
                                        message: "Must be at least 1",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Price"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter price",
                                    },
                                    {
                                        type: "number",
                                        min: 0,
                                        message: "Price must be positive",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    formatter={(value) => `LKR ${value}`}
                                    parser={(value) =>
                                        value.replace(/LKR\s?/g, "")
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="paymentMethod"
                                label="Payment Method"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select payment method",
                                    },
                                ]}
                            >
                                <Select>
                                    <Option value="credit_card">
                                        Credit Card
                                    </Option>
                                    <Option value="debit_card">
                                        Debit Card
                                    </Option>
                                    <Option value="paypal">PayPal</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="bookingTime"
                                label="Booking Time"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select booking time",
                                    },
                                ]}
                            >
                                <DatePicker
                                    showTime
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="ipAddress"
                                label="IP Address"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter IP address",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="isFlaggedAsSuspicious"
                                label="Flagged as Suspicious"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Yes"
                                    unCheckedChildren="No"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer
                title={
                    <div className="flex items-center">
                        <ExclamationCircleOutlined
                            style={{
                                color: fraudDetails?.isSuspicious
                                    ? "red"
                                    : "green",
                                marginRight: "8px",
                                fontSize: "20px",
                            }}
                        />
                        Fraud Detection Results
                    </div>
                }
                placement="right"
                onClose={() => setFraudDetailsVisible(false)}
                open={fraudDetailsVisible}
                width={500}
            >
                {selectedBooking && fraudDetails && (
                    <div>
                        <Alert
                            message={
                                fraudDetails.isSuspicious
                                    ? "Suspicious Activity Detected"
                                    : "No Suspicious Activity Detected"
                            }
                            description={
                                fraudDetails.isSuspicious
                                    ? "This booking has been flagged as potentially fraudulent."
                                    : "This booking appears to be legitimate."
                            }
                            type={
                                fraudDetails.isSuspicious ? "error" : "success"
                            }
                            showIcon
                            style={{ marginBottom: 24 }}
                        />

                        <Descriptions
                            title="Booking Details"
                            bordered
                            column={1}
                        >
                            <Descriptions.Item label="Ticket ID">
                                {selectedBooking.ticketId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Number of Tickets">
                                {selectedBooking.numTickets}
                            </Descriptions.Item>
                            <Descriptions.Item label="Price">
                                LKR {selectedBooking.price}
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Method">
                                {selectedBooking.paymentMethod}
                            </Descriptions.Item>
                            <Descriptions.Item label="Booking Time">
                                {new Date(
                                    selectedBooking.bookingTime
                                ).toLocaleString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="IP Address">
                                {selectedBooking.ipAddress}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24 }}>
                            <h3>Fraud Analysis</h3>
                            <div style={{ marginBottom: 16 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span>User Level:</span>
                                    <Tag
                                        color={
                                            fraudDetails.userFraudResult === 1
                                                ? "red"
                                                : "green"
                                        }
                                    >
                                        {fraudDetails.userFraudResult === 1
                                            ? "Suspicious"
                                            : "Safe"}
                                    </Tag>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span>Booking Level:</span>
                                    <Tag
                                        color={
                                            fraudDetails.bookingFraudResult ===
                                            1
                                                ? "red"
                                                : "green"
                                        }
                                    >
                                        {fraudDetails.bookingFraudResult === 1
                                            ? "Suspicious"
                                            : "Safe"}
                                    </Tag>
                                </div>
                            </div>

                            <h3>Overall Fraud Probability</h3>
                            <Progress
                                percent={Math.round(
                                    fraudDetails.suspiciousProbability * 100
                                )}
                                status={
                                    fraudDetails.isSuspicious
                                        ? "exception"
                                        : "success"
                                }
                                strokeColor={{
                                    from: "#52c41a",
                                    to: "#f5222d",
                                }}
                            />
                        </div>

                        {fraudDetails.riskFactors &&
                            fraudDetails.riskFactors.length > 0 && (
                                <div style={{ marginTop: 24 }}>
                                    <h3>Risk Factors</h3>
                                    <ul>
                                        {fraudDetails.riskFactors.map(
                                            (factor, index) => (
                                                <li
                                                    key={index}
                                                    style={{
                                                        color: "red",
                                                        marginBottom: "8px",
                                                    }}
                                                >
                                                    <WarningOutlined
                                                        style={{
                                                            marginRight: 8,
                                                        }}
                                                    />
                                                    {factor}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                        <div style={{ marginTop: 24 }}>
                            <h3>Recommended Actions</h3>
                            {fraudDetails.isSuspicious ? (
                                <ul>
                                    <li>
                                        Contact the customer to verify the
                                        booking
                                    </li>
                                    <li>
                                        Check for multiple bookings from the
                                        same IP address
                                    </li>
                                    <li>Verify payment method details</li>
                                    <li>
                                        Consider requiring additional
                                        verification
                                    </li>
                                </ul>
                            ) : (
                                <p>
                                    No action required. This booking appears
                                    legitimate.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </Drawer>

            {/* <Drawer
                title="Model Explanation"
                placement="right"
                onClose={() => setExplanationVisible(false)}
                open={explanationVisible}
                width={800}
            >
                {explanationData && (
                    <ModelExplanation
                        bookingData={explanationData}
                        onClose={() => setExplanationVisible(false)}
                    />
                )}
            </Drawer> */}
        </div>
    );
};

export default BookingsList;
