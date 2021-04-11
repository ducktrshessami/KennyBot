import { Link } from "react-router-dom";
import "./LoginButton.css";

export default function LoginButton() {
    return (
        <Link className="btn btn-login" to="/login">
            Login With Discord
            <i className="btn-login-logo" />
        </Link >
    );
};
