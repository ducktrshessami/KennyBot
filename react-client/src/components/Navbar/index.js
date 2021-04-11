import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    return (
        <header>
            <nav className="nqb-bg">
                <Link to="/logout" className="logout right">Log Out</Link>
            </nav>
        </header>
    );
}
