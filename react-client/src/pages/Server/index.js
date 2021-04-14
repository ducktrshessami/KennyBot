import { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import Loading from "../../components/Loading";
import VoiceChannel from "../../components/VoiceChannel";
import API from "../../utils/API";
import "./Server.css";

export default class Server extends Component {
    state = {
        ready: false,
        failed: false,
        guild: { name: "" }
    }

    componentDidMount() {
        this.handleUrl()
            .then(() => this.getGuildFromDb())
            .catch(console.error);
    }

    componentDidUpdate() {
        console.log(this.state);
        console.log(this.props);
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
                        failed: true,
                        ready: true
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
                                },
                                ready: true
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
                <div className="server-wrapper">
                    <Link to="/dashboard" className="greyple-bg focus-darken white-text btn">❮ Back</Link>
                    <div className="server-container row">
                        <section className="col s12 m6 l4">
                            <h4>
                                {this.state.guild.name}
                                {!this.state.ready || !this.props.ready ? <Loading className="server-loader" size="small" /> : undefined}
                            </h4>
                            <br />
                            {this.state.guild.voice ? <VoiceChannel {...this.state.guild.voice} /> : this.state.ready ? <span>Not connected to a voice channel</span> : undefined}
                        </section>
                        <section className="col s12 m6 l8"></section>
                    </div>
                </div>
            </main>
        );
    }
};
