import { createRef } from "react";
import Queue from "./Queue";
import "./QueueList.css";

export default function QueueList(props) {
    const listRef = createRef();

    function getListRect() {
        return listRef.current.getBoundingClientRect();
    }

    console.log(props);

    return (
        <section>
            <h5 className="queue-title nqb-bg">Queued:</h5>
            <ul ref={listRef}>
                {props.queue.map(item => <Queue key={item.id} id={item.id} socket={props.socket} title={item.Song.title} url={item.Song.url} getListRect={getListRect} />)}
            </ul>
        </section>
    );
};
