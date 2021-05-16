import { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";

export default function Queue(props) {
    const [ghost, setGhost] = useState(false);
    const [coords, spring] = useSpring(() => ({ y: 0 }));

    function dequeue() {
        if (props.socket) {
            props.socket.emit("songDequeue", props.id);
            setGhost(true);
        }
    }

    useEffect(() => {
        spring.start({ y: props.y });
    }, [spring, props.y]);

    return ghost ? null : (
        <animated.li data-id={props.id} className={`queued-song ${props.active ? "dragging" : ""}`.trim()} style={coords}>
            <i role="button" className="queue-draggable-icon queue-button-icon" {...props.dragBinder()} />
            <div className="queued-title center">
                <a href={props.url} target="_blank" rel="noreferrer" className="greyple-text">{props.title} <i /></a>
            </div>
            <i role="button" className="queue-remove-icon queue-button-icon" onClick={dequeue} />
        </animated.li>
    );
}