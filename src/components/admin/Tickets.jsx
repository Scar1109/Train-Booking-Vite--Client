import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Popconfirm,
    Tag,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
} from "antd";
import {
    EditOutlined,
    StopOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import AxiosInstance from "../../AxiosInstance";

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);
    const [form] = Form.useForm();

    const fetchTickets = async () => {
        try {
            const response = await AxiosInstance.get("/api/bookings/getAll");
            console.log("Fetched bookings:", response.data); // ✅ ADD THIS
            if (response.data.success) {
                setTickets(response.data.bookings);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            message.error("Failed to load tickets.");
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const showEditModal = (ticket) => {
        setEditingTicket(ticket);
        form.setFieldsValue(ticket);
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingTicket(null);
    };

    const handleModalSave = async () => {
        try {
            const values = await form.validateFields();
            const response = await AxiosInstance.put(`/api/bookings/update/${editingTicket._id}`, values);
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
            const response = await AxiosInstance.patch(`/api/bookings/cancel/${id}`);
            if (response.data.success) {
                message.success("Ticket cancelled.");
                fetchTickets();
            }
        } catch (error) {
            console.error("Cancel failed", error);
            message.error("Failed to cancel ticket.");
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
            render: (text) => text ? new Date(text).toLocaleString() : "N/A",
        },
        {
            title: "Suspicious",
            dataIndex: "isFlaggedAsSuspicious",
            key: "isFlaggedAsSuspicious",
            render: (value) => (
                <Tag color={value ? "red" : "green"}>
                    {value ? "Flagged" : "Safe"}
                </Tag>
            ),
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
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tickets</h2>
            </div>

            <Table
                columns={columns}
                dataSource={tickets}
                rowKey="_id"
                rowClassName={(record) =>
                    record.isRefunded ? "bg-gray-100 text-gray-400" : ""
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
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>
                    <Form.Item
                        label="Payment Method"
                        name="paymentMethod"
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <Select>
                            <Select.Option value="credit_card">Credit Card</Select.Option>
                            <Select.Option value="debit_card">Debit Card</Select.Option>
                            <Select.Option value="paypal">PayPal</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Price"
                        name="price"
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <InputNumber prefix="LKR " min={0} className="w-full" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Tickets;
