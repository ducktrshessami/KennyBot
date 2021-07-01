import { Link, Redirect } from "react-router-dom";
import Loading from "../../components/Loading";
import ServerIcon from "../../components/ServerIcon";
import "./Dashboard.css";

export default function Dashboard(props) {
    return (
        <main>
            {!props.user && props.ready ? <Redirect to="/" /> : undefined}
            <Link className="invite-button btn blurple-bg focus-lighten" to="/invite" target="_blank" rel="noreferrer"><i className="invite-logo" /> Invite</Link>
            <h4 className="dashboard-header">Servers</h4>
            <div id="server-list" className="row">
                {props.ready ? props.guilds.map(guild => <ServerIcon key={guild.id} {...guild} />) : <Loading className="center" size="big" />}
            </div>
        </main>
    );
};
