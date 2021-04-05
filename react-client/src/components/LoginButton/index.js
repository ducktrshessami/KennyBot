import { useHistory } from "react-router-dom";
// import Logo from "./Discord-Logo-White.svg";
import "./LoginButton.css";

export default function LoginButton() {
    const history = useHistory();
    return (
        <button className="btn btn-login" onClick={() => history.push("/login")}>Login With Discord</button>
    );
};
