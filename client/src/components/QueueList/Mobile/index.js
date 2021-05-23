import { createRef, useCallback, useEffect, useState } from "react";
import { animated, useSpring, useSprings } from "react-spring";
import { useDrag } from "react-use-gesture";
import Queue from "./Queue";
import "./MobileQueueList.css"

function queueFromDrag(child) {
    return child.classList.contains("queued-song") ? child : child.parentNode ? child.parentNode : null;
}

export default function Mobile(props) {
    const [visible, setVisible] = useState(false);
    const [editing, setEditing] = useState(false);
    const [active, setActive] = useState(null);
    const [renderQueue, setRender] = useState(props.queue);
    const [coords, spring] = useSpring(() => ({ x: visible ? 0 : -window.innerWidth }));
    const [order, api] = useSprings(props.queue.length, () => ({ y: 0 }));
    const createDragRefs = useCallback(() => {
        let list = [];
        for (let i = 0; i < props.queue.length; i++) {
            list.push(createRef());
        }
        return list;
    }, [props.queue]);
    const [drags, setDrags] = useState(createDragRefs());
    const reorderBinder = useDrag(state => {
        let activeItem = queueFromDrag(state.event.target);
        let index = Array.from(activeItem.parentNode.children).indexOf(activeItem);
        if (state.down) {
            setActive(index);
            api.start(i => {
                if (i === index) {
                    return { y: state.movement[1] };
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
            editOrder();
            setActive(null);
            api.start(() => ({ y: 0 }));
        }
    }, {
        axis: "y",
        useTouch: true,
        filterTaps: true,
        experimental_preventWindowScrollY: true
    });

    function toggleEdit() {
        if (editing) {
            finalizeOrder();
        }
        setEditing(!editing);
    }

    function getOrder() {
        return renderQueue.slice()
            .sort((a, b) => drags[renderQueue.indexOf(a)].current.getBoundingClientRect().y - drags[renderQueue.indexOf(b)].current.getBoundingClientRect().y)
    }

    function editOrder() {
        let newOrder = getOrder();
        if (newOrder.some((newItem, i) => newItem !== renderQueue[i])) {
            setRender(newOrder);
        }
    }

    function finalizeOrder() {
        let newOrder = getOrder();
        if (newOrder.some((newItem, i) => newItem !== props.queue[i])) {
            props.socket.emit("queueOrderFirst", newOrder.map(queue => queue.id));
        }
    }

    useDrag(state => {
        if (state.down) {
            spring.start({ x: visible ? Math.min(0, state.movement[0]) : Math.max(-window.innerWidth, state.movement[0] - window.innerWidth) });
        }
        else {
            switch (state.swipe[0]) {
                case 1: setVisible(true); break;
                case -1: setVisible(false); break;
                default: setVisible(coords.x.get() > (-window.innerWidth / 2)); break;
            }
            spring.start({ x: visible ? 0 : -window.innerWidth - 50 });
        }
    }, {
        axis: "x",
        bounds: {
            left: -window.innerWidth,
            right: window.innerWidth
        },
        useTouch: true,
        filterTaps: true,
        swipeDuration: Infinity,
        swipeDistance: 20,
        experimental_preventWindowScrollY: true,
        domTarget: document.getElementById("root")
    });
    useEffect(() => {
        spring.start({ x: visible ? 0 : -window.innerWidth - 50 });
    });
    useEffect(() => {
        if (drags.length !== props.queue.length) {
            setDrags(createDragRefs());
        }
    }, [drags.length, props.queue.length, createDragRefs]);
    useEffect(() => {
        setRender(props.queue);
    }, [props.queue]);
    useEffect(() => {
        api.set({ y: 1 });
        api.set({ y: 0 });
    }, [api, renderQueue]);

    return (
        <animated.article className="mobile-queue nqb-bg hide-on-med-and-up" style={coords}>
            <button className="queue-edit btn kenny-bg focus-lighten" onClick={toggleEdit}>{editing ? "Save" : "Edit"}</button>
            <h4 className="queue-title center">Queue</h4>
            <ul>
                {renderQueue.map((item, i) => <Queue key={item.id} editing={editing} id={item.id} socket={props.socket} title={item.Song.title} url={item.Song.url} dragBinder={reorderBinder} dragRef={drags[i]} active={active === i} style={order[i]} />)}
            </ul>
        </animated.article>
    );
};
