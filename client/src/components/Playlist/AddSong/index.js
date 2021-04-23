import { createRef } from "react";
import Confirm from "../../Confirm";
import "./AddSong.css";

export default function AddSong(props) {
    const inRef = createRef();

    function submit() {

    }

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
