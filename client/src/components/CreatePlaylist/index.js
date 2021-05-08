import { createRef, useEffect, useState } from "react";
import API from "../../utils/API";
import "./CreatePlaylist.css";

export default function CreatePlaylist(props) {
    const inRef = createRef();
    const [name, setName] = useState("");

    function change(event) {
        setName(event.target.value.trim());
    }

    function submit(event) {
        event.preventDefault();
        if (name && name.length <= 100) {
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

    useEffect(() => inRef.current.focus());

    return (
        <form className="create-playlist" onSubmit={submit}>
            <input id="new-playlist-input" name="name" type="text" placeholder="New playlist name" className={`new-playlist-input browser-default ${name.length > 100 ? "invalid" : undefined}`.trim()} onChange={change} ref={inRef} />
            <span className="new-playlist-counter black-text">{name.length}/100</span>
            <button type="submit" className="create-playlist-submit btn btn-large blurple-bg focus-lighten">+</button>
        </form>
    );
};
