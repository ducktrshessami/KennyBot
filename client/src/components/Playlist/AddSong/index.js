import { createRef, useEffect } from "react";
import Confirm from "../../Confirm";
import API from "../../../utils/API";
import Toast from "../../../utils/Toast";
import "./AddSong.css";

export default function AddSong(props) {
    const inRef = createRef();

    function submit(event) {
        if (event) {
            event.preventDefault();
        }
        let url = inRef.current.value.trim();
        if (url) {
            API.addSong(props.guildId, props.playlistId, url)
                .then(song => {
                    if (song) {
                        Toast("Success!");
                    }
                    else {
                        Toast("Failed to add song", 1);
                    }
                });
            props.close();
        }
    }

    useEffect(() => inRef.current.focus());

    return (
        <Confirm title={`Add to ${props.playlist}`} onOk={submit} onCancel={props.close} >
            <form onSubmit={submit}>
                <div className="add-url-input-field input-field">
                    <input name="url" type="text" className="add-url-input validate white-text" ref={inRef} />
                    <label htmlFor="url" className="add-url-input-label greyple-text">Song URL</label>
                </div>
            </form>
        </Confirm>
    );
};
