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
    const [y, setY] = useState(0);
    const [bounds, setBounds] = useState(null);
    const dragBinder = useDrag(state => {
        let activeItem = queueFromDrag(state.event.target);
        if (!active && activeItem) {
            setActive({
                id: activeItem.dataset.id,
                height: activeItem.getBoundingClientRect().height
            });
        }
        if (state.down) {
            if (bounds && state.xy[1] > bounds.top && state.xy[1] < bounds.bottom) {
                setY(state.movement[1]);
            }
        }
        else {
            setActive(null);
            setY(0);
        }
    }, { axis: "y" });
    const rendered = props.queue.map(item => {
        let activeItem = active && item.id === active.id;
        return <Queue key={item.id} id={item.id} socket={props.socket} title={item.Song.title} url={item.Song.url} dragBinder={dragBinder} active={activeItem} y={activeItem ? y : 0} />
    });

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
                {rendered}
            </ul>
        </section>
    );
};
