import { Component, createRef } from "react";
import Option from "./Option";
import "./ContextMenu.css";

function isDescendent(child, ancestor) {
    return child && ancestor ? child === ancestor ? true : child === document.body ? false : isDescendent(child.parentNode, ancestor) : false;
}

export default class ContextMenu extends Component {
    state = {
        ready: false,
        active: false
    }
    ref = createRef()
    clickHandler = (event) => {
        let newState = false;
        if (isDescendent(event.target, this.props.buttonRef.current)) {
            newState = !this.state.active;
        }
        if (newState !== this.state.active) {
            this.setState({
                ...this.state,
                active: newState
            });
        }
    }

    componentDidMount() {
        if (this.props.buttonRef.current) {
            document.getElementById("root").addEventListener("click", this.clickHandler);
            this.setState({ ready: true });
        }
    }

    componentWillUnmount() {
        document.getElementById("root").removeEventListener("click", this.clickHandler);
    }

    render() {
        return this.state.ready && this.state.active ? (
            <ul className={`context-menu card ${this.props.className || ""}`.trim()} ref={this.ref}>
                {this.props.options.map(option => <Option key={option.name} className={this.props.optionClassName} {...option} />)}
            </ul>
        ) : null
    }
};
