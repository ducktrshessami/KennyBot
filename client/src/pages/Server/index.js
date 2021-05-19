import { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import Socket from "socket.io-client";
import Toast from "../../utils/Toast";

import Loading from "../../components/Loading";
import Playlist from "../../components/Playlist";
import CreatePlaylist from "../../components/CreatePlaylist";
import MusicPlayer from "../../components/MusicPlayer";
import QueueList from "../../components/QueueList";

import "./Server.css";

export default class Server extends Component {
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

        socket.on("error", err => {
            Toast("Live state error");
            console.error(err);
        });

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
    }

    componentDidUpdate() {
        let guild = this.props.guilds.find(guild => guild.id === this.guildID) || {};
        let name = guild.name || "";
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
                                {this.state.guild.state.voice ? <h5>Connected to <b>{this.state.guild.state.voice.channel}</b></h5> : this.state.ready ? <h6>Not connected to a voice channel</h6> : undefined}
                            </article>
                            <article className="server-info-container">
                                {this.state.guild.state.voice ? <MusicPlayer socket={this.state.socket} playing={this.state.guild.state.playing} paused={this.state.guild.state.paused} queued={Boolean(this.state.guild.state.queue.length)} shuffle={this.state.guild.state.shuffle} repeat={this.state.guild.state.repeat} volume={this.state.guild.state.volume} song={this.state.guild.state.song} /> : undefined}
                            </article>
                            {this.state.guild.state.voice && Boolean(this.state.guild.state.queue.length) ? <QueueList socket={this.state.socket} queue={this.state.guild.state.queue} /> : undefined}
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
