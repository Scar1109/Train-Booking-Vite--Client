import "../../assets/styles/RegisterStyle.css";
import RegisterForm from "../../components/auth/RegisterForm";
import Logo from "../../assets/images/logo.png";
import { Link } from "react-router-dom";

const Register = () => {
    return (
        <div className="register-page">
            <Link to="/" style={{ textDecoration: "none" }}>
                {/* <div className="logo">
                    <img alt="logo" className="logo-img" src={Logo} />
                </div> */}
            </Link>
            <div className="left-container">
                <RegisterForm />
            </div>
        </div>
    );
};
export default Register;
