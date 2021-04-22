import { createRef, useState } from "react";
import ContextMenu from "../../ContextMenu";
import Confirm from "../../Confirm";
import API from "../../../utils/API";
import Toast from "../../../utils/Toast";
import "./Song.css";

export default function Song(props) {
    const menuRef = createRef();
    const [deleting, setDeleting] = useState(false);

    function voiceCheck() {
        if (!props.canPlay) {
            Toast("Join the bot to a voice channel first", 1);
            return false;
        }
        return Boolean(props.socket);
    }

    function play() {
        if (voiceCheck()) {
            props.socket.emit("songPlay", props.id);
        }
    }

    function queue() {
        if (voiceCheck()) {
            props.socket.emit("songQueue", props.id);
        }
    }

    function startDeleting() {
        setDeleting(true);
    }

    function cancelDelete() {
        setDeleting(false);
    }

    function deleteThis() {
        setDeleting(false);
        API.deleteSong(props.guildId, props.id)
            .then(res => {
                if (res.status === 200) {
                    Toast("Success!");
                }
                else {
                    Toast(`Failed to delete ${props.title}`, 1);
                }
            })
            .catch(console.error);
    }

    return (
        <li>
            {deleting ? <Confirm title={`Delete ${props.title}?`} onOk={deleteThis} onCancel={cancelDelete} /> : undefined}
            <div className="song">
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
                        callback: startDeleting
                    }
                ]} buttonRef={menuRef} />
            </div>
        </li>
    );
};
