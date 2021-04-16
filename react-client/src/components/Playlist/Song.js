import "./Song.css";

export default function Song(props) {
    return (
        <li className="song">
            <div role="button" className="song-title dark-kenny-bg focus-lighten">
                {props.title}
            </div>
        </li>
    );
};
