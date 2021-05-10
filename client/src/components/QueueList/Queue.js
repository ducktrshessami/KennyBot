import { useState } from "react";
import { useDrag } from "react-use-gesture";
import { useSpring, animated } from "react-spring";

export default function Queue(props) {
    const [ghost, setGhost] = useState(false);
    const [{ y }, spring] = useSpring(() => ({ y: 0 }));
    const dragBind = useDrag(state => {
        let listRect = props.getListRect();
        if (state.xy[1] > listRect.top && state.xy[1] < listRect.bottom) {
            spring.start({ y: state.movement[1] });
        }
        if (!state.down) {
            //done sorting
        }
    });

    function dequeue() {
        if (props.socket) {
            props.socket.emit("songDequeue", props.id);
            setGhost(true);
        }
    }

    console.log(props);

    return ghost ? null : (
        <animated.li className="queued-song" style={{ y }}>
            <i role="button" className="queue-draggable-icon queue-button-icon" {...dragBind()} />
            <div className="queued-title center">
                <a href={props.url} target="_blank" rel="noreferrer" className="greyple-text">{props.title} <i /></a>
            </div>
            <i role="button" className="queue-remove-icon queue-button-icon" onClick={dequeue} />
        </animated.li>
    );
}