import { Component } from "react";
import { Redirect } from "react-router-dom";
import ServerCard from "../../components/ServerCard";
import API from "../../utils/API";
import "./Dashboard.css";

export default class Dashboard extends Component {
    state = { guilds: [] }

    componentDidMount() {
        API.getUserGuilds()
            .then(guilds => {
                if (guilds) {
                    this.setState({ guilds: guilds });
                }
            })
            .catch(console.error);
    }

    render() {
        return (
            <main>
                {!this.props.user && this.props.ready ? <Redirect to="/" /> : undefined}
                <h4 className="dashboard-header">Servers</h4>
                <ul id="server-list" className="row">
                    {this.state.guilds.map(guild => <ServerCard key={guild.id} {...guild} />)}
                </ul>
            </main>
        );
    }
};
