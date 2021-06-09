import { lazy, Suspense, useEffect, useState } from "react";
import "./QueueList.css";

const Desktop = lazy(() => import("./Desktop"));
const Mobile = lazy(() => import("./Mobile"));

export default function QueueList(props) {
    const [small, setSmall] = useState(window.innerWidth < 601);

    useEffect(() => {
        function handler() {
            setSmall(window.innerWidth < 601);
        }

        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    });

    return (
        <Suspense fallback={null}>
            {small ? <Mobile queue={props.queue || []} socket={props.socket} /> : props.voice && Boolean(props.queue.length) ? <Desktop queue={props.queue || []} socket={props.socket} /> : null}
        </Suspense>
    );
};
