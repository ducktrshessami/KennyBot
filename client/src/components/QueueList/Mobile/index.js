import { useEffect, useState } from "react";
import { animated, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";
import Queue from "./Queue";
import "./MobileQueueList.css"

export default function Mobile(props) {
    const [visible, setVisible] = useState(false);
    const [coords, spring] = useSpring(() => ({ x: visible ? 0 : -window.innerWidth }));
    const dragBind = useDrag(state => {

    });

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
        experimental_preventWindowScrollY: true,
        domTarget: document.getElementById("root")
    });
    useEffect(() => {
        spring.start({ x: visible ? 0 : -window.innerWidth - 50 });
    });

    return (
        <animated.article className="mobile-queue nqb-bg hide-on-med-and-up" style={coords}>
            <h4 className="queue-title center">Queue</h4>
            <ul>
                {props.queue.map(item => <Queue key={item.id} id={item.id} socket={props.socket} title={item.Song.title} url={item.Song.url} />)}
            </ul>
        </animated.article>
    );
};
