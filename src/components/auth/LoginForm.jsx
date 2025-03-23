import React from "react";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/styles/RegisterStyle.css";
import AxiosInstance from "../../AxiosInstance";

const LoginForm = () => {
    const navigate = useNavigate(); // Use useNavigate hook

    const onFinish = (values) => {
        const { email, password } = values;

        AxiosInstance.post("/api/auth/login", {
            email,
            password,
        })
            .then((response) => {
                //get token and store it on local storage
                const token = response.data.token;
                const isAdmin = response.data.isAdmin;

                if (isAdmin) {
                    localStorage.setItem("AdminToken", token);
                    localStorage.setItem("UserToken", token);
                    navigate("/admin", {
                        replace: true,
                        state: { loginSuccess: true },
                    });
                } else {
                    localStorage.setItem("UserToken", token);
                    navigate("/", {
                        replace: true,
                        state: { loginSuccess: true },
                    });
                }
            })
            .catch((error) => {
                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.error
                ) {
                    // Displaying the error message using antd message component
                    message.error(error.response.data.error);
                } else {
                    // Fallback error message if the expected structure is not found
                    message.error(
                        "An unexpected error occurred. Please try again."
                    );
                }
                console.error("There was an error during login!", error);
            });
    };

    return (
        <div className="register-form-container">
            <div className="form-header">
            <h3 className="font-bold text-2xl mb-3 text-blue-600">Sign In</h3>
                <p className="font-medium">Welcome back! Please enter your details</p>
            </div>
            <br />

            <Form
                name="register"
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
                autoComplete="off"
            >
                <label>Email</label>
                <Form.Item
                    hasFeedback
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: "Please input your email!",
                        },
                        {
                            type: "email",
                            message: "Please enter a valid email!",
                        },
                    ]}
                >
                    <Input placeholder="Email" />
                </Form.Item>
                <label>Password</label>
                <Form.Item
                    hasFeedback
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: "Please input your password!",
                        },
                    ]}
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>

                <div className="container-sign-in">
                    <div className="csi-div">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                </div>
                <br />

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="register-button"
                    >
                        Sign In
                    </Button>
                </Form.Item>

                <div className="already-have-account">
                    Don't have an account yet?{" "}
                    <Link to="/register">signup</Link>
                </div>
            </Form>
        </div>
    );
};

export default LoginForm;
