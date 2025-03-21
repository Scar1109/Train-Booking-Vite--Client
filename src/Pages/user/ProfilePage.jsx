import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Layout,
  Menu,
  Card,
  Avatar,
  Tabs,
  Button,
  Input,
  Modal,
  Table,
  Divider,
  Typography,
  Space,
  Tag,
  Form,
  Alert,
  Descriptions,
  Image,
} from "antd"
import {
  UserOutlined,
  EditOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  HomeOutlined,
} from "@ant-design/icons"
import NavBar from "../../components/Navbar"

// ========== Constants & Mock Data ==========
const { Header, Sider, Content } = Layout
const { Title, Text } = Typography
const { TabPane } = Tabs
const { SubMenu } = Menu

// Mock user data
const mockUser = {
  id: "USR12345",
  name: "Sanjay Perera",
  email: "sanjay.perera@example.com",
  phone: "+94 77 123 4567",
  nic: "901234567V",
  address: "123 Galle Road, Colombo 03, Sri Lanka",
  profileImage: "/placeholder.svg?height=100&width=100",
  verificationStatus: "verified",
  memberSince: "January 2023",
  trustScore: 95,
  bookingLimit: 4,
  lastLogin: "2023-05-15T08:30:00Z",
}

// Mock tickets data
const mockTickets = [
  {
    id: "TKT78901",
    from: "Colombo Fort",
    to: "Kandy",
    date: "2023-05-20",
    departureTime: "08:30",
    arrivalTime: "11:45",
    trainName: "Intercity Express",
    trainNumber: "IC-1024",
    seatNumber: "A12",
    class: "First Class",
    status: "upcoming",
    price: 1200,
    purchaseDate: "2023-05-10T14:30:00Z",
    qrCode: "/placeholder.svg?height=150&width=150",
  },
  {
    id: "TKT78902",
    from: "Colombo Fort",
    to: "Galle",
    date: "2023-05-15",
    departureTime: "10:00",
    arrivalTime: "12:30",
    trainName: "Coastal Line Express",
    trainNumber: "CL-2045",
    seatNumber: "B08",
    class: "Second Class",
    status: "completed",
    price: 800,
    purchaseDate: "2023-05-05T09:15:00Z",
    qrCode: "/placeholder.svg?height=150&width=150",
  },
  {
    id: "TKT78903",
    from: "Kandy",
    to: "Colombo Fort",
    date: "2023-05-10",
    departureTime: "16:00",
    arrivalTime: "19:15",
    trainName: "Intercity Express",
    trainNumber: "IC-1025",
    seatNumber: "C04",
    class: "First Class",
    status: "completed",
    price: 1200,
    purchaseDate: "2023-04-30T11:45:00Z",
    qrCode: "/placeholder.svg?height=150&width=150",
  },
]

// Mock activity data
const mockActivities = [
  {
    id: "ACT45678",
    type: "booking",
    description: "Booked ticket from Colombo Fort to Kandy",
    timestamp: "2023-05-10T14:30:00Z",
    ticketId: "TKT78901",
    ipAddress: "192.168.1.1",
    device: "Mobile - Android",
    location: "Colombo, Sri Lanka",
  },
  {
    id: "ACT45679",
    type: "login",
    description: "Logged in to account",
    timestamp: "2023-05-10T14:25:00Z",
    ipAddress: "192.168.1.1",
    device: "Mobile - Android",
    location: "Colombo, Sri Lanka",
  },
  {
    id: "ACT45680",
    type: "booking",
    description: "Booked ticket from Colombo Fort to Galle",
    timestamp: "2023-05-05T09:15:00Z",
    ticketId: "TKT78902",
    ipAddress: "192.168.1.1",
    device: "Desktop - Chrome",
    location: "Colombo, Sri Lanka",
  },
  {
    id: "ACT45681",
    type: "profile_update",
    description: "Updated phone number",
    timestamp: "2023-05-01T16:45:00Z",
    ipAddress: "192.168.1.1",
    device: "Desktop - Chrome",
    location: "Colombo, Sri Lanka",
  },
  {
    id: "ACT45682",
    type: "booking",
    description: "Booked ticket from Kandy to Colombo Fort",
    timestamp: "2023-04-30T11:45:00Z",
    ticketId: "TKT78903",
    ipAddress: "192.168.1.1",
    device: "Mobile - Android",
    location: "Kandy, Sri Lanka",
  },
]

