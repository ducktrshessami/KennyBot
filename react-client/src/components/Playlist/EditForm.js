import { useState } from "react";
import "./EditForm.css";

export default function EditForm(props) {
    const [name, setName] = useState(props.initialValue || "");

    function change(event) {
        setName(event.target.value);
    }

    function submit(event) {

    }

    function cancel(event) {
        event.preventDefault();
        props.onCancel();
    }

    return (
        <form className="edit-playlist" onSubmit={submit}>
            <input id="edit-playlist-input" value={name} name="name" type="text" placeholder="Playlist name" className={`edit-playlist-input browser-default ${name.trim().length > 100 ? "invalid" : undefined}`.trim()} onChange={change} />
        </form>
    )
};
