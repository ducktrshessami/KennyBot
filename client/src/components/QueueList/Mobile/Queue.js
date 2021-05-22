import { animated } from "@react-spring/web";

export default function Queue(props) {
    return (
        <animated.li style={props.style}>
            {props.title}
        </animated.li>
    );
};
