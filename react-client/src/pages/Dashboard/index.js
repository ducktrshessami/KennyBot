import { Redirect } from "react-router-dom";
import ServerCard from "../../components/ServerCard";
import "./Dashboard.css";

export default function Dashboard(props) {
    return (
        <main>
            <div className="dashboard">
                {!props.user ? <Redirect to="/" /> : undefined}
                <h4>Servers</h4>
            </div>
        </main>
    );
};
