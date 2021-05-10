import Queue from "./Queue";
import "./QueueList.css";

export default function QueueList(props) {
    console.log(props);
    return (
        <section className="queue-list nqb-bg">
            <h5 className="queue-title">Queued:</h5>
            <ul>
                {props.queue.map(item => <Queue key={item.id} id={item.id} title={item.Song.title} url={item.Song.url} />)}
            </ul>
        </section>
    );
};
