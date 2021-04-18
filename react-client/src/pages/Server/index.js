import { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import Loading from "../../components/Loading";
import VoiceChannel from "../../components/VoiceChannel";
import Playlist from "../../components/Playlist";
import CreatePlaylist from "../../components/CreatePlaylist";
import API from "../../utils/API";
import Toast from "../../utils/Toast";
import "./Server.css";

export default class Server extends Component {
    state = {
        ready: false,
        failed: false,
        guild: { name: "" },
        creating: false
    }

    refreshComponent() {
        this.setState({
            ready: false,
            failed: false,
            guild: { name: "" },
            creating: false
        }, this.componentDidMount);
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
            let guildID = ((window.location.pathname.match(/server\/[0-9]+/gi) || [""])[0].match(/[0-9]+/g) || [""])[0];
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

    createButton() {
        if (this.state.creating) {
            return (
                <button className="create-playlist-button btn btn-small greyple-bg focus-lighten" onClick={() => this.swapCreateState()}>Cancel</button>
            );
        }
        else {
            return (
                <button className="create-playlist-button btn btn-small greyple-bg focus-lighten" onClick={() => this.swapCreateState()}>
                    +
                    <span className="hide-on-med-and-up"> Create</span>
                </button>
            );
        }
    }

    swapCreateState() {
        this.setState({
            ...this.state,
            creating: !this.state.creating
        });
    }

    createSucc() {
        Toast("Success!");
        this.setState({
            ...this.state,
            creating: false
        }, this.refreshComponent);
    }

    failSucc() {
        Toast("Failed to create playlist");
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
                            {this.state.guild.voice ? <VoiceChannel {...this.state.guild.voice} /> : this.state.ready ? <h6>Not connected to a voice channel</h6> : undefined}
                        </section>
                        <section className="col s12 m6 l8">
                            <div className="playlist-header">
                                <h5>Playlists</h5>
                                {this.createButton()}
                            </div>
                            {this.state.creating ? <CreatePlaylist guildId={this.state.guild.id} onSuccess={() => this.createSucc()} onError={() => this.failSucc()} /> : undefined}
                            <ul className="playlist-wrapper">
                                {this.state.guild.playlists && this.state.guild.playlists.length ? this.state.guild.playlists.map(playlist => <Playlist key={playlist.id} refreshServer={() => this.refreshComponent()} {...playlist} />) : this.state.ready ? <h6>This server has no playlists</h6> : undefined}
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
        );
    }
};
