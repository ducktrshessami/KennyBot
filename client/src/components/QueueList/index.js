import Queue from "./Queue";
import "./QueueList.css";

export default function QueueList(props) {
    console.log(props);
    return (
        <section>
            <h5 className="queue-title nqb-bg">Queued:</h5>
            <ul>
                {props.queue.map(item => <Queue key={item.id} id={item.id} socket={props.socket} title={item.Song.title} url={item.Song.url} />)}
            </ul>
        </section>
    );
};
