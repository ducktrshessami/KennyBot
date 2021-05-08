import { createRef, useEffect } from "react";
import Confirm from "../../Confirm";
import API from "../../../utils/API";
import Toast from "../../../utils/Toast";
import "./Import.css";

export default function Import(props) {
    const inRef = createRef();

    function submit(event) {
        if (event) {
            event.preventDefault();
        }
        let url = inRef.current.value.trim();
        if (url) {
            API.importPlaylist(props.guildId, props.playlistId, url)
                .then(res => {
                    if (res.status === 200) {
                        Toast("Success!");
                    }
                    else {
                        Toast("Failed to import playlist", 1);
                    }
                });
            props.close();
        }
    }

    useEffect(() => inRef.current.focus());

    return (
        <Confirm title={`Import playist to ${props.playlist}`} onOk={submit} onCancel={props.close} >
            <form onSubmit={submit}>
                <div className="import-input-field input-field">
                    <input name="url" type="text" className="import-input validate white-text" ref={inRef} />
                    <label htmlFor="url" className="import-input-label greyple-text">Playlist URL</label>
                </div>
            </form>
        </Confirm>
    );
};
