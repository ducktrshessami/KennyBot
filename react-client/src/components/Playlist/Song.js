import { createRef } from "react";
import ContextMenu from "../ContextMenu";
import API from "../../utils/API";
import Toast from "../../utils/Toast";
import "./Song.css";

export default function Song(props) {
    const menuRef = createRef();

    function play() {
        API.playSong(props.guildId, props.id)
            .catch(err => {
                console.error(err);
                Toast(`Failed to play ${props.title}`);
            });
    }

    function queue() {

    }

    function deleteThis() {

    }

    return (
        <li className="song">
            <div role="button" className="song-title dark-kenny-bg focus-lighten" onClick={play}>
                {props.title}
            </div>
            <div className="song-menu dark-kenny-bg focus-lighten" role="button" ref={menuRef}>
                <i className="kebab-menu" />
            </div>
            <ContextMenu className="song-context-menu" optionClassName="dark-kenny-bg focus-lighten" options={[
                {
                    name: "Add to queue",
                    callback: queue
                },
                {
                    name: "Delete",
                    callback: deleteThis
                }
            ]} buttonRef={menuRef} />
        </li>
    );
};
