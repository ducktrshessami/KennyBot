import { Component } from "react";
import { Redirect } from "react-router-dom";
import M from "materialize-css";
import ServerIcon from "../../components/ServerIcon";
import API from "../../utils/API";
import "./Dashboard.css";

export default class Dashboard extends Component {
    state = { guilds: [] }

    componentDidMount() {
        this.getGuilds();
        this.initTooltips();
    }

    componentDidUpdate() {
        this.initTooltips();
    }

    initTooltips() {
        let buttons = document.querySelectorAll(".server-icon");
        M.Tooltip.init(buttons, {
            exitDelay: 0,
            position: "bottom"
        });
    }

    getGuilds() {
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
                <div id="server-list" className="row">
                    {this.state.guilds.map(guild => <ServerIcon key={guild.id} {...guild} />)}
                </div>
            </main>
        );
    }
};
