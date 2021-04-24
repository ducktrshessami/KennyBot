import { Component, createRef } from "react";
import { Link, Redirect } from "react-router-dom";
import Socket from "socket.io-client";
import M from "materialize-css";
import Loading from "../../components/Loading";
import VoiceChannel from "../../components/VoiceChannel";
import Playlist from "../../components/Playlist";
import CreatePlaylist from "../../components/CreatePlaylist";
import Toast from "../../utils/Toast";
import "./Server.css";

export default class Server extends Component {
    volumeRef = createRef();
    guildID = ((window.location.pathname.match(/server\/[0-9]+/gi) || [""])[0].match(/[0-9]+/g) || [""])[0];
    state = {
        ready: false,
        creating: false,
        guild: {
            name: "",
            state: {}
        }
    };

    componentDidMount() {
        const socket = Socket({
            auth: { guildID: this.guildID }
        });

        console.info(`Establishing socket for guild ID: ${this.guildID}`);

        socket.on("connect_error", console.error);
        socket.once("connect_error", () => Toast("Live state connection failed", 1));

        socket.on("error", console.error);

        socket.on("stateInitial", voiceState => {
            let newState = {
                ...this.state,
                ready: true
            };
            newState.guild.state = voiceState;
            this.setState(newState, () => console.info("Connection established!"));
        });

        socket.on("stateUpdate", voiceState => {
            let newState = { ...this.state };
            newState.guild.state = voiceState;
            this.setState(newState);
        });

        this.setState({
            ...this.state,
            socket
        });

        M.Range.init(this.volumeRef.current);
    }

    componentDidUpdate() {
        let guild = this.props.guilds.find(guild => guild.id === this.guildID) || {};
        let name = guild.name || "";
        this.volumeRef.current.value = this.state.guild.state.volume || 0;
        if (this.state.guild.name !== name) {
            let newState = { ...this.state };
            newState.guild.name = name;
            this.setState(newState);
        }
    }

    componentWillUnmount() {
        if (this.state.socket) {
            console.info(`Closing connection for guild ID: ${this.guildID}`);
            this.state.socket.disconnect();
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
        });
    }

    failSucc() {
        Toast("Failed to create playlist", 1);
    }

    changeVolume() {
        if (this.state.socket) {
            this.state.socket.emit("volumeChange", this.volumeRef.current.value);
        }
    }

    render() {
        return (
            <main>
                {!this.props.user && this.props.ready ? <Redirect to="/" /> : undefined}
                <div className="server-wrapper">
                    <Link to="/dashboard" className="greyple-bg focus-darken white-text btn">❮ Back</Link>
                    <div className="server-container row">
                        <section className="col s12 m6 l4">
                            <h4>
                                {this.state.guild.name}
                                {!this.state.ready || !this.props.ready ? <Loading className="server-loader" size="small" /> : undefined}
                            </h4>
                            <article className="server-info-container">
                                <section className="music-player nqb-bg">
                                    <div className="music-player-row row">
                                        <div role="button" className="music-player-button col">
                                            <i className="server-prev-icon" />
                                        </div>
                                        <div role="button" className="music-player-button col">
                                            <i className={"server-play-icon"} />
                                        </div>
                                        <div role="button" className="music-player-button col">
                                            <i className="server-skip-icon" />
                                        </div>
                                    </div>
                                    <div className="range-field">
                                        <input type="range" min="0" max="1.5" step="0.01" onMouseUp={() => this.changeVolume()} ref={this.volumeRef} />
                                    </div>
                                </section>
                            </article>
                            <article className="server-info-container">
                                {this.state.guild.state.voice ? <VoiceChannel {...this.state.guild.state.voice} /> : this.state.ready ? <h6>Not connected to a voice channel</h6> : undefined}
                            </article>
                        </section>
                        <section className="col s12 m6 l8">
                            <div className="playlist-header">
                                <h5>Playlists</h5>
                                {this.createButton()}
                            </div>
                            {this.state.creating ? <CreatePlaylist guildId={this.guildID} onSuccess={() => this.createSucc()} onError={() => this.failSucc()} /> : undefined}
                            <ul className="playlist-wrapper">
                                {this.state.guild.state.playlists && this.state.guild.state.playlists.length ? this.state.guild.state.playlists.map(playlist => <Playlist key={playlist.id} canPlay={Boolean(this.state.guild.state.voice)} socket={this.state.socket} {...playlist} />) : this.state.ready ? <h6>This server has no playlists</h6> : undefined}
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
        );
    }
};
