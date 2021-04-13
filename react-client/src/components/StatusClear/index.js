import { Component } from "react";

export default class StatusClear extends Component {
    componentDidMount() {
        if (window.location.search) {
            window.location.search = "";
        }
    }

    render() {
        return null;
    }
};
