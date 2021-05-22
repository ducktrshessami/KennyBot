import { useState } from "react";
import { animated } from "react-spring";

export default function Queue(props) {
    const [ghost, setGhost] = useState(false);

    function dequeue() {
        if (props.socket) {
            props.socket.emit("songDequeue", props.id);
            setGhost(true);
        }
    }

    return ghost ? null : (
        <animated.li className={`queued-song ${props.active ? "dragging" : ""}`.trim()} style={props.style}>
            <i role="button" className="queue-draggable-icon queue-button-icon" ref={props.dragRef} {...props.dragBinder()} />
            <div className="queued-title center">
                <a href={props.url} target="_blank" rel="noreferrer" className="greyple-text">{props.title}</a>
            </div>
            <i role="button" className="queue-remove-icon queue-button-icon" onClick={dequeue} />
        </animated.li>
    );
}