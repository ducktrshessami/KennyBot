import Queue from "./Queue";

export default function QueueList(props) {
    console.log(props);
    return (
        <section className="nqb-bg">
            <ul>
                {props.queue.map(item => <Queue key={item.id} id={item.id} {...item.Song} />)}
            </ul>
        </section>
    );
};
