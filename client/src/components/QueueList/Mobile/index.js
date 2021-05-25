import { createRef, useCallback, useEffect, useRef, useState } from "react";
import { animated, useSpring, useSprings } from "react-spring";
import { useDrag, useScroll } from "react-use-gesture";
import Queue from "./Queue";
import "./MobileQueueList.css"

function queueFromDrag(child) {
    return child.classList.contains("queued-song") ? child : child.parentNode ? child.parentNode : null;
}

export default function Mobile(props) {
    const queueRef = createRef();
    const scroll = useRef(0);
    const interval = useRef(null);
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
            let heightThreshold = Math.ceil(3 * window.innerHeight / 100);
            if (state.first) {
                scroll.current = 0;
                setActive(index);
            }
            if (state.xy[1] < heightThreshold || state.xy[1] > window.innerHeight - heightThreshold) {
                scrollInterval(state.xy[1] < heightThreshold);
            }
            else {
                clearInterval(interval.current);
                interval.current = null;
            }
            api.start(i => {
                if (i === index) {
                    return { y: state.movement[1] + scroll.current };
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
            clearInterval(interval.current);
            interval.current = null;
            scroll.current = 0;
            setActive(null);
            api.start(() => ({ y: 0 }));
        }
    }, {
        axis: "y",
        useTouch: true,
        filterTaps: true,

        experimental_preventWindowScrollY: true
    });

    function scrollInterval(up) {
        if (interval.current === null) {
            interval.current = setInterval(() => {
                if (queueRef.current) {
                    queueRef.current.scrollBy(0, Math.ceil(window.innerHeight / 500) * (up ? -1 : 1))
                }
            }, 5);
        }
    }

    function toggleEdit() {
        if (editing) {
            finalizeOrder();
        }
        setEditing(!editing);
    }

    function cancelEdit() {
        setRender(props.queue);
        setEditing(false);
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

    useScroll(state => {
        if (state.last) {
            scroll.current += state.movement[1];
        }
    }, { domTarget: queueRef });
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
    useEffect(() => () => {
        clearInterval(interval.current);
        interval.current = null;
    });

    return (
        <animated.article className="mobile-queue nqb-bg hide-on-med-and-up" style={coords} ref={queueRef}>
            {editing ? <button className="queue-edit-cancel btn greyple-bg focus-lighten" onClick={cancelEdit}>Cancel</button> : undefined}
            <button className="queue-edit btn kenny-bg focus-lighten" onClick={toggleEdit}>{editing ? "Save" : "Edit"}</button>
            <h4 className="queue-title center">Queue</h4>
            <ul>
                {renderQueue.map((item, i) => <Queue key={item.id} editing={editing} id={item.id} socket={props.socket} title={item.Song.title} url={item.Song.url} dragBinder={reorderBinder} dragRef={drags[i]} active={active === i} style={order[i]} />)}
            </ul>
        </animated.article>
    );
};
