import { Component, createRef } from "react";
import ContextMenu from "../ContextMenu";
import SongList from "./SongList";
import EditForm from "./EditForm";
import API from "../../utils/API";
import Toast from "../../utils/Toast";
import isDescendent from "../../utils/isDescendent";
import "./Playlist.css";

export default class Playlist extends Component {
    state = {
        active: false,
        editing: false
    }
    menuRef = createRef();
    editRef = createRef();
    clickActive = (event) => {
        if (!isDescendent(event.target, this.editRef.current)) {
            this.setState({
                ...this.state,
                active: !this.state.active
            });
        }
    }
    clickNonEdit = (event) => {
        if (!isDescendent(event.target, this.editRef.current)) {
            document.getElementById("root").removeEventListener("click", this.clickNonEdit);
            this.setState({
                ...this.state,
                editing: false
            });
        }
    }

    componentWillUnmount() {
        document.getElementById("root").removeEventListener("click", this.clickNonEdit);
    }

    editPlaylistName() {
        document.getElementById("root").addEventListener("click", this.clickNonEdit);
        this.setState({
            ...this.state,
            editing: true
        });
    }

    editSucc() {
        Toast("Success!");
        this.setState({
            ...this.state,
            editing: false
        });
    }

    editFail() {
        Toast("Failed to update playlist");
    }

    deletePlaylist() {

    }

    render() {
        return (
            <li>
                <div className={`playlist ${this.state.active ? "open" : ""}`.trim()}>
                    <div className="playlist-title-wrapper">
                        <div className="playlist-title kenny-bg focus-lighten" role="button" onClick={event => this.clickActive(event)}>
                            <i className="minimal-text">&nbsp;</i>
                            <i className="playlist-arrow" />
                            {this.state.editing ? <EditForm guildId={this.props.GuildId} initialValue={this.props.name} onSuccess={() => this.editSucc()} onError={this.editFail} editRef={this.editRef} /> : this.props.name}
                        </div>
                        <div className="kenny-bg focus-lighten" role="button">▶</div>
                        <div className="playlist-title-menu kenny-bg focus-lighten" role="button" ref={this.menuRef}>
                            <i className="minimal-text">&nbsp;</i>
                            <i className="kebab-menu" />
                        </div>
                        <ContextMenu optionClassName="kenny-bg focus-lighten" options={[
                            {
                                name: "Edit",
                                callback: () => this.editPlaylistName()
                            },
                            {
                                name: "Delete",
                                callback: () => this.deletePlaylist()
                            }
                        ]} buttonRef={this.menuRef} />
                    </div>
                    {this.state.active ? <SongList songs={this.props.Songs} /> : undefined}
                </div>
            </li>
        );
    }
};
