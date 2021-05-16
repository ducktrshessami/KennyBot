import { createRef, useEffect, useState } from "react";
import { useDrag } from "react-use-gesture";
import Queue from "./Queue";
import "./QueueList.css";

function queueFromDrag(child) {
    return child.classList.contains("queued-song") ? child : child.parentNode ? child.parentNode : null;
}

export default function QueueList(props) {
    const listRef = createRef();
    const [active, setActive] = useState(null);
    const [activeOffset, setOffset] = useState(0);
    const [activeY, setY] = useState(0);
    const [bounds, setBounds] = useState(null);
    const dragBinder = useDrag(state => {
        let activeItem = queueFromDrag(state.event.target);
        if (!active && activeItem) {
            setActive({
                index: props.queue.findIndex(item => item.id === activeItem.dataset.id),
                height: activeItem.getBoundingClientRect().height
            });
        }
        if (state.down) {
            if (bounds && state.xy[1] > bounds.top && state.xy[1] < bounds.bottom) {
                setOffset(state.movement[1]);
                setY(state.xy[1]);
            }
        }
        else {
            setActive(null);
            setOffset(0);
            setY(0);
        }
    }, { axis: "y" });

    useEffect(() => {
        if (listRef.current) {
            let prev = bounds || {};
            let next = listRef.current.getBoundingClientRect();
            if (prev.top !== next.top || prev.bottom !== next.bottom) {
                setBounds(next);
            }
        }
    }, [listRef, bounds]);

    return (
        <section>
            <h5 className="queue-title nqb-bg">Queued:</h5>
            <ul ref={listRef}>
                {props.queue.map((item, i) => <Queue key={item.id} index={i} id={item.id} socket={props.socket} title={item.Song.title} url={item.Song.url} dragBinder={dragBinder} activeItem={active} activeOffset={activeOffset} activeY={activeY} />)}
            </ul>
        </section>
    );
};
