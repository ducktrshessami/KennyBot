import { useState } from "react";

export default function Queue(props) {
    const [ghost, setGhost] = useState(false);

    function dequeue() {
        if (props.socket) {
            props.socket.emit("songDequeue", props.id);
            setGhost(true);
        }
    }

    console.log(props);

    return ghost ? null : (
        <li className="queued-song">
            <i role="button" className="queue-draggable-icon queue-button-icon" />
            <div className="queued-title center">
                <a href={props.url} target="_blank" rel="noreferrer" className="greyple-text">{props.title} <i /></a>
            </div>
            <i role="button" className="queue-remove-icon queue-button-icon" onClick={dequeue} />
        </li>
    );
}