import { Link, Redirect } from "react-router-dom";
import "./Server.css";

const emptyGuild = {
    name: ""
};

export default function Server(props) {
    let guild = emptyGuild;
    const guildID = (window.location.hash.match(/server\/[0-9]+/i) || [""])[0].match(/[0-9]+/)[0];
    if (props.guilds) {
        guild = props.guilds.find(server => server.id === guildID) || {};
    }
    return (
        <main>
            {!props.user && props.ready ? <Redirect to="/" /> : undefined}
            {!guild && props.ready ? <Redirect to="/dashboard" /> : undefined}
            <section className="server-wrapper">
                <Link to="/dashboard" className="greyple-bg focus-darken white-text btn">❮ Back</Link>
                <div className="server-container">
                    <h4>{guild.name}</h4>
                </div>
            </section>
        </main>
    );
};
