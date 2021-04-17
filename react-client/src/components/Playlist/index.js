import { createRef, useState } from "react";
import ContextMenu from "../ContextMenu";
import SongList from "./SongList";
import "./Playlist.css";

export default function Playlist(props) {
    const menuRef = createRef();
    const [active, setActive] = useState(false);
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

    function editPlaylistName() {

    }

    function deletePlaylist() {

    }

    return (
        <li>
            <div className={`playlist ${active ? "open" : ""}`.trim()}>
                <div className="playlist-title-wrapper">
                    <div className="playlist-title kenny-bg focus-lighten" role="button" onClick={() => setActive(!active)}>
                        <i className="minimal-text">&nbsp;</i>
                        <i className="playlist-arrow" />
                        {props.name}
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
