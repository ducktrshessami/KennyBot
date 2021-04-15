import API from "../../utils/API";
import "./CreatePlaylist.css";

export default function CreatePlaylist(props) {
    function submit(event) {
        event.preventDefault();
        props.onSuccess(event);
    }

    return (
        <form className="create-playlist" onSubmit={submit}>
            <input type="text" placeholder="New playlist name" className="new-playlist-input browser-default" />
        </form>
    );
};
