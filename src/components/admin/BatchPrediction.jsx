import { useState } from "react";
import {
    Card,
    Button,
    Alert,
    Progress,
    Steps,
    Typography,
    Table,
    Tag,
    message,
    Row,
    Col,
} from "antd";
import {
    SyncOutlined,
    CheckCircleOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import axios from "axios";
import AxiosInstance from "../../AxiosInstance";

const { Title, Text } = Typography;
const { Step } = Steps;

// Create axios instance only for the model
const modelApi = axios.create({
    baseURL: "http://localhost:5000",
});

const BatchPrediction = ({ refreshDashboard }) => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const runBatchPrediction = async () => {
        setLoading(true);
        setCurrentStep(0);
        setProgress(0);
        setResults(null);
        setError(null);

        try {
            // Step 1: Fetch all bookings and users
            setCurrentStep(1);

            const [bookingsResponse, usersResponse] = await Promise.all([
                AxiosInstance.get("/api/bookings/getAll"),
                AxiosInstance.get("/api/users/getAllUsers"),
            ]);

            if (!bookingsResponse.data.success || !usersResponse.data.success) {
                throw new Error("Failed to fetch data from backend");
            }

            const bookings = bookingsResponse.data.bookings;
            const users = usersResponse.data.users;

            setProgress(20);

            // Step 2: Prepare data for batch prediction
            setCurrentStep(2);

            // Prepare user data for fraud detection
            const userData = users.map((user) => ({
                user_id: user._id,
                total_tickets: user.totalTicketsBought || 0,
                booking_count: user.numBookings || 0,
                distinct_payment_methods: 1, // Default value
                distinct_ip_addresses: 1, // Default value
                payment_method: "credit_card", // Default value
                ip_address: "127.0.0.1", // Default value
            }));

            // Prepare booking data for fraud detection
            const bookingData = bookings.map((booking) => {
                const user = users.find((u) => u._id === booking.userId);
                return {
                    booking_id: booking._id,
                    num_tickets: booking.numTickets,
                    payment_method: booking.paymentMethod,
                    ip_address: booking.ipAddress,
                    user_booking_count: user ? user.numBookings || 0 : 0,
                    user_avg_tickets:
                        user && user.numBookings > 0
                            ? user.totalTicketsBought / user.numBookings
                            : 0,
                };
            });

            setProgress(40);

            // Step 3: Run batch prediction
            setCurrentStep(3);

            // Call the fraud detection model for users
            const userPredictionResponse = await modelApi.post(
                "/predict_user",
                userData
            );

            // Call the fraud detection model for bookings
            const bookingPredictionResponse = await modelApi.post(
                "/predict_booking",
                bookingData
            );

            if (
                !userPredictionResponse.data ||
                !bookingPredictionResponse.data
            ) {
                throw new Error("Failed to get prediction results from model");
            }

            setProgress(70);

            // Step 4: Process results and update database
            setCurrentStep(4);

            const userPredictions =
                userPredictionResponse.data.user_fraud_prediction;
            const bookingPredictions =
                bookingPredictionResponse.data.booking_fraud_prediction;

            // Update users with fraud predictions
            const userUpdatePromises = userPredictions.map(
                (prediction, index) => {
                    const userId = userData[index].user_id;
                    return AxiosInstance.put(
                        `/api/users/updateUser/${userId}`,
                        {
                            isFlaggedForFraud: prediction === 1,
                        }
                    );
                }
            );

            // Update bookings with fraud predictions
            const bookingUpdatePromises = bookingPredictions.map(
                (prediction, index) => {
                    const bookingId = bookingData[index].booking_id;
                    return AxiosInstance.put(
                        `/api/bookings/update/${bookingId}`,
                        {
                            isFlaggedAsSuspicious: prediction === 1,
                        }
                    );
                }
            );

            await Promise.all([
                ...userUpdatePromises,
                ...bookingUpdatePromises,
            ]);

            setProgress(90);

            // Step 5: Compile results
            setCurrentStep(5);

            const flaggedUsers = userPredictions.filter((p) => p === 1).length;
            const flaggedBookings = bookingPredictions.filter(
                (p) => p === 1
            ).length;

            // Get the flagged users and bookings for display
            const flaggedUserDetails = users
                .filter((_, index) => userPredictions[index] === 1)
                .slice(0, 10);

            const flaggedBookingDetails = bookings
                .filter((_, index) => bookingPredictions[index] === 1)
                .slice(0, 10);

            const results = {
                totalUsers: users.length,
                flaggedUsers: flaggedUsers,
                flaggedUserPercentage: (flaggedUsers / users.length) * 100,
                totalBookings: bookings.length,
                flaggedBookings: flaggedBookings,
                flaggedBookingPercentage:
                    (flaggedBookings / bookings.length) * 100,
                detailedResults: {
                    users: flaggedUserDetails,
                    bookings: flaggedBookingDetails,
                },
            };

            setResults(results);
            setProgress(100);

            // Refresh dashboard data
            refreshDashboard();

            message.success("Batch prediction completed successfully");
        } catch (error) {
            console.error("Error running batch prediction:", error);
            setError(
                error.message || "An error occurred during batch prediction"
            );
            message.error("Failed to complete batch prediction");
        } finally {
            setLoading(false);
        }
    };

    const userColumns = [
        {
            title: "Name",
            key: "name",
            render: (_, record) => `${record.fname} ${record.lname}`,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Bookings",
            dataIndex: "numBookings",
            key: "numBookings",
        },
        {
            title: "Total Tickets",
            dataIndex: "totalTicketsBought",
            key: "totalTicketsBought",
        },
        {
            title: "Fraud Status",
            dataIndex: "isFlaggedForFraud",
            key: "isFlagForFraud",
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
        },
    ];

    const bookingColumns = [
        {
            title: "Ticket ID",
            dataIndex: "ticketId",
            key: "ticketId",
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
            title: "Fraud Status",
            dataIndex: "isFlaggedAsSuspicious",
            key: "isFlaggedAsSuspicious",
            render: (value) => (
                <Tag
                    color={value ? "red" : "green"}
                    icon={value ? <WarningOutlined /> : <CheckCircleOutlined />}
                >
                    {value ? "Flagged" : "Safe"}
                </Tag>
            ),
        },
    ];

    return (
        <div>
            <Card>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <Title level={3}>Batch Fraud Detection</Title>
                    <Text>
                        Run fraud detection on all users and bookings in the
                        system. This will update the fraud status for all
                        records.
                    </Text>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<SyncOutlined />}
                        onClick={runBatchPrediction}
                        loading={loading}
                        block
                    >
                        Run Batch Prediction
                    </Button>
                </div>

                {loading && (
                    <div style={{ marginBottom: 24 }}>
                        <Steps
                            current={currentStep}
                            style={{ marginBottom: 16 }}
                        >
                            <Step
                                title="Initialize"
                                description="Preparing batch job"
                            />
                            <Step
                                title="Fetch Data"
                                description="Getting users and bookings"
                            />
                            <Step
                                title="Prepare Data"
                                description="Formatting for prediction"
                            />
                            <Step
                                title="Run Prediction"
                                description="Processing with ML model"
                            />
                            <Step
                                title="Update Records"
                                description="Saving results"
                            />
                            <Step
                                title="Complete"
                                description="Finalizing results"
                            />
                        </Steps>
                        <Progress percent={progress} status="active" />
                    </div>
                )}

                {error && (
                    <Alert
                        message="Batch Prediction Error"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                {results && (
                    <div>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                                <Card title="User Results">
                                    <div
                                        style={{
                                            textAlign: "center",
                                            marginBottom: 16,
                                        }}
                                    >
                                        <Title level={4}>
                                            {results.flaggedUsers} of{" "}
                                            {results.totalUsers} Users Flagged
                                        </Title>
                                        <Progress
                                            type="circle"
                                            percent={Math.round(
                                                results.flaggedUserPercentage
                                            )}
                                            status={
                                                results.flaggedUserPercentage >
                                                20
                                                    ? "exception"
                                                    : "success"
                                            }
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={12}>
                                <Card title="Booking Results">
                                    <div
                                        style={{
                                            textAlign: "center",
                                            marginBottom: 16,
                                        }}
                                    >
                                        <Title level={4}>
                                            {results.flaggedBookings} of{" "}
                                            {results.totalBookings} Bookings
                                            Flagged
                                        </Title>
                                        <Progress
                                            type="circle"
                                            percent={Math.round(
                                                results.flaggedBookingPercentage
                                            )}
                                            status={
                                                results.flaggedBookingPercentage >
                                                20
                                                    ? "exception"
                                                    : "success"
                                            }
                                        />
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <div style={{ marginTop: 24 }}>
                            <Title level={4}>Flagged Users</Title>
                            {results.detailedResults.users.length > 0 ? (
                                <Table
                                    columns={userColumns}
                                    dataSource={results.detailedResults.users}
                                    rowKey="_id"
                                    pagination={false}
                                    size="small"
                                />
                            ) : (
                                <Alert
                                    message="No users were flagged as fraudulent"
                                    type="info"
                                    showIcon
                                />
                            )}
                        </div>

                        <div style={{ marginTop: 24 }}>
                            <Title level={4}>Flagged Bookings</Title>
                            {results.detailedResults.bookings.length > 0 ? (
                                <Table
                                    columns={bookingColumns}
                                    dataSource={
                                        results.detailedResults.bookings
                                    }
                                    rowKey="_id"
                                    pagination={false}
                                    size="small"
                                />
                            ) : (
                                <Alert
                                    message="No bookings were flagged as suspicious"
                                    type="info"
                                    showIcon
                                />
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default BatchPrediction;
