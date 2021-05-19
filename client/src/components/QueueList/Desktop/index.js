import { createRef, useCallback, useEffect, useState } from "react";
import { useDrag } from "react-use-gesture";
import Queue from "./Queue";
import "./DesktopQueueList.css";

function queueFromDrag(child) {
    return child.classList.contains("queued-song") ? child : child.parentNode ? child.parentNode : null;
}

export default function Desktop(props) {
    const listRef = createRef();
    const [active, setActive] = useState(null);
    const [activeOffset, setOffset] = useState(0);
    const [activeY, setY] = useState(0);
    const [bounds, setBounds] = useState(null);
    const createDragRefs = useCallback(() => {
        let list = [];
        for (let i = 0; i < props.queue.length; i++) {
            list.push(createRef());
        }
        return list;
    }, [props.queue]);
    const dragBinder = useDrag(state => {
        let activeItem = queueFromDrag(state.event.target);
        if (!active && activeItem) {
            setActive({
                id: activeItem.dataset.id,
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
            if (active) {
                finalizeOrder();
            }
            setActive(null);
            setOffset(0);
            setY(0);
        }
    }, { axis: "y" });
    const [drags, setDrags] = useState(createDragRefs);

    function finalizeOrder() {
        props.socket.emit("queueOrderFirst", drags.map(drag => drag.current)
            .sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y)
            .map(drag => queueFromDrag(drag).dataset.id));
    }

    useEffect(() => {
        if (listRef.current) {
            let prev = bounds || {};
            let next = listRef.current.getBoundingClientRect();
            if (prev.top !== next.top || prev.bottom !== next.bottom) {
                setBounds(next);
            }
        }
    }, [listRef, bounds]);
    useEffect(() => {
        if (drags.length !== props.queue.length) {
            setDrags(createDragRefs());
        }
    }, [drags.length, props.queue.length, createDragRefs]);

    return (
        <article className="server-info-container desktop-queue hide-on-small-only">
            <h5 className="queue-title nqb-bg">Queued:</h5>
            <ul ref={listRef}>
                {props.queue.map((item, i) => <Queue key={item.id} index={i} id={item.id} socket={props.socket} title={item.Song.title} url={item.Song.url} dragBinder={dragBinder} activeItem={active} activeOffset={activeOffset} activeY={activeY} dragRef={drags[i]} />)}
            </ul>
        </article>
    );
};
