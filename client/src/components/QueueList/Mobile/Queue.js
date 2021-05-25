import { animated } from "@react-spring/web";
import { useEffect, useState } from "react";

export default function Queue(props) {
    const [ghost, setGhost] = useState(false);

    function dequeue() {
        props.addDeleteQueue(props.id);
        setGhost(true);
    }

    useEffect(() => {
        if (ghost && !props.editing) {
            setGhost(false);
        }
    }, [ghost, props.editing]);

    return (
        <animated.li className={`queued-song nqb-bg ${ghost ? "hidden" : ""} ${props.active ? "dragging" : ""}`.trim()} style={props.style}>
            <i role={props.editing ? "button" : undefined} className={`queue-draggable-icon queue-button-icon ${props.editing ? "" : "empty-icon"}`.trim()} ref={props.dragRef} {...(props.editing ? props.dragBinder() : {})} />
            <div className="queued-title center">
                <a href={props.url} target="_blank" rel="noreferrer" className={`greyple-text ${props.editing ? "disabled" : ""}`.trim()}>{props.title}</a>
            </div>
            <i role={props.editing ? "button" : undefined} className={`queue-remove-icon queue-button-icon ${props.editing ? "" : "empty-icon"}`.trim()} onClick={props.editing ? dequeue : undefined} />
        </animated.li>
    );
};
