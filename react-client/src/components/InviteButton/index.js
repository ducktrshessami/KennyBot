import { Link } from "react-router-dom";
import "./InviteButton.css";

export default function InviteButton() {
    return (
        <Link className="btn btn-invite" to="/invite">Invite KennyBot to your server</Link>
    );
};
