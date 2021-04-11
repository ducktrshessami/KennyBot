import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    return (
        <header>
            <nav>
                <div className="nav-wrapper">
                    <Link to="/dashboard" className="left dash-link">
                        <img src={process.env.PUBLIC_URL + "/logo100.png"} alt="Kenny" className="logo" />
                        <b className="hide-on-small-only">KennyBot</b>
                    </Link>
                    <Link to="/logout" className="logout right">Log Out</Link>
                </div>
            </nav>
        </header>
    );
}
