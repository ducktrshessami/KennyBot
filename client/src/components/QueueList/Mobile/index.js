import { useEffect, useState } from "react";
import { animated, useSpring } from "react-spring";
import { useDrag } from "react-use-gesture";
import "./MobileQueueList.css"

export default function Mobile(props) {
    const [visible, setVisible] = useState(false);
    const [coords, spring] = useSpring(() => ({ x: visible ? 0 : -window.innerWidth }));

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
            spring.start({ x: visible ? 0 : -window.innerWidth });
        }
    }, {
        axis: "x",
        useTouch: true,
        filterTaps: true,
        swipeDuration: Infinity,
        experimental_preventWindowScrollY: true,
        domTarget: document.getElementById("root")
    });
    useEffect(() => {
        spring.start({ x: visible ? 0 : -window.innerWidth });
    });

    return (
        <animated.article className="mobile-queue kenny-bg hide-on-med-and-up" style={coords}>asdf</animated.article>
    );
};
