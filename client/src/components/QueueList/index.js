import { useEffect, useState } from "react";
import Desktop from "./Desktop";
import Mobile from "./Mobile";

export default function QueueList(props) {
    const [small, setSmall] = useState(window.innerWidth < 601);

    useEffect(() => {
        function handler() {
            setSmall(window.innerWidth < 601);
        }

        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    });

    return small ? <Mobile {...props} /> : Boolean(props.queue.length) ? <Desktop {...props} /> : null;
};
