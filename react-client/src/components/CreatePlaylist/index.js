import API from "../../utils/API";
import "./CreatePlaylist.css";

export default function CreatePlaylist(props) {
    function submit(event) {
        let name = event.target.name.value.trim();
        event.preventDefault();
        if (name) {
            API.createPlaylist(props.guildId, name)
                .then(res => {
                    if (res) {
                        props.onSuccess(res);
                    }
                })
                .catch(err => {
                    console.error(err);
                    props.onError(err);
                });
        }
    }

    return (
        <form className="create-playlist" onSubmit={submit}>
            <input name="name" type="text" placeholder="New playlist name" className="new-playlist-input browser-default" />
        </form>
    );
};
