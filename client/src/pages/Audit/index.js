import { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import API from "../../utils/API";
import "./Audit.css";

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
            <main>
                {!this.props.user && this.props.ready ? <Redirect to="/" /> : undefined}
                <div className="audit-wrapper">
                    <Link to={`/server/${this.guildID}`} className="greyple-bg focus-darken white-text btn">❮ Back</Link>
                </div>
            </main>
        );
    }
};
