import { Link } from "react-router-dom";
// import Logo from "./Discord-Logo-White.svg";
import "./LoginButton.css";

export default function LoginButton() {
    return (
        <Link className="btn btn-login" to="/login">Login With Discord</Link >
    );
};
