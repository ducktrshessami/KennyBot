import API from "../../utils/API";
import Toast from "../../utils/Toast";
import "./Song.css";

export default function Song(props) {
    function play() {
        API.playSong(props.guildId, props.id)
            .catch(err => {
                console.error(err);
                Toast(`Failed to play ${props.title}`);
            });
    }

    return (
        <li className="song">
            <div role="button" className="song-title dark-kenny-bg focus-lighten" onClick={play}>
                {props.title}
            </div>
        </li>
    );
};
