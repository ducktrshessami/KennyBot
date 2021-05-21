import { createRef, useCallback, useEffect, useState } from "react";
import { useDrag } from "react-use-gesture";
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
    const [bounds, setBounds] = useState(null);
    const createDragRefs = useCallback(() => {
        let list = [];
        for (let i = 0; i < props.queue.length; i++) {
            list.push(createRef());
        }
        return list;
    }, [props.queue]);
    const [drags, setDrags] = useState(createDragRefs);
    const [coords, springs] = useSprings(props.queue.length, () => ({ y: 0 }));

    function CreateGesture(index) {
        return useDrag(state => {
            if (state.down) {
                setActive(index);
                springs.start(i => {
                    if (i === index) {
                        if (bounds && bounds.top < state.xy[1] && bounds.bottom > state.xy[1]) {
                            return { y: state.movement[1] };
                        }
                    }
                    else {
                        let activeItem = queueFromDrag(drags[index].current);
                        if (activeItem) {
                            let activeHeight = activeItem.getBoundingClientRect().height;
                            let activeY = drags[index].current.getBoundingClientRect().y;
                            let otherY = drags[i].current.getBoundingClientRect().y;
                            if (index < i && activeY > otherY) {
                                return { y: -activeHeight };
                            }
                            else if (index > i && activeY < otherY) {
                                return { y: activeHeight };
                            }
                        }
                        return { y: 0 };
                    }
                });
            }
            else {
                finalizeOrder();
                setActive(null);
                springs.start(() => ({ y: 0 }));
            }
        }, { axis: "y" });
    }

    function finalizeOrder() {
        let changed = false;
        let newOrder = props.queue.slice()
            .sort((a, b) => drags[props.queue.indexOf(a)].current.getBoundingClientRect().y - drags[props.queue.indexOf(b)].current.getBoundingClientRect().y);
        for (let i = 0; i < newOrder.length; i++) {
            if (newOrder[i] !== props.queue[i]) {
                changed = true;
            }
        }
        if (changed) {
            setRender(newOrder);
            props.socket.emit("queueOrderFirst", newOrder.map(queue => queue.id));
        }
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
                {renderQueue.map((item, i) => <Queue key={item.id} id={item.id} socket={props.socket} title={item.Song.title} url={item.Song.url} dragBinder={CreateGesture(i)} dragRef={drags[i]} active={active === i} style={coords[i]} />)}
            </ul>
        </article>
    );
};
