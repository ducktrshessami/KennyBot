import { useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import Action from "../../components/Action";
import Loading from "../../components/Loading";
import API from "../../utils/API";
import Toast from "../../utils/Toast";
import "./Audit.css";

export default function Audit(props) {
    const guildID = ((window.location.pathname.match(/audit\/[0-9]+/gi) || [""])[0].match(/[0-9]+/g) || [""])[0];
    const [ready, setReady] = useState(false);
    const [log, setLog] = useState([]);
    const [userFilter, setUser] = useState(null);
    const [actionFilter, setAction] = useState(null);

    useEffect(() => {
        let mounted = true;
        setReady(false);
        API.getAudit(guildID, userFilter, actionFilter)
            .then(newLog => {
                if (mounted) {
                    setLog(newLog);
                    setReady(true);
                }
            })
            .catch(err => {
                Toast("Failed to get audit log", 1);
                console.error(err);
            });
        return () => mounted = false;
    }, [guildID, userFilter, actionFilter]);

    return (
        <main>
            {!props.user && props.ready ? <Redirect to="/" /> : undefined}
            <div className="audit-wrapper">
                <Link to={`/server/${guildID}`} className="greyple-bg focus-darken white-text btn">❮ Back</Link>
                <div className="audit-container row">
                    <div className="col s12 l8 offset-l2">
                        <div className="audit-header">
                            <h4 className="audit-title">Audit Log</h4>
                            <span className="audit-desktop-filter greyple-text hide-on-small-only">Filter by User</span>
                            <div role="button" className="audit-desktop-filter hide-on-small-only">
                                {userFilter ? userFilter.username : "All"}
                                <i className="audit-filter-dropdown-icon" />
                            </div>
                            <span className="audit-desktop-filter greyple-text hide-on-small-only">Filter by Action</span>
                            <div role="button" className="audit-desktop-filter hide-on-small-only">
                                {actionFilter ? actionFilter.name : "All"}
                                <i className="audit-filter-dropdown-icon" />
                            </div>
                        </div>
                        <hr />
                        <ul className="action-list">
                            {ready && props.ready ? log.map(action => <Action key={action.id} {...action} />) : <Loading className="center" size="big" />}
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
};
