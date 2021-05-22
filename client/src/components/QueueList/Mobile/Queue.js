import { animated } from "@react-spring/web";
import { useState } from "react";

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
            <i role={props.editing ? "button" : undefined} className={`queue-draggable-icon queue-button-icon ${props.editing ? "" : "empty-icon"}`.trim()} ref={props.dragRef} {...props.dragBinder()} />
            <div className="queued-title center">
                <a href={props.url} target="_blank" rel="noreferrer" className={`greyple-text ${props.editing ? "disabled" : ""}`.trim()}>{props.title}</a>
            </div>
            <i role={props.editing ? "button" : undefined} className={`queue-remove-icon queue-button-icon ${props.editing ? "" : "empty-icon"}`.trim()} onClick={dequeue} />
        </animated.li>
    );
};
