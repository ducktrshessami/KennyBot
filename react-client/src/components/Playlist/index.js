export default function Playlist(props) {
    return (
        <li>
            <div className="card kenny-bg">
                <h5 className="card-title">{props.name}</h5>
            </div>
        </li>
    );
};
