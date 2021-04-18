import { Component, createRef } from "react";
import "./EditForm.css";

export default class EditForm extends Component {
    state = { name: this.props.initialValue || "" };
    inputRef = createRef();

    componentDidMount() {
        this.inputRef.current.focus();
    }

    change(event) {
        this.setState({ name: event.target.value });
    }

    submit = (event) => {
        event.preventDefault();
    }

    render() {
        return (
            <form className="edit-playlist" onSubmit={event => this.submit(event)} ref={this.props.editRef}>
                <input id="edit-playlist-input" value={this.state.name} name="name" type="text" placeholder="Playlist name" className={`edit-playlist-input browser-default ${this.state.name.trim().length > 100 ? "invalid" : undefined}`.trim()} onChange={event => this.change(event)} ref={this.inputRef} />
            </form>
        );
    }
};
