import "./Playlist.css";

export default function Playlist(props) {
    return (
        <li>
            <div className="playlist card dark-kenny-bg">
                <h5 className="playlist-title card-title dark-kenny-bg focus-lighten">{props.name}</h5>
            </div>
        </li>
    );
};
