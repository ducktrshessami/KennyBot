import { Component } from "react";
import API from "../../utils/API";

export default class Audit extends Component {
    guildID = ((window.location.pathname.match(/audit\/[0-9]+/gi) || [""])[0].match(/[0-9]+/g) || [""])[0];
    state = {
        ready: false,
        log: []
    }

    componentDidMount() {
        API.getAudit(this.guildID)
            .then(console.log)
            .catch(console.error);
    }

    render() {
        return (
            <main></main>
        );
    }
};
