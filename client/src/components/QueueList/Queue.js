export default function Queue(props) {
    function dequeue() {
        if (props.socket) {
            props.socket.emit("songDequeue", props.id);
        }
    }

    console.log(props);

    return (
        <li className="queued-song">
            <i role="button" className="queue-draggable-icon queue-button-icon" />
            <div className="queued-title center">
                <a href={props.url} target="_blank" rel="noreferrer" className="greyple-text">{props.title} <i /></a>
            </div>
            <i role="button" className="queue-remove-icon queue-button-icon" onClick={dequeue} />
        </li>
    );
}