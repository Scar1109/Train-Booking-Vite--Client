
import { Link } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import Logo from "../../assets/images/logo.png";

const Login = () => {
    return (
        <div className="register-page">
            <Link to="/" style={{ textDecoration: "none" }}>
                {/* <div className="logo">
                    <img alt="logo" className="logo-img" src={Logo} />
                </div> */}
            </Link>
            <div className="left-container">
                <LoginForm />
            </div>
        </div>
    );
};
export default Login;
