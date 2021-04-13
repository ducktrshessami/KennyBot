import { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import API from "../../utils/API";
import "./Server.css";

export default class Server extends Component {
    state = {
        failed: false,
        guild: { name: "" }
    }

    componentDidMount() {
        this.handleUrl()
            .then(() => this.getGuildFromDb())
            .catch(console.error);
    }

    handleUrl() {
        return new Promise((resolve, reject) => {
            let guildID = ((window.location.hash.match(/server\/[0-9]+/gi) || [""])[0].match(/[0-9]+/g) || [""])[0];
            if (this.props.guilds) {
                let guild = this.props.guilds.find(server => server.id === guildID);
                if (guild) {
                    this.setState({
                        ...this.state,
                        guild
                    }, resolve);

                }
                else {
                    this.setState({
                        ...this.state,
                        failed: true
                    }, resolve);
                }
            }
        });
    }

    getGuildFromDb() {
        if (!this.state.failed) {
            return API.getGuildInfo(this.state.guild.id)
                .then(dbGuild => {
                    if (dbGuild) {
                        return new Promise((resolve, reject) => {
                            this.setState({
                                ...this.state,
                                guild: {
                                    ...this.state.guild,
                                    ...dbGuild
                                }
                            })
                        });
                    }
                });
        }
    }

    render() {
        return (
            <main>
                {!this.props.user && this.props.ready ? <Redirect to="/" /> : undefined}
                {this.state.failed && this.props.ready ? <Redirect to="/dashboard" /> : undefined}
                <section className="server-wrapper">
                    <Link to="/dashboard" className="greyple-bg focus-darken white-text btn">❮ Back</Link>
                    <div className="server-container">
                        <h4>{this.state.guild.name}</h4>
                    </div>
                </section>
            </main>
        );
    }
};
