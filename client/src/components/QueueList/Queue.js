import { createRef, useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";

export default function Queue(props) {
    const active = props.activeItem && props.activeItem.index === props.index;
    const dragRef = createRef();
    const [ghost, setGhost] = useState(false);
    const [coords, spring] = useSpring(() => ({ y: 0 }));

    function dequeue() {
        if (props.socket) {
            props.socket.emit("songDequeue", props.id);
            setGhost(true);
        }
    }

    useEffect(() => {
        if (active) {
            spring.start({ y: props.activeOffset });
        }
        else {
            if (dragRef.current) {
                if (props.activeItem && props.activeItem.height && props.activeY) {
                    let dragRect = dragRef.current.getBoundingClientRect();
                    if (props.index < props.activeItem.index && dragRect.y > props.activeY) {
                        spring.start({ y: props.activeItem.height });
                        return;
                    }
                    else if (props.index > props.activeItem.index && dragRect.y < props.activeY) {
                        spring.start({ y: -props.activeItem.height });
                        return;
                    }
                }
                spring.start({ y: 0 });
            }
        }
    }, [active, dragRef, props.activeItem, props.activeOffset, props.activeY, props.index, spring]);

    return ghost ? null : (
        <animated.li data-id={props.id} className={`queued-song ${active ? "dragging" : ""}`.trim()} style={coords}>
            <i role="button" className="queue-draggable-icon queue-button-icon" ref={dragRef} {...props.dragBinder()} />
            <div className="queued-title center">
                <a href={props.url} target="_blank" rel="noreferrer" className="greyple-text">{props.title} <i /></a>
            </div>
            <i role="button" className="queue-remove-icon queue-button-icon" onClick={dequeue} />
        </animated.li>
    );
}