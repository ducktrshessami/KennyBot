import { useEffect, useState } from "react";
import Desktop from "./Desktop";
import Mobile from "./Mobile";
import "./QueueList.css";

export default function QueueList(props) {
    const [small, setSmall] = useState(window.innerWidth < 601);

    useEffect(() => {
        function handler() {
            setSmall(window.innerWidth < 601);
        }

        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    });

    return small ? <Mobile queue={props.queue || []} socket={props.socket} /> : props.voice && Boolean(props.queue.length) ? <Desktop queue={props.queue || []} socket={props.socket} /> : null;
};
