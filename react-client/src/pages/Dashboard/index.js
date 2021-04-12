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
                <div className="dashboard">
                    {!this.props.user && this.props.ready ? <Redirect to="/" /> : undefined}
                    <h4>Servers</h4>
                    <ul className="server-list row">
                        {this.state.guilds.map(guild => <ServerCard key={guild.id} {...guild} />)}
                    </ul>
                </div>
            </main>
        );
    }
};
