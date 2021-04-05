import { useHistory } from "react-router-dom";
import "./InviteButton.css";

export default function InviteButton() {
    const history = useHistory();
    return (
        <button className="btn btn-invite" onClick={() => history.push("/invite")}>Invite KennyBot to your server</button>
    );
};
