import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    TimePicker,
    InputNumber,
    message,
    Popconfirm,
} from "antd";
import {
    PlusOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import AxiosInstance from "../../AxiosInstance";

function TrainList() {
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [sortField, setSortField] = useState("name");
    const [sortOrder, setSortOrder] = useState("ascend");
    const [editingTrain, setEditingTrain] = useState(null);

    const fetchTrains = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(
                `/api/trains?page=${page}&limit=${pageSize}`
            );
            if (response.data.success) {
                setTrains(response.data.trains);
                setPagination({
                    ...pagination,
                    current: page,
                    total: response.data.pagination.total,
                });
            } else {
                message.error("Failed to load train data");
            }
        } catch (error) {
            console.error("Error fetching trains:", error);
            message.error("Failed to load train data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrains();
    }, []);

    const handleTableChange = (pagination, filters, sorter) => {
        setSortField(sorter.field || "name");
        setSortOrder(sorter.order || "ascend");
        fetchTrains(pagination.current, pagination.pageSize);
    };

    const showModal = () => {
        form.resetFields();
        setEditingTrain(null);
        setIsModalVisible(true);
    };

    const showEditModal = (record) => {
        setEditingTrain(record);
        form.setFieldsValue({
            ...record,
            departureTime: dayjs(record.departureTime, "HH:mm"),
            arrivalTime: dayjs(record.arrivalTime, "HH:mm"),
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingTrain(null);
    };

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${API_URL}/trains/${id}`);
            if (res.data.success) {
                message.success("Train deleted successfully");
                fetchTrains();
            } else {
                message.error("Failed to delete train");
            }
        } catch (error) {
            message.error("Failed to delete train");
        }
    };

    const handleSubmit = async (values) => {
        try {
            const formattedValues = {
                name: values.name,
                route: {
                    from: values.route.from,
                    to: values.route.to,
                },
                departureTime: values.departureTime
                    ? values.departureTime.format("HH:mm")
                    : "",
                arrivalTime: values.arrivalTime
                    ? values.arrivalTime.format("HH:mm")
                    : "",
                classes: values.classes.map((cls) => ({
                    type: cls.type,
                    capacity: cls.capacity,
                    available: cls.available,
                    price: cls.price,
                })),
            };

            let response;
            if (editingTrain) {
                response = await axios.put(
                    `${API_URL}/trains/${editingTrain._id}`,
                    formattedValues
                );
            } else {
                response = await axios.post(`${API_URL}/trains`, formattedValues);
            }

            if (response.data.success) {
                message.success({
                    content: editingTrain
                        ? "🚆 Train updated successfully!"
                        : "🚆 Train added successfully!",
                    duration: 2,
                });
                setIsModalVisible(false);
                fetchTrains();
            } else {
                message.error({
                    content: response.data.message || "Failed to save train",
                    duration: 2,
                });
            }
        } catch (error) {
            console.error("Error saving train:", error);
            message.error({
                content: "❌ Failed to save train. Please try again.",
                duration: 2,
            });
        }
    };

    const colorMap = {
        "Air Conditioned Saloon": "bg-indigo-500 text-white",
        "Second Class Reserved Seats": "bg-emerald-500 text-white",
        "Third Class Sleeperetts": "bg-purple-600 text-white",
        "Third Class Reserved Seats": "bg-blue-900 text-white",
    };

    const columns = [
        {
            title: "Train Name",
            dataIndex: "name",
            key: "name",
            sorter: true,
        },
        {
            title: "Departs",
            dataIndex: "departureTime",
            key: "departureTime",
            sorter: true,
        },
        {
            title: "Arrives",
            dataIndex: "arrivalTime",
            key: "arrivalTime",
            sorter: true,
        },
        {
            title: "Class & Seats",
            key: "class",
            render: (text, record) => (
                <div className="flex flex-col gap-1">
                    {record.classes.map(cls => (
                        <div
                            key={cls.type}
                            className={`px-3 py-1 rounded inline-flex items-center ${colorMap[cls.type] || "bg-gray-500 text-white"}`}
                        >
                            {cls.type} <span className="ml-2 bg-white text-black px-2 py-0.5 rounded text-sm">{cls.capacity} seats</span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: "Available",
            key: "available",
            render: (text, record) => (
                <div className="flex flex-col gap-1">
                    {record.classes.map(cls => (
                        <div key={cls.type}>{cls.available}</div>
                    ))}
                </div>
            ),
        },
        {
            title: "Price",
            key: "price",
            render: (text, record) => (
                <div className="flex flex-col gap-1">
                    {record.classes.map(cls => (
                        <div key={cls.type}>LKR {cls.price}</div>
                    ))}
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                        className="mr-2"
                    />
                    <Popconfirm
                        title="Are you sure to delete this train?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </>
            ),
        },
    ];

    const expandedRowRender = (record) => {
        const classColumns = [
            // {
            //     title: "Class",
            //     dataIndex: "type",
            //     key: "type",
            //     render: (text, classRecord) => {
            //         const colorMap = {
            //             "Air Conditioned Saloon": "bg-indigo-500 text-white",
            //             "Second Class Reserved Seats": "bg-emerald-500 text-white",
            //             "Third Class Sleeperetts": "bg-purple-600 text-white",
            //             "Third Class Reserved Seats": "bg-blue-900 text-white",
            //         };

            //         return (
            //             <div
            //                 className={`px-3 py-1 rounded inline-flex items-center ${
            //                     colorMap[text] || "bg-gray-500 text-white"
            //                 }`}
            //             >
            //                 {text}
            //                 <span className="ml-2 bg-white text-black px-2 py-0.5 rounded text-sm">
            //                     {classRecord.capacity}
            //                 </span>
            //             </div>
            //         );
            //     },
            // },
            // {
            //     title: "Available",
            //     dataIndex: "available",
            //     key: "available",
            //     className: "text-center",
            // },
            
        ];

        // return (
        //     <Table
        //         columns={classColumns}
        //         dataSource={record.classes}
        //         pagination={false}
        //         rowKey="type"
        //     />
        // );
    };

    const ClassFormItems = () => {
        return (
            <Form.List name="classes">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <div
                                key={key}
                                className="flex flex-wrap gap-2 items-start mb-4"
                            >
                                <Form.Item
                                    {...restField}
                                    name={[name, "type"]}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Class type is required",
                                        },
                                    ]}
                                    className="w-full md:w-64"
                                >
                                    <Select placeholder="Select class type">
                                        <Select.Option value="Air Conditioned Saloon">
                                            Air Conditioned Saloon
                                        </Select.Option>
                                        <Select.Option value="Second Class Reserved Seats">
                                            Second Class Reserved Seats
                                        </Select.Option>
                                        <Select.Option value="Third Class Sleeperetts">
                                            Third Class Sleeperetts
                                        </Select.Option>
                                        <Select.Option value="Third Class Reserved Seats">
                                            Third Class Reserved Seats
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, "capacity"]}
                                    label="Capacity"
                                    rules={[{ required: true, message: "Required" }]}
                                >
                                    <InputNumber min={1} placeholder="Capacity" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, "available"]}
                                    label="Available"
                                    rules={[{ required: true, message: "Required" }]}
                                >
                                    <InputNumber min={0} placeholder="Available" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, "price"]}
                                    label="Price (LKR)"
                                    rules={[{ required: true, message: "Required" }]}
                                >
                                    <InputNumber
                                        min={0}
                                        step={100}
                                        formatter={(value) =>
                                            `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                        }
                                        parser={(value) =>
                                            value.replace(/LKR\\s?|(,*)/g, "")
                                        }
                                    />
                                </Form.Item>
                                <Button
                                    type="text"
                                    danger
                                    onClick={() => remove(name)}
                                    className="mt-7"
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Form.Item>
                            <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                            >
                                Add Class
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Train Listings</h1>
                <Button
                    type="primary"
                    onClick={showModal}
                    className="bg-blue-600 hover:bg-blue-700"
                    icon={<PlusOutlined />}
                >
                    Add Train
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow">
                <Table
                    columns={columns}
                    dataSource={trains}
                    rowKey="_id"
                    expandable={{
                        expandedRowRender,
                        expandRowByClick: true,
                    }}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} items`,
                    }}
                    onChange={handleTableChange}
                    loading={loading}
                    className="border border-gray-200 rounded-lg"
                    scroll={{ x: "max-content" }}
                />
            </div>

            <Modal
                title={editingTrain ? "Edit Train" : "Add New Train"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        classes: [
                            {
                                type: undefined,
                                capacity: undefined,
                                available: undefined,
                                price: undefined,
                            },
                        ],
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Train Name"
                        rules={[
                            {
                                required: true,
                                message: "Please enter train name",
                            },
                        ]}
                    >
                        <Input placeholder="e.g., 1 Special 01" />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name={["route", "from"]}
                            label="From"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter departure station",
                                },
                            ]}
                        >
                            <Input placeholder="e.g., Colombo Fort" />
                        </Form.Item>

                        <Form.Item
                            name={["route", "to"]}
                            label="To"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter arrival station",
                                },
                            ]}
                        >
                            <Input placeholder="e.g., Badulla" />
                        </Form.Item>

                        <Form.Item
                            name="departureTime"
                            label="Departure Time"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select departure time",
                                },
                            ]}
                        >
                            <TimePicker format="HH:mm" className="w-full" />
                        </Form.Item>

                        <Form.Item
                            name="arrivalTime"
                            label="Arrival Time"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select arrival time",
                                },
                            ]}
                        >
                            <TimePicker format="HH:mm" className="w-full" />
                        </Form.Item>
                    </div>

                    <div className="border-t border-gray-200 my-4 pt-4">
                        <h3 className="font-medium mb-3">Class Details</h3>
                        <ClassFormItems />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {editingTrain ? "Update Train" : "Save Train"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default TrainList;
