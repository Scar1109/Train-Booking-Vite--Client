import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Popconfirm,
    Tag,
    message,
    Modal,
    Form,
    Input,
    Space,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    StopOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import { Icon } from "@iconify/react";
import AxiosInstance from "../../AxiosInstance";

function Users() {
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        try {
            const response = await AxiosInstance.get("/api/users/getAllUsers");
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            message.error("Failed to load users.");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        try {
            await AxiosInstance.delete(`/api/users/deleteUser/${id}`);
            setUsers((prev) => prev.filter((user) => user._id !== id));
            message.success("User deleted successfully.");
        } catch (error) {
            console.error("Error deleting user:", error);
            message.error("Failed to delete user.");
        }
    };

    const showEditModal = (user) => {
        setEditingUser(user);
        form.setFieldsValue(user);
        setIsModalVisible(true);
    };

    const showAddModal = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const handleModalSave = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser) {
                const response = await AxiosInstance.put(
                    `/api/users/updateUser/${editingUser._id}`,
                    { ...editingUser, ...values }
                );
                if (response.data.success) {
                    message.success("User updated successfully.");
                    fetchUsers();
                }
            } else {
                const response = await AxiosInstance.post(
                    "/api/users/createUser",
                    values
                );
                if (response.data.success) {
                    message.success("User added successfully.");
                    fetchUsers();
                }
            }
            setIsModalVisible(false);
        } catch (error) {
            console.error("Error saving user:", error);
            message.error("Operation failed.");
        }
    };

    const toggleUserStatus = async () => {
        if (!editingUser) return;
        try {
            const updated = {
                ...editingUser,
                isSuspended: !editingUser.isSuspended,
            };
            const response = await AxiosInstance.put(
                `/api/users/updateUser/${editingUser._id}`,
                updated
            );
            if (response.data.success) {
                message.success(
                    `User ${
                        updated.isSuspended ? "suspended" : "activated"
                    } successfully.`
                );
                fetchUsers();
                setEditingUser(updated);
                form.setFieldsValue(updated);
            }
        } catch (error) {
            console.error("Failed to update user status", error);
            message.error("Failed to update status.");
        }
    };

    const columns = [
        { title: "First Name", dataIndex: "fname", key: "fname" },
        { title: "Last Name", dataIndex: "lname", key: "lname" },
        { title: "Email", dataIndex: "email", key: "email" },
        {
            title: "Account Created",
            dataIndex: "accountCreated",
            render: (text) =>
                text ? new Date(text).toLocaleDateString() : "N/A",
        },
        { title: "Bookings", dataIndex: "numBookings" },
        { title: "Total Tickets", dataIndex: "totalTicketsBought" },
        {
            title: "Last Booking",
            dataIndex: "lastBookingDate",
            render: (text) =>
                text ? new Date(text).toLocaleDateString() : "N/A",
        },
        {
            title: "Fraud Status",
            render: (_, record) => (
                <Tag color={record.isFlaggedForFraud ? "red" : "green"}>
                    {record.isFlaggedForFraud ? "Flagged" : "Safe"}
                </Tag>
            ),
        },
        {
            title: "Status",
            render: (_, record) => (
                <Tag color={record.isSuspended ? "volcano" : "blue"}>
                    {record.isSuspended ? "Suspended" : "Active"}
                </Tag>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <div className="flex flex-row">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                    />
                    <Popconfirm
                        title="Are you sure you want to delete this user?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            className="ml-2"
                        />
                    </Popconfirm>
                    <Button
                        icon={<Icon icon="mdi:incognito" />}
                        onClick={() =>
                            message.info(
                                `Viewing details for ${record.ticketId}`
                            )
                        }
                        disabled={record.isRefunded}
                        type="default"
                        className="ml-2"
                    ></Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Users</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showAddModal}
                >
                    Add User
                </Button>
            </div>

            <Table columns={columns} dataSource={users} rowKey="_id" />

            <Modal
                title={editingUser ? "Edit User" : "Add User"}
                visible={isModalVisible}
                onCancel={handleModalCancel}
                onOk={handleModalSave}
                okText="Save"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="First Name"
                        name="fname"
                        rules={[
                            {
                                required: true,
                                message: "Please enter first name",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Last Name"
                        name="lname"
                        rules={[
                            {
                                required: true,
                                message: "Please enter last name",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Please enter email" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    {!editingUser && (
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter password",
                                },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}

                    {editingUser && (
                        <Form.Item label="User Status">
                            <Space>
                                <Button
                                    type={
                                        editingUser.isSuspended
                                            ? "default"
                                            : "primary"
                                    }
                                    danger={editingUser.isSuspended}
                                    icon={
                                        editingUser.isSuspended ? (
                                            <CheckOutlined />
                                        ) : (
                                            <StopOutlined />
                                        )
                                    }
                                    onClick={toggleUserStatus}
                                >
                                    {editingUser.isSuspended
                                        ? "Activate User"
                                        : "Suspend User"}
                                </Button>
                            </Space>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
}

export default Users;
