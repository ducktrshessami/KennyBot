import { Component } from "react";
import Toast from "../../utils/Toast";

export default class Handler extends Component {
    componentDidMount() {
        if (this.props.location && this.props.location.search) {
            let params = new URLSearchParams(this.props.location.search);
            let status = params.get("status");
            let callback = () => this.done();
            switch (status) {
                case "0": Toast("Success!")
                    .then(callback)
                    .catch(console.error);
                    break;
                case "1": Toast("Failed to authorize", 1)
                    .then(callback)
                    .catch(console.error);
                    break;
                default: callback(); break;
            }
        }
    }

    done() {
        this.props.history.replace(this.props.location.pathname);
    }

    render() {
        return null;
    }
};