export default function ProfilePage() {
  // ========== Hooks ==========
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const [user, setUser] = useState(mockUser)
  const [tickets, setTickets] = useState(mockTickets)
  const [activities, setActivities] = useState(mockActivities)

  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(mockUser)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const [form] = Form.useForm()

  // ========== Lifecycle ==========
  useEffect(() => {
    // Example: Fetch user data from an API
    // fetchUserData()
  }, [])

  // ========== Handlers ==========
  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  const handleProfileUpdate = () => {
    setUser(editedUser)
    setIsEditing(false)

    // Log activity
    const newActivity = {
      id: `ACT${Math.floor(Math.random() * 10000)}`,
      type: "profile_update",
      description: "Updated profile information",
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.1",
      device: "Browser",
      location: "Colombo, Sri Lanka",
    }
    setActivities([newActivity, ...activities])
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedUser({ ...editedUser, [name]: value })
  }

  const handleCancelTicket = (ticketId) => {
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId ? { ...ticket, status: "cancelled" } : ticket
    )
    setTickets(updatedTickets)

    // Log activity for ticket cancellation
    const newActivity = {
      id: `ACT${Math.floor(Math.random() * 10000)}`,
      type: "cancellation",
      description: `Cancelled ticket ${ticketId}`,
      timestamp: new Date().toISOString(),
      ticketId,
      ipAddress: "192.168.1.1",
      device: "Browser",
      location: "Colombo, Sri Lanka",
    }
    setActivities([newActivity, ...activities])
    setIsTicketModalOpen(false)
  }

  const handleLogout = () => {
    // Clear session/token in real app
    navigate("/login")
  }

  // ========== Utilities ==========
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return <Tag color="blue">{status}</Tag>
      case "completed":
        return <Tag color="green">{status}</Tag>
      case "cancelled":
        return <Tag color="red">{status}</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "booking":
        // Example: You could add a Ticket icon here if you want
        // return <TicketOutlined style={{ color: "#52c41a" }} />
        return <UserOutlined style={{ color: "#1890ff" }} />
      case "login":
        return <UserOutlined style={{ color: "#1890ff" }} />
      case "profile_update":
        return <EditOutlined style={{ color: "#fa8c16" }} />
      case "cancellation":
        return <CloseCircleOutlined style={{ color: "#f5222d" }} />
      default:
        return <ClockCircleOutlined />
    }
  }

  const activityColumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text, record) => (
        <Space>
          {getActivityIcon(record.type)}
          <Text>{text.replace("_", " ")}</Text>
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Date & Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (text) => (
        <Space direction="vertical" size={0}>
          <Text>{formatDate(text)}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {formatTime(text)}
          </Text>
        </Space>
      ),
    },
    {
      title: "Device",
      dataIndex: "device",
      key: "device",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
  ]

  // ========== Render ==========
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <NavBar/>
      {/* Layout with Sider + Content */}
      <Layout>
        {/* Sider (Sidebar Navigation) */}

        <Layout style={{ padding: "24px" }}>
          <Content
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Main Profile Content */}
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "24px",
                  flexWrap: "wrap",
                  marginBottom: "24px",
                }}
              >
                {/* Profile Card */}
                <div style={{ flex: "1", minWidth: "250px", maxWidth: "350px" }}>
                  <Card>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <Avatar
                        size={96}
                        src={user.profileImage}
                        icon={<UserOutlined />}
                        style={{ marginBottom: "16px" }}
                      />
                      <Title level={4} style={{ margin: 0 }}>
                        {user.name}
                      </Title>
                      <Text type="secondary">{user.email}</Text>
                      <div style={{ marginTop: "8px" }}>
                        {user.verificationStatus === "verified" ? (
                          <Tag color="green" icon={<CheckCircleOutlined />}>
                            Verified User
                          </Tag>
                        ) : (
                          <Tag>Unverified</Tag>
                        )}
                      </div>
                    </div>

                    <Divider style={{ margin: "12px 0" }} />

                    <div style={{ marginBottom: "16px" }}>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary">Member Since</Text>
                          <Text>{user.memberSince}</Text>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary">Trust Score</Text>
                          <Text>{user.trustScore}/100</Text>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary">Booking Limit</Text>
                          <Text>{user.bookingLimit} tickets/day</Text>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary">Last Login</Text>
                          <Text>{formatDate(user.lastLogin)}</Text>
                        </div>
                      </Space>
                    </div>

                    <Button
                      icon={<LogoutOutlined />}
                      block
                      danger
                      onClick={() => setIsLogoutModalOpen(true)}
                    >
                      Logout
                    </Button>
                  </Card>
                </div>

                {/* Tabs Content */}
                <div style={{ flex: "2", minWidth: 0 }}>
                  <Tabs defaultActiveKey="profile" type="card">
                    {/* Profile Tab */}
                    <TabPane tab="Profile" key="profile">
                      <Card
                        title={
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Personal Information</span>
                            <Button icon={<EditOutlined />} onClick={() => setIsEditing(!isEditing)}>
                              {isEditing ? "Cancel" : "Edit Profile"}
                            </Button>
                          </div>
                        }
                      >
                        {isEditing ? (
                          <Form layout="vertical" initialValues={editedUser} onFinish={handleProfileUpdate}>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                                gap: "16px",
                              }}
                            >
                              <Form.Item label="Full Name" name="name">
                                <Input name="name" value={editedUser.name} onChange={handleInputChange} />
                              </Form.Item>
                              <Form.Item label="Email" name="email">
                                <Input name="email" type="email" value={editedUser.email} onChange={handleInputChange} />
                              </Form.Item>
                              <Form.Item label="Phone Number" name="phone">
                                <Input name="phone" value={editedUser.phone} onChange={handleInputChange} />
                              </Form.Item>
                              <Form.Item label="National ID" name="nic" extra="National ID cannot be changed">
                                <Input name="nic" value={editedUser.nic} disabled onChange={handleInputChange} />
                              </Form.Item>
                              <Form.Item label="Address" name="address" style={{ gridColumn: "1 / -1" }}>
                                <Input name="address" value={editedUser.address} onChange={handleInputChange} />
                              </Form.Item>
                            </div>
                            <Button type="primary" htmlType="submit">
                              Save Changes
                            </Button>
                          </Form>
                        ) : (
                          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                            <Descriptions.Item label="Full Name">{user.name}</Descriptions.Item>
                            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                            <Descriptions.Item label="Phone Number">{user.phone}</Descriptions.Item>
                            <Descriptions.Item label="National ID">{user.nic}</Descriptions.Item>
                            <Descriptions.Item label="Address" span={2}>
                              {user.address}
                            </Descriptions.Item>
                          </Descriptions>
                        )}
                      </Card>

                      <Card title="Security Settings" style={{ marginTop: "24px" }}>
                        <Space direction="vertical" style={{ width: "100%" }} size="large">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text strong>Two-Factor Authentication</Text>
                              <div>
                                <Text type="secondary">Add an extra layer of security to your account</Text>
                              </div>
                            </div>
                            <Button>Enable</Button>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text strong>Change Password</Text>
                              <div>
                                <Text type="secondary">Update your password regularly for better security</Text>
                              </div>
                            </div>
                            <Button>Update</Button>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text strong>Login Notifications</Text>
                              <div>
                                <Text type="secondary">Get notified when someone logs into your account</Text>
                              </div>
                            </div>
                            <Button>Configure</Button>
                          </div>
                        </Space>
                      </Card>
                    </TabPane>

                    {/* Tickets Tab */}
                    <TabPane tab="My Tickets" key="tickets">
                      <Card title="My Tickets">
                        {tickets.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "32px 0" }}>
                            <Text type="secondary">You don't have any tickets yet.</Text>
                            <div style={{ marginTop: "16px" }}>
                              <Button type="primary" onClick={() => navigate("/bookings")}>
                                Book a Ticket
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Space direction="vertical" style={{ width: "100%" }} size="large">
                            {tickets.map((ticket) => (
                              <Card
                                key={ticket.id}
                                style={{
                                  marginBottom: "16px",
                                  borderTop: `2px solid ${
                                    ticket.status === "upcoming"
                                      ? "#1890ff"
                                      : ticket.status === "completed"
                                      ? "#52c41a"
                                      : "#f5222d"
                                  }`,
                                }}
                              >
                                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "24px" }}>
                                  <div style={{ flex: 1, minWidth: "250px" }}>
                                    <div
                                      style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}
                                    >
                                      <Title level={4} style={{ margin: 0 }}>
                                        {ticket.trainName}
                                      </Title>
                                      <Text type="secondary">({ticket.trainNumber})</Text>
                                    </div>

                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "24px",
                                        marginBottom: "16px",
                                      }}
                                    >
                                      <div>
                                        <Title level={3} style={{ margin: 0 }}>
                                          {ticket.departureTime}
                                        </Title>
                                        <Text type="secondary">{ticket.from}</Text>
                                      </div>
                                      <div
                                        style={{
                                          flex: 1,
                                          height: "2px",
                                          backgroundColor: "#f0f0f0",
                                          position: "relative",
                                        }}
                                      >
                                        <div
                                          style={{
                                            position: "absolute",
                                            top: "-6px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "50%",
                                            backgroundColor: "#1890ff",
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Title level={3} style={{ margin: 0 }}>
                                          {ticket.arrivalTime}
                                        </Title>
                                        <Text type="secondary">{ticket.to}</Text>
                                      </div>
                                    </div>

                                    <div
                                      style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "16px",
                                        marginBottom: "16px",
                                      }}
                                    >
                                      <div>
                                        <Text type="secondary">Date</Text>
                                        <div>
                                          <Text strong>{ticket.date}</Text>
                                        </div>
                                      </div>
                                      <div>
                                        <Text type="secondary">Class</Text>
                                        <div>
                                          <Text strong>{ticket.class}</Text>
                                        </div>
                                      </div>
                                      <div>
                                        <Text type="secondary">Seat</Text>
                                        <div>
                                          <Text strong>{ticket.seatNumber}</Text>
                                        </div>
                                      </div>
                                      <div>
                                        <Text type="secondary">Price</Text>
                                        <div>
                                          <Text strong>Rs. {ticket.price.toFixed(2)}</Text>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                    {getStatusBadge(ticket.status)}
                                    <div style={{ marginTop: "8px" }}>
                                      <Image
                                        src={ticket.qrCode || "/placeholder.svg"}
                                        alt="Ticket QR Code"
                                        width={100}
                                        height={100}
                                      />
                                    </div>
                                    <Text type="secondary" style={{ fontSize: "12px" }}>
                                      Ticket ID: {ticket.id}
                                    </Text>
                                  </div>
                                </div>

                                <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                  <Button
                                    onClick={() => {
                                      setSelectedTicket(ticket)
                                      setIsTicketModalOpen(true)
                                    }}
                                  >
                                    View Details
                                  </Button>

                                  <Button icon={<DownloadOutlined />}>Download</Button>

                                  {ticket.status === "upcoming" && (
                                    <Button
                                      danger
                                      icon={<CloseCircleOutlined />}
                                      onClick={() => {
                                        Modal.confirm({
                                          title: "Are you sure you want to cancel this ticket?",
                                          content:
                                            "This action cannot be undone. Cancellation charges may apply based on railway policy.",
                                          okText: "Cancel Ticket",
                                          okType: "danger",
                                          cancelText: "Keep Ticket",
                                          onOk: () => handleCancelTicket(ticket.id),
                                        })
                                      }}
                                    >
                                      Cancel Ticket
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </Space>
                        )}
                      </Card>
                    </TabPane>

                    {/* Activities Tab */}
                    <TabPane tab="Activities" key="activities">
                      <Card title="Account Activities">
                        <Table
                          dataSource={activities}
                          columns={activityColumns}
                          rowKey="id"
                          pagination={{ pageSize: 10 }}
                        />
                      </Card>
                    </TabPane>
                  </Tabs>
                </div>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Ticket Detail Modal */}
      <Modal
        title="Ticket Details"
        open={isTicketModalOpen}
        onCancel={() => setIsTicketModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsTicketModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedTicket && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: "24px",
              }}
            >
              <div>
                <Title level={5}>Journey Information</Title>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="From">{selectedTicket.from}</Descriptions.Item>
                  <Descriptions.Item label="To">{selectedTicket.to}</Descriptions.Item>
                  <Descriptions.Item label="Date">{selectedTicket.date}</Descriptions.Item>
                  <Descriptions.Item label="Departure">{selectedTicket.departureTime}</Descriptions.Item>
                  <Descriptions.Item label="Arrival">{selectedTicket.arrivalTime}</Descriptions.Item>
                </Descriptions>

                <Title level={5} style={{ marginTop: "24px" }}>
                  Train Information
                </Title>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Train Name">{selectedTicket.trainName}</Descriptions.Item>
                  <Descriptions.Item label="Train Number">{selectedTicket.trainNumber}</Descriptions.Item>
                  <Descriptions.Item label="Class">{selectedTicket.class}</Descriptions.Item>
                  <Descriptions.Item label="Seat Number">{selectedTicket.seatNumber}</Descriptions.Item>
                </Descriptions>

                <Title level={5} style={{ marginTop: "24px" }}>
                  Ticket Information
                </Title>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Ticket ID">{selectedTicket.id}</Descriptions.Item>
                  <Descriptions.Item label="Status">{getStatusBadge(selectedTicket.status)}</Descriptions.Item>
                  <Descriptions.Item label="Price">Rs. {selectedTicket.price.toFixed(2)}</Descriptions.Item>
                  <Descriptions.Item label="Purchase Date">
                    {formatDate(selectedTicket.purchaseDate)}
                  </Descriptions.Item>
                </Descriptions>

                <Title level={5} style={{ marginTop: "24px" }}>
                  Passenger Information
                </Title>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
                  <Descriptions.Item label="NIC">{user.nic}</Descriptions.Item>
                </Descriptions>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f9f9f9",
                  padding: "24px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <Title level={5}>Ticket QR Code</Title>
                  <Text type="secondary">Scan at the station for entry</Text>
                </div>
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "16px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Image
                    src={selectedTicket.qrCode || "/placeholder.svg"}
                    alt="Ticket QR Code"
                    width={200}
                    height={200}
                  />
                </div>
                <div
                  style={{
                    marginTop: "24px",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <Button type="primary" icon={<DownloadOutlined />} block>
                    Download Ticket
                  </Button>
                  {selectedTicket.status === "upcoming" && (
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      block
                      onClick={() => {
                        setIsTicketModalOpen(false)
                        setTimeout(() => {
                          Modal.confirm({
                            title: "Are you sure you want to cancel this ticket?",
                            content:
                              "This action cannot be undone. Cancellation charges may apply based on railway policy.",
                            okText: "Cancel Ticket",
                            okType: "danger",
                            cancelText: "Keep Ticket",
                            onOk: () => handleCancelTicket(selectedTicket.id),
                          })
                        }, 500)
                      }}
                    >
                      Cancel Ticket
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Alert
              message="Important Information"
              description={
                <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                  <li>Please arrive at the station at least 30 minutes before departure.</li>
                  <li>Carry a valid photo ID along with your ticket for verification.</li>
                  <li>Tickets are non-transferable and can only be used by the registered passenger.</li>
                  <li>Cancellation charges may apply as per railway policy.</li>
                </ul>
              }
              type="warning"
              showIcon
              style={{ marginTop: "24px" }}
            />
          </div>
        )}
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        title="Logout Confirmation"
        open={isLogoutModalOpen}
        onCancel={() => setIsLogoutModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsLogoutModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="logout" danger onClick={handleLogout}>
            Logout
          </Button>,
        ]}
      >
        <p>Are you sure you want to logout?</p>
        <p>You will need to log in again to access your profile.</p>
      </Modal>
    </Layout>
  )
}
