import { createRef, useState } from "react";
import ContextMenu from "../ContextMenu";
import SongList from "./SongList";
import EditForm from "./EditForm";
import API from "../../utils/API";
import Toast from "../../utils/Toast";
import isDescendent from "../../utils/isDescendent";
import "./Playlist.css";

export default function Playlist(props) {
    const menuRef = createRef();
    const editRef = createRef();
    const [active, setActive] = useState(false);
    const [editing, setEditing] = useState(false);
    const menuOptions = [
        {
            name: "Edit",
            callback: editPlaylistName
        },
        {
            name: "Delete",
            callback: deletePlaylist
        }
    ];

    function clickActive(event) {
        if (!isDescendent(event.target, editRef.current)) {
            setActive(!active);
        }
    }

    function editPlaylistName() {
        setEditing(true);
    }

    function editSucc() {
        Toast("Success!");
        setEditing(false);
    }

    function editFail() {
        Toast("Failed to update playlist");
    }

    function deletePlaylist() {

    }

    return (
        <li>
            <div className={`playlist ${active ? "open" : ""}`.trim()}>
                <div className="playlist-title-wrapper">
                    <div className="playlist-title kenny-bg focus-lighten" role="button" onClick={clickActive}>
                        <i className="minimal-text">&nbsp;</i>
                        <i className="playlist-arrow" />
                        {editing ? <EditForm guildId={props.GuildId} initialValue={props.name} onSuccess={editSucc} onError={editFail} onCancel={() => setEditing(false)} editRef={editRef} /> : props.name}
                    </div>
                    <div className="kenny-bg focus-lighten" role="button">▶</div>
                    <div className="playlist-title-menu kenny-bg focus-lighten" role="button" ref={menuRef}>
                        <i className="minimal-text">&nbsp;</i>
                        <i className="kebab-menu" />
                    </div>
                    <ContextMenu optionClassName="kenny-bg focus-lighten" options={menuOptions} buttonRef={menuRef} />
                </div>
                {active ? <SongList songs={props.Songs} /> : undefined}
            </div>
        </li>
    );
};
