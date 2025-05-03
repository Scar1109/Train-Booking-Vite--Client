import { useState, useEffect } from "react";
import { Card, Row, Col, DatePicker, Spin, Empty, Select } from "antd";
import axios from "axios";
import { Line, Pie, Column } from "@ant-design/plots";
import AxiosInstance from "../../AxiosInstance";

const { RangePicker } = DatePicker;
const { Option } = Select;

const FraudStats = () => {
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [timeFrame, setTimeFrame] = useState("daily");

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get("/api/bookings/getAll");
            if (response.data.success) {
                setBookings(response.data.bookings);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    const handleTimeFrameChange = (value) => {
        setTimeFrame(value);
    };

    // Filter bookings by date range if set
    const filteredBookings = bookings.filter((booking) => {
        if (!dateRange[0] || !dateRange[1]) return true;

        const bookingDate = new Date(booking.bookingTime);
        return (
            bookingDate >= dateRange[0].toDate() &&
            bookingDate <= dateRange[1].toDate()
        );
    });

    // Prepare data for fraud trend chart
    const getFraudTrendData = () => {
        if (filteredBookings.length === 0) return [];

        const dateFormat = {
            daily: { format: "YYYY-MM-DD", unit: "day" },
            weekly: { format: "YYYY-[W]WW", unit: "week" },
            monthly: { format: "YYYY-MM", unit: "month" },
        };

        const format = dateFormat[timeFrame].format;
        const groupedData = {};

        filteredBookings.forEach((booking) => {
            const date = new Date(booking.bookingTime);
            let key;

            if (timeFrame === "daily") {
                key = `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            } else if (timeFrame === "weekly") {
                // Get ISO week number
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
                const week =
                    Math.floor(
                        (d.getTime() -
                            new Date(d.getFullYear(), 0, 4).getTime()) /
                            86400000 /
                            7
                    ) + 1;
                key = `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
            } else if (timeFrame === "monthly") {
                key = `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`;
            }

            if (!groupedData[key]) {
                groupedData[key] = { date: key, total: 0, flagged: 0 };
            }

            groupedData[key].total += 1;
            if (booking.isFlaggedAsSuspicious) {
                groupedData[key].flagged += 1;
            }
        });

        // Convert to array and sort by date
        return Object.values(groupedData).sort((a, b) =>
            a.date.localeCompare(b.date)
        );
    };

    // Prepare data for payment method distribution
    const getPaymentMethodData = () => {
        if (filteredBookings.length === 0) return [];

        const paymentMethods = {};

        filteredBookings.forEach((booking) => {
            const method = booking.paymentMethod;
            if (!paymentMethods[method]) {
                paymentMethods[method] = {
                    type: formatPaymentMethod(method),
                    value: 0,
                    flagged: 0,
                };
            }

            paymentMethods[method].value += 1;
            if (booking.isFlaggedAsSuspicious) {
                paymentMethods[method].flagged += 1;
            }
        });

        return Object.values(paymentMethods);
    };

    // Format payment method for display
    const formatPaymentMethod = (method) => {
        switch (method) {
            case "credit_card":
                return "Credit Card";
            case "debit_card":
                return "Debit Card";
            case "paypal":
                return "PayPal";
            default:
                return method;
        }
    };

    // Prepare data for ticket quantity distribution
    const getTicketQuantityData = () => {
        if (filteredBookings.length === 0) return [];

        const quantities = {};

        filteredBookings.forEach((booking) => {
            const numTickets = booking.numTickets;
            let category;

            if (numTickets === 1) category = "1";
            else if (numTickets === 2) category = "2";
            else if (numTickets <= 5) category = "3-5";
            else if (numTickets <= 10) category = "6-10";
            else category = "10+";

            if (!quantities[category]) {
                quantities[category] = {
                    category,
                    total: 0,
                    flagged: 0,
                    flaggedPercentage: 0,
                };
            }

            quantities[category].total += 1;
            if (booking.isFlaggedAsSuspicious) {
                quantities[category].flagged += 1;
            }
        });

        // Calculate percentages
        Object.values(quantities).forEach((item) => {
            item.flaggedPercentage =
                item.total > 0 ? (item.flagged / item.total) * 100 : 0;
        });

        // Convert to array and sort by category
        return Object.values(quantities).sort((a, b) => {
            if (a.category === "10+") return 1;
            if (b.category === "10+") return -1;
            return a.category.localeCompare(b.category);
        });
    };

    const fraudTrendData = getFraudTrendData();
    const paymentMethodData = getPaymentMethodData();
    const ticketQuantityData = getTicketQuantityData();

    const lineConfig = {
        data: fraudTrendData,
        xField: "date",
        yField: "flagged",
        seriesField: "type",
        point: {
            size: 5,
            shape: "diamond",
        },
        label: {
            style: {
                fill: "#aaa",
            },
        },
    };

    const pieConfig = {
        appendPadding: 10,
        data: paymentMethodData,
        angleField: "value",
        colorField: "type",
        radius: 0.8,
        label: {
            type: "outer",
            content: "{name} {percentage}",
        },
        interactions: [
            {
                type: "pie-legend-active",
            },
            {
                type: "element-active",
            },
        ],
    };

    const columnConfig = {
        data: ticketQuantityData,
        xField: "category",
        yField: "flaggedPercentage",
        label: {
            position: "middle",
            style: {
                fill: "#FFFFFF",
                opacity: 0.6,
            },
        },
        meta: {
            flaggedPercentage: {
                alias: "Flagged Percentage",
            },
        },
        color: ({ flaggedPercentage }) => {
            if (flaggedPercentage > 50) return "#ff4d4f";
            if (flaggedPercentage > 25) return "#faad14";
            return "#52c41a";
        },
    };

    return (
        <div>
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <RangePicker
                            style={{ width: "100%" }}
                            onChange={handleDateRangeChange}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            defaultValue="daily"
                            style={{ width: "100%" }}
                            onChange={handleTimeFrameChange}
                        >
                            <Option value="daily">Daily</Option>
                            <Option value="weekly">Weekly</Option>
                            <Option value="monthly">Monthly</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title="Fraud Trend">
                            {fraudTrendData.length > 0 ? (
                                <Line {...lineConfig} />
                            ) : (
                                <Empty description="No data available" />
                            )}
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Payment Method Distribution">
                            {paymentMethodData.length > 0 ? (
                                <Pie {...pieConfig} />
                            ) : (
                                <Empty description="No data available" />
                            )}
                        </Card>
                    </Col>
                    <Col xs={24}>
                        <Card title="Ticket Quantity and Fraud Rate">
                            {ticketQuantityData.length > 0 ? (
                                <Column {...columnConfig} />
                            ) : (
                                <Empty description="No data available" />
                            )}
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default FraudStats;
