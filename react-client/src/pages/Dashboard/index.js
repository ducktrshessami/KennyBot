import { Redirect } from "react-router-dom";
import ServerIcon from "../../components/ServerIcon";
import "./Dashboard.css";

export default function Dashboard(props) {
    return (
        <main>
            {!props.user && props.ready ? <Redirect to="/" /> : undefined}
            <h4 className="dashboard-header">Servers</h4>
            <div id="server-list" className="row">
                {props.ready ? props.guilds.map(guild => <ServerIcon key={guild.id} {...guild} />) : undefined}
            </div>
        </main>
    );
};
