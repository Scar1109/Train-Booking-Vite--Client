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
    Switch,
    message,
    Tooltip,
    Popconfirm,
    Card,
    Row,
    Col,
    Select,
    DatePicker,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    SearchOutlined,
    ExclamationCircleOutlined,
    SyncOutlined,
    SafetyOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import AxiosInstance from "../../AxiosInstance";

const { Option } = Select;
const { confirm } = Modal;

// Create axios instance only for the model
const modelApi = axios.create({
    baseURL: "http://localhost:5000",
});

const UsersList = ({ refreshDashboard }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [filterFlagged, setFilterFlagged] = useState(null);
    const [checkingFraud, setCheckingFraud] = useState({});

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get("/api/users/getAllUsers");
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            message.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            ...user,
            accountCreated: user.accountCreated
                ? moment(user.accountCreated)
                : null,
            lastBookingDate: user.lastBookingDate
                ? moment(user.lastBookingDate)
                : null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (userId) => {
        confirm({
            title: "Are you sure you want to delete this user?",
            icon: <ExclamationCircleOutlined />,
            content: "This action cannot be undone.",
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                try {
                    const response = await AxiosInstance.delete(
                        `/api/users/deleteUser/${userId}`
                    );
                    if (response.data.success) {
                        message.success("User deleted successfully");
                        fetchUsers();
                        refreshDashboard();
                    }
                } catch (error) {
                    console.error("Error deleting user:", error);
                    message.error("Failed to delete user");
                }
            },
        });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingUser(null);
        form.resetFields();
    };

    const handleModalSave = async () => {
        try {
            const values = await form.validateFields();

            // Convert dates to ISO strings
            if (values.accountCreated) {
                values.accountCreated = values.accountCreated.toISOString();
            }
            if (values.lastBookingDate) {
                values.lastBookingDate = values.lastBookingDate.toISOString();
            }

            const response = await AxiosInstance.put(
                `/api/users/updateUser/${editingUser._id}`,
                values
            );

            if (response.data.success) {
                message.success("User updated successfully");
                setIsModalVisible(false);
                fetchUsers();
                refreshDashboard();
            }
        } catch (error) {
            console.error("Error updating user:", error);
            message.error("Failed to update user");
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleFilterChange = (value) => {
        setFilterFlagged(value);
    };

    const checkUserFraud = async (userId) => {
        // Set loading state for this specific user
        setCheckingFraud((prev) => ({ ...prev, [userId]: true }));

        try {
            // Find the user
            const user = users.find((u) => u._id === userId);
            if (!user) return;

            // Get user's bookings to calculate more accurate metrics
            const bookingsResponse = await AxiosInstance.get(
                `/api/bookings/getByUser/${userId}`
            );
            const userBookings = bookingsResponse.data.success
                ? bookingsResponse.data.bookings
                : [];

            // Calculate distinct payment methods and IP addresses
            const paymentMethods = new Set();
            const ipAddresses = new Set();

            userBookings.forEach((booking) => {
                if (booking.paymentMethod)
                    paymentMethods.add(booking.paymentMethod);
                if (booking.ipAddress) ipAddresses.add(booking.ipAddress);
            });

            // Prepare user data for fraud detection
            const userData = {
                total_tickets: user.totalTicketsBought || 0,
                booking_count: user.numBookings || 0,
                distinct_payment_methods: paymentMethods.size || 1,
                distinct_ip_addresses: ipAddresses.size || 1,
                payment_method:
                    paymentMethods.size > 0
                        ? Array.from(paymentMethods)[0]
                        : "credit_card",
                ip_address:
                    ipAddresses.size > 0
                        ? Array.from(ipAddresses)[0]
                        : "127.0.0.1",
            };

            // Call the fraud detection model
            const response = await modelApi.post("/predict_user", [userData]);

            if (response.data && response.data.user_fraud_prediction) {
                const isFraudulent =
                    response.data.user_fraud_prediction[0] === 1;

                // Update the user in the backend
                await AxiosInstance.put(`/api/users/updateUser/${userId}`, {
                    isFlaggedForFraud: isFraudulent,
                });

                message.success(
                    `User fraud check complete: ${
                        isFraudulent
                            ? "Flagged as suspicious"
                            : "No issues detected"
                    }`
                );
                fetchUsers();
                refreshDashboard();
            }
        } catch (error) {
            console.error("Error checking user fraud:", error);
            message.error("Failed to check user for fraud");
        } finally {
            // Clear loading state for this specific user
            setCheckingFraud((prev) => ({ ...prev, [userId]: false }));
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch = searchText
            ? (user.fname + " " + user.lname)
                  .toLowerCase()
                  .includes(searchText.toLowerCase()) ||
              user.email.toLowerCase().includes(searchText.toLowerCase())
            : true;

        const matchesFlag =
            filterFlagged !== null
                ? user.isFlaggedForFraud === filterFlagged
                : true;

        return matchesSearch && matchesFlag;
    });

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (_, record) => `${record.fname} ${record.lname}`,
            sorter: (a, b) =>
                `${a.fname} ${a.lname}`.localeCompare(`${b.fname} ${b.lname}`),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: "Account Created",
            dataIndex: "accountCreated",
            key: "accountCreated",
            render: (date) =>
                date ? new Date(date).toLocaleDateString() : "N/A",
            sorter: (a, b) =>
                new Date(a.accountCreated) - new Date(b.accountCreated),
        },
        {
            title: "Bookings",
            dataIndex: "numBookings",
            key: "numBookings",
            sorter: (a, b) => a.numBookings - b.numBookings,
        },
        {
            title: "Total Tickets",
            dataIndex: "totalTicketsBought",
            key: "totalTicketsBought",
            sorter: (a, b) => a.totalTicketsBought - b.totalTicketsBought,
        },
        {
            title: "Last Booking",
            dataIndex: "lastBookingDate",
            key: "lastBookingDate",
            render: (date) =>
                date ? new Date(date).toLocaleDateString() : "N/A",
            sorter: (a, b) => {
                if (!a.lastBookingDate) return 1;
                if (!b.lastBookingDate) return -1;
                return (
                    new Date(a.lastBookingDate) - new Date(b.lastBookingDate)
                );
            },
        },
        {
            title: "Fraud Status",
            dataIndex: "isFlaggedForFraud",
            key: "isFlaggedForFraud",
            render: (flagged) => (
                <Tag
                    color={flagged ? "red" : "green"}
                    icon={
                        flagged ? <WarningOutlined /> : <CheckCircleOutlined />
                    }
                >
                    {flagged ? "Flagged" : "Safe"}
                </Tag>
            ),
            filters: [
                { text: "Flagged", value: true },
                { text: "Safe", value: false },
            ],
            onFilter: (value, record) => record.isFlaggedForFraud === value,
        },
        {
            title: "Account Status",
            dataIndex: "isSuspended",
            key: "isSuspended",
            render: (suspended) => (
                <Tag color={suspended ? "volcano" : "blue"}>
                    {suspended ? "Suspended" : "Active"}
                </Tag>
            ),
            filters: [
                { text: "Active", value: false },
                { text: "Suspended", value: true },
            ],
            onFilter: (value, record) => record.isSuspended === value,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit User">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Check for Fraud">
                        <Button
                            icon={<SafetyOutlined />}
                            onClick={() => checkUserFraud(record._id)}
                            loading={checkingFraud[record._id]}
                            size="small"
                            type="primary"
                            danger={record.isFlaggedForFraud}
                        />
                    </Tooltip>
                    <Tooltip title="Delete User">
                        <Popconfirm
                            title="Are you sure you want to delete this user?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                            />
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
                            placeholder="Search by name or email"
                            prefix={<SearchOutlined />}
                            onChange={(e) => handleSearch(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Select
                            placeholder="Filter by fraud status"
                            style={{ width: "100%" }}
                            onChange={handleFilterChange}
                            allowClear
                        >
                            <Option value={true}>Flagged Users</Option>
                            <Option value={false}>Safe Users</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Button
                            type="primary"
                            icon={<SyncOutlined />}
                            onClick={fetchUsers}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                rowClassName={(record) =>
                    record.isFlaggedForFraud ? "bg-red-50" : ""
                }
            />

            <Modal
                title="Edit User"
                open={isModalVisible}
                onCancel={handleModalCancel}
                onOk={handleModalSave}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ ...editingUser }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fname"
                                label="First Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter first name",
                                    },
                                ]}
                            >
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="lname"
                                label="Last Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter last name",
                                    },
                                ]}
                            >
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Please enter email" },
                            {
                                type: "email",
                                message: "Please enter a valid email",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="numBookings"
                                label="Number of Bookings"
                                rules={[{ type: "number", min: 0 }]}
                            >
                                <Input type="number" min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="totalTicketsBought"
                                label="Total Tickets Bought"
                                rules={[{ type: "number", min: 0 }]}
                            >
                                <Input type="number" min={0} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="accountCreated"
                                label="Account Created Date"
                            >
                                <DatePicker style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="lastBookingDate"
                                label="Last Booking Date"
                            >
                                <DatePicker style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="isFlaggedForFraud"
                                label="Flagged for Fraud"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Yes"
                                    unCheckedChildren="No"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="isSuspended"
                                label="Account Suspended"
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
        </div>
    );
};

export default UsersList;
