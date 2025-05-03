import { useEffect, useState } from "react";
import {
    Table,
    Button,
    Popconfirm,
    Tag,
    message,
    Modal,
    Form,
    InputNumber,
    Tooltip,
    Alert,
    Drawer,
    Descriptions,
    Progress,
} from "antd";
import {
    EditOutlined,
    StopOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined,
    LockOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import { Icon } from "@iconify/react";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DatePicker } from "antd";
dayjs.extend(customParseFormat);
import AxiosInstance from "../../AxiosInstance";

function TicketsTable() {
    const [tickets, setTickets] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fraudCheckLoading, setFraudCheckLoading] = useState(false);
    const [fraudDetailsVisible, setFraudDetailsVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [fraudDetails, setFraudDetails] = useState(null);
    const [userFraudData, setUserFraudData] = useState({});

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get("/api/bookings/getAll");
            if (response.data.success) {
                setTickets(response.data.bookings);

                // Collect user statistics for fraud detection
                const userStats = {};
                response.data.bookings.forEach((booking) => {
                    if (!userStats[booking.userId]) {
                        userStats[booking.userId] = {
                            total_tickets: 0,
                            booking_count: 0,
                            payment_methods: new Set(),
                            ip_addresses: new Set(),
                            last_payment_method: booking.paymentMethod,
                            last_ip_address: booking.ipAddress,
                        };
                    }

                    userStats[booking.userId].total_tickets +=
                        booking.numTickets;
                    userStats[booking.userId].booking_count += 1;
                    userStats[booking.userId].payment_methods.add(
                        booking.paymentMethod
                    );
                    userStats[booking.userId].ip_addresses.add(
                        booking.ipAddress
                    );
                });

                // Convert to format needed for fraud detection
                const processedUserStats = {};
                Object.keys(userStats).forEach((userId) => {
                    const user = userStats[userId];
                    processedUserStats[userId] = {
                        total_tickets: user.total_tickets,
                        booking_count: user.booking_count,
                        distinct_payment_methods: user.payment_methods.size,
                        distinct_ip_addresses: user.ip_addresses.size,
                        payment_method: user.last_payment_method,
                        ip_address: user.last_ip_address,
                    };
                });

                setUserFraudData(processedUserStats);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            message.error("Failed to load tickets.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const showEditModal = (ticket) => {
        setEditingTicket(ticket);
        form.setFieldsValue({
            ...ticket,
            newBookingDateTime: dayjs(ticket.bookingTime),
        });
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingTicket(null);
    };

    const handleModalSave = async () => {
        try {
            const values = await form.validateFields();
            const newTime = values.newBookingDateTime?.toISOString();

            const response = await AxiosInstance.put(
                `/api/bookings/update/${editingTicket._id}`,
                {
                    numTickets: values.numTickets,
                    price: values.price,
                    bookingTime: newTime,
                }
            );

            if (response.data.success) {
                message.success("Ticket updated successfully.");
                fetchTickets();
                setIsModalVisible(false);
            }
        } catch (error) {
            console.error("Error updating ticket:", error);
            message.error("Failed to update ticket.");
        }
    };

    const handleCancelTicket = async (id) => {
        try {
            const response = await AxiosInstance.patch(
                `/api/bookings/cancel/${id}`
            );
            if (response.data.success) {
                message.success("Ticket cancelled.");
                fetchTickets();
            }
        } catch (error) {
            console.error("Cancel failed", error);
            message.error("Failed to cancel ticket.");
        }
    };

    const checkFraudStatus = async (ticket) => {
        setFraudCheckLoading(true);
        setSelectedTicket(ticket);

        try {
            // First check user-level fraud
            const userData = userFraudData[ticket.userId];
            const userFraudResponse = await axios.post(
                "http://localhost:5000/predict_user",
                [userData]
            );

            // Then check booking-level fraud
            const bookingData = [
                {
                    num_tickets: ticket.numTickets,
                    payment_method: ticket.paymentMethod,
                    ip_address: ticket.ipAddress,
                    user_booking_count: userData.booking_count,
                    user_avg_tickets:
                        userData.total_tickets / userData.booking_count,
                },
            ];

            const bookingFraudResponse = await axios.post(
                "http://localhost:5000/predict_booking",
                bookingData
            );

            // Combine results
            const userFraudResult =
                userFraudResponse.data.user_fraud_prediction[0];
            const bookingFraudResult =
                bookingFraudResponse.data.booking_fraud_prediction[0];

            // Determine overall fraud status
            const isSuspicious =
                userFraudResult === 1 || bookingFraudResult === 1;

            // Generate risk factors
            const riskFactors = [];
            if (userFraudResult === 1) {
                riskFactors.push("User has suspicious booking patterns");
                if (userData.distinct_payment_methods > 2) {
                    riskFactors.push("User has used multiple payment methods");
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
                if (ticket.numTickets > 5) {
                    riskFactors.push(
                        "Large number of tickets in a single booking"
                    );
                }

                // Check booking time (if between midnight and 5am)
                const bookingHour = new Date(ticket.bookingTime).getHours();
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

            // Update the ticket with the fraud prediction
            await AxiosInstance.put(`/api/bookings/update/${ticket._id}`, {
                isFlaggedAsSuspicious: isSuspicious,
            });

            // Show the fraud details
            setFraudDetails(fraudDetails);
            setFraudDetailsVisible(true);

            // Refresh the tickets list
            fetchTickets();

            message.success("Fraud check completed");
        } catch (error) {
            console.error("Error checking fraud status:", error);
            message.error("Failed to check fraud status: " + error.message);
        } finally {
            setFraudCheckLoading(false);
        }
    };

    const columns = [
        {
            title: "Ticket ID",
            dataIndex: "ticketId",
            key: "ticketId",
        },
        {
            title: "User ID",
            dataIndex: "userId",
            key: "userId",
            render: (userId) =>
                userId ? userId.substring(0, 8) + "..." : "N/A",
        },
        {
            title: "Tickets",
            dataIndex: "numTickets",
            key: "numTickets",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `LKR ${price}`,
        },
        {
            title: "Payment",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
        },
        {
            title: "Booking Time",
            dataIndex: "bookingTime",
            key: "bookingTime",
            render: (text) => (text ? new Date(text).toLocaleString() : "N/A"),
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
                        style={{ cursor: value ? "pointer" : "default" }}
                        onClick={() => {
                            if (value) {
                                setSelectedTicket(record);
                                checkFraudStatus(record); // Re-run to get details
                            }
                        }}
                    >
                        {value ? (
                            <>
                                <WarningOutlined /> Flagged
                            </>
                        ) : (
                            <>
                                <LockOutlined  /> Safe
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
                <div className="flex gap-2">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                        disabled={record.isRefunded}
                    />
                    <Popconfirm
                        title="Cancel this ticket?"
                        onConfirm={() => handleCancelTicket(record._id)}
                        okText="Yes"
                        cancelText="No"
                        disabled={record.isRefunded}
                    >
                        <Button
                            icon={<StopOutlined />}
                            danger
                            disabled={record.isRefunded}
                        >
                            Cancel
                        </Button>
                    </Popconfirm>
                    <Tooltip title="Check for fraud">
                        <Button
                            icon={<Icon icon="mdi:incognito" />}
                            onClick={() => checkFraudStatus(record)}
                            disabled={record.isRefunded || fraudCheckLoading}
                            type="default"
                            loading={
                                fraudCheckLoading &&
                                selectedTicket?._id === record._id
                            }
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tickets</h2>
                <div>
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        loading={loading}
                        onClick={fetchTickets}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={tickets}
                rowKey="_id"
                loading={loading}
                rowClassName={(record) =>
                    record.isRefunded
                        ? "bg-gray-100 text-gray-400"
                        : record.isFlaggedAsSuspicious
                        ? "bg-red-50"
                        : ""
                }
            />

            <Modal
                title="Edit Ticket"
                open={isModalVisible}
                onCancel={handleModalCancel}
                onOk={handleModalSave}
                okText="Save"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Number of Tickets"
                        name="numTickets"
                        rules={[
                            {
                                required: true,
                                message: "Please enter ticket count",
                            },
                            {
                                validator: (_, value) =>
                                    value > 0
                                        ? Promise.resolve()
                                        : Promise.reject(
                                              new Error(
                                                  "Ticket count must be greater than 0"
                                              )
                                          ),
                            },
                        ]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>
                    <Form.Item
                        label="New Booking Date & Time"
                        name="newBookingDateTime"
                        rules={[
                            {
                                required: true,
                                message: "Please select a new date and time",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const original = dayjs(
                                        editingTicket?.bookingTime
                                    );
                                    if (!value || value.isAfter(original)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error(
                                            "New booking date must be after original booking time"
                                        )
                                    );
                                },
                            }),
                        ]}
                    >
                        <DatePicker
                            showTime
                            className="w-full"
                            format="YYYY-MM-DD HH:mm"
                            disabledDate={(current) =>
                                current &&
                                current <
                                    dayjs(editingTicket?.bookingTime).endOf(
                                        "minute"
                                    )
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label="Price"
                        name="price"
                        rules={[
                            { required: true, message: "Please enter a price" },
                            {
                                validator: (_, value) =>
                                    value > 0
                                        ? Promise.resolve()
                                        : Promise.reject(
                                              new Error(
                                                  "Price must be greater than 0"
                                              )
                                          ),
                            },
                        ]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>
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
                {selectedTicket && fraudDetails && (
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
                                {selectedTicket.ticketId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Number of Tickets">
                                {selectedTicket.numTickets}
                            </Descriptions.Item>
                            <Descriptions.Item label="Price">
                                LKR {selectedTicket.price}
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Method">
                                {selectedTicket.paymentMethod}
                            </Descriptions.Item>
                            <Descriptions.Item label="Booking Time">
                                {new Date(
                                    selectedTicket.bookingTime
                                ).toLocaleString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="IP Address">
                                {selectedTicket.ipAddress}
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
        </div>
    );
}

export default TicketsTable;
