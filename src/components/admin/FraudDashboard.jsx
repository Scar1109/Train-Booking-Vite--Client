import { useState, useEffect } from "react";
import {
    Layout,
    Typography,
    Row,
    Col,
    Card,
    Statistic,
    Button,
    Spin,
    message,
    Tabs,
} from "antd";
import {
    WarningOutlined,
    SyncOutlined,
    DashboardOutlined,
    UserOutlined,
    FileTextOutlined,
    ApiOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ModelStatus from "./ModelStatus";
import UsersList from "./UsersList";
import BookingsList from "./BookingsList";
import FraudStats from "./FraudStats";
import BatchPrediction from "./BatchPrediction";
import AxiosInstance from "../../AxiosInstance";

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const FraudDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalBookings: 0,
        flaggedBookings: 0,
        flaggedPercentage: 0,
        totalUsers: 0,
        flaggedUsers: 0,
        flaggedUserPercentage: 0,
    });
    const [modelStatus, setModelStatus] = useState({
        userModel: { status: "unknown", accuracy: 0 },
        bookingModel: { status: "unknown", accuracy: 0 },
    });
    const [activeTab, setActiveTab] = useState("1");

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch all bookings from backend
            const bookingsResponse = await AxiosInstance.get("/api/bookings/getAll");

            // Fetch all users from backend
            const usersResponse = await AxiosInstance.get("/api/users/getAllUsers");

            if (bookingsResponse.data.success && usersResponse.data.success) {
                const bookings = bookingsResponse.data.bookings;
                const users = usersResponse.data.users;

                // Calculate statistics
                const flaggedBookings = bookings.filter(
                    (booking) => booking.isFlaggedAsSuspicious
                );
                const flaggedPercentage =
                    bookings.length > 0
                        ? (flaggedBookings.length / bookings.length) * 100
                        : 0;

                const flaggedUsers = users.filter(
                    (user) => user.isFlaggedForFraud
                );
                const flaggedUserPercentage =
                    users.length > 0
                        ? (flaggedUsers.length / users.length) * 100
                        : 0;

                setStats({
                    totalBookings: bookings.length,
                    flaggedBookings: flaggedBookings.length,
                    flaggedPercentage: flaggedPercentage,
                    totalUsers: users.length,
                    flaggedUsers: flaggedUsers.length,
                    flaggedUserPercentage: flaggedUserPercentage,
                });
            }

            // Check model status by connecting to the fraud detection model
            try {
                // Connect to the fraud detection model on port 5000
                const modelResponse = await axios.get(
                    "http://localhost:5000/health"
                );
                if (modelResponse.data.status === "ok") {
                    setModelStatus({
                        userModel: { status: "operational", accuracy: 0.92 },
                        bookingModel: { status: "operational", accuracy: 0.89 },
                    });
                }
            } catch (error) {
                console.error(
                    "Error connecting to fraud detection model:",
                    error
                );
                setModelStatus({
                    userModel: { status: "offline", accuracy: 0 },
                    bookingModel: { status: "offline", accuracy: 0 },
                });
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            message.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // Refresh data every 5 minutes
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 300000);

        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    return (
        <Layout className="site-layout" style={{ minHeight: "100vh" }}>
            <Content style={{ margin: "0 16px" }}>
                <div
                    className="site-layout-background"
                    style={{ padding: 24, minHeight: 360 }}
                >
                    <div
                        className="dashboard-header"
                        style={{ marginBottom: 24 }}
                    >
                        <Row
                            gutter={[16, 16]}
                            align="middle"
                            justify="space-between"
                        >
                            <Col>
                                <Title level={2}>
                                    <DashboardOutlined /> Fraud Detection
                                    Dashboard
                                </Title>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    icon={<SyncOutlined />}
                                    loading={loading}
                                    onClick={fetchDashboardData}
                                >
                                    Refresh Data
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    <Spin spinning={loading} tip="Loading dashboard data...">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Total Bookings"
                                        value={stats.totalBookings}
                                        precision={0}
                                        valueStyle={{ color: "#3f8600" }}
                                        prefix={<FileTextOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Flagged Bookings"
                                        value={stats.flaggedBookings}
                                        precision={0}
                                        valueStyle={{ color: "#cf1322" }}
                                        prefix={<WarningOutlined />}
                                        suffix={`(${stats.flaggedPercentage.toFixed(
                                            1
                                        )}%)`}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Total Users"
                                        value={stats.totalUsers}
                                        precision={0}
                                        valueStyle={{ color: "#3f8600" }}
                                        prefix={<UserOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Flagged Users"
                                        value={stats.flaggedUsers}
                                        precision={0}
                                        valueStyle={{ color: "#cf1322" }}
                                        prefix={<WarningOutlined />}
                                        suffix={`(${stats.flaggedUserPercentage.toFixed(
                                            1
                                        )}%)`}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <div style={{ marginTop: 24 }}>
                            <Tabs
                                activeKey={activeTab}
                                onChange={handleTabChange}
                                type="card"
                            >
                                <TabPane
                                    tab={
                                        <span>
                                            <DashboardOutlined /> Dashboard
                                        </span>
                                    }
                                    key="1"
                                >
                                    <FraudStats />
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span>
                                            <UserOutlined /> Users
                                        </span>
                                    }
                                    key="2"
                                >
                                    <UsersList
                                        refreshDashboard={fetchDashboardData}
                                    />
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span>
                                            <FileTextOutlined /> Bookings
                                        </span>
                                    }
                                    key="3"
                                >
                                    <BookingsList
                                        refreshDashboard={fetchDashboardData}
                                    />
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span>
                                            <ApiOutlined /> Model Status
                                        </span>
                                    }
                                    key="4"
                                >
                                    <ModelStatus modelStatus={modelStatus} />
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span>
                                            <SyncOutlined /> Batch Prediction
                                        </span>
                                    }
                                    key="5"
                                >
                                    <BatchPrediction
                                        refreshDashboard={fetchDashboardData}
                                    />
                                </TabPane>
                            </Tabs>
                        </div>
                    </Spin>
                </div>
            </Content>
        </Layout>
    );
};

export default FraudDashboard;
