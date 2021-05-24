import { createRef, useCallback, useEffect, useRef, useState } from "react";
import { useDrag, useScroll } from "react-use-gesture";
import { useSprings } from "@react-spring/core";
import Queue from "./Queue";
import "./DesktopQueueList.css";

function queueFromDrag(child) {
    return child.classList.contains("queued-song") ? child : child.parentNode ? child.parentNode : null;
}

export default function Desktop(props) {
    const listRef = createRef();
    const [renderQueue, setRender] = useState(props.queue);
    const [active, setActive] = useState(null);
    const scroll = useRef(0);
    const createDragRefs = useCallback(() => {
        let list = [];
        for (let i = 0; i < props.queue.length; i++) {
            list.push(createRef());
        }
        return list;
    }, [props.queue]);
    const [drags, setDrags] = useState(createDragRefs());
    const [coords, springs] = useSprings(props.queue.length, () => ({ y: 0 }));
    const dragBinder = useDrag(state => {
        let activeItem = queueFromDrag(state.event.target);
        let index = Array.from(activeItem.parentNode.children).indexOf(activeItem);
        if (state.down) {
            if (state.first) {
                scroll.current = 0;
                setActive(index);
            }
            springs.start(i => {
                if (i === index) {
                    let bounds = listRef.current.getBoundingClientRect();
                    if (bounds.top < state.xy[1] && bounds.bottom > state.xy[1]) {
                        return { y: state.movement[1] + scroll.current };
                    }
                }
                else {
                    let activeHeight = activeItem.getBoundingClientRect().height;
                    let activeY = drags[index].current.getBoundingClientRect().y;
                    let otherY = drags[i].current.getBoundingClientRect().y;
                    if (index < i && (state.xy[1] >= Math.floor(otherY) || activeY >= otherY)) {
                        return { y: -activeHeight };
                    }
                    else if (index > i && (state.xy[1] <= Math.floor(otherY) || activeY <= otherY)) {
                        return { y: activeHeight };
                    }
                    else {
                        return { y: 0 };
                    }
                }
            });
        }
        else {
            finalizeOrder();
            scroll.current = 0;
            setActive(null);
            springs.start(() => ({ y: 0 }));
        }
    }, {
        axis: "y",
        useTouch: true,
        filterTaps: true,
        experimental_preventWindowScrollY: true
    });

    function finalizeOrder() {
        let newOrder = props.queue.slice()
            .sort((a, b) => drags[props.queue.indexOf(a)].current.getBoundingClientRect().y - drags[props.queue.indexOf(b)].current.getBoundingClientRect().y);
        if (newOrder.some((newItem, i) => newItem !== props.queue[i])) {
            setRender(newOrder);
            props.socket.emit("queueOrderFirst", newOrder.map(queue => queue.id));
        }
    }

    useScroll(state => {
        if (state.last) {
            scroll.current += state.movement[1];
        }
    }, { domTarget: window });
    useEffect(() => {
        if (drags.length !== props.queue.length) {
            setDrags(createDragRefs());
        }
    }, [drags.length, props.queue.length, createDragRefs]);
    useEffect(() => {
        springs.set({ y: 1 });
        springs.set({ y: 0 });
    }, [springs, renderQueue]);
    useEffect(() => {
        setRender(props.queue);
    }, [props.queue]);

    return (
        <article className="server-info-container desktop-queue hide-on-small-only">
            <h5 className="queue-title nqb-bg">Queued:</h5>
            <ul ref={listRef}>
                {renderQueue.map((item, i) => <Queue key={item.id} id={item.id} socket={props.socket} title={item.Song.title} url={item.Song.url} dragBinder={dragBinder} dragRef={drags[i]} active={active === i} style={coords[i]} />)}
            </ul>
        </article>
    );
};
