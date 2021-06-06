import { createRef, useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import Action from "../../components/Action";
import Loading from "../../components/Loading";
import FilterDropdown from "../../components/FilterDropdown";
import API from "../../utils/API";
import Toast from "../../utils/Toast";
import isDescendent from "../../utils/isDescendent";
import "./Audit.css";

export default function Audit(props) {
    const guildID = ((window.location.pathname.match(/audit\/[0-9]+/gi) || [""])[0].match(/[0-9]+/g) || [""])[0];
    const userRef = createRef();
    const actionRef = createRef();
    const dropRef = createRef();
    const [ready, setReady] = useState(false);
    const [log, setLog] = useState([]);
    const [users, setUserList] = useState([]);
    const [userFilter, setUser] = useState({
        name: "All",
        value: null
    });
    const [actionFilter, setAction] = useState({
        name: "All",
        value: null
    });
    const [picking, setPicking] = useState(0);

    function toggleDropdown(event, value) {
        if (!isDescendent(event.target, dropRef.current)) {
            setPicking(picking && picking === value ? 0 : value);
        }
    }

    function isOut(child) {
        return (child === userRef.current || child === actionRef.current) ? false : child === props.appRef.current ? true : isOut(child.parentNode);
    }

    function selectUser(userID) {
        setUser(userID);
        setPicking(0);
    }

    function selectAction(actionCode) {
        setAction(actionCode);
        setPicking(0);
    }

    useEffect(() => {
        let mounted = true;
        setReady(false);
        Promise.all([
            API.getAudit(guildID, userFilter.value, actionFilter.value),
            API.getMembers(guildID)
        ])
            .then(([newLog, members]) => {
                if (mounted) {
                    if (newLog && members) {
                        setLog(newLog);
                        setUserList(members);
                    }
                    else {
                        Toast("Failed to get audit log", 1);
                    }
                    setReady(true);
                }
            })
            .catch(console.error);
        return () => mounted = false;
    }, [guildID, userFilter, actionFilter]);
    useEffect(() => {
        function outClick(event) {
            if (isOut(event.target)) {
                setPicking(0);
            }
        }

        props.appRef.current.addEventListener("click", outClick);
        return () => {
            if (props.appRef.current) {
                props.appRef.current.removeEventListener("click", outClick);
            }
        };
    });

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
                            <div role="button" className="audit-desktop-filter hide-on-small-only" onClick={event => toggleDropdown(event, 1)} ref={userRef}>
                                {userFilter.name}
                                <i className="audit-filter-dropdown-icon" />
                                {picking === 1 ? <FilterDropdown users={users} activeValue={userFilter ? userFilter.value : null} select={selectUser} ref={dropRef} /> : undefined}
                            </div>
                            <span className="audit-desktop-filter greyple-text hide-on-small-only">Filter by Action</span>
                            <div role="button" className="audit-desktop-filter hide-on-small-only" onClick={event => toggleDropdown(event, 2)} ref={actionRef}>
                                {actionFilter.name}
                                <i className="audit-filter-dropdown-icon" />
                                {picking === 2 ? <FilterDropdown activeValue={actionFilter ? actionFilter.value : null} select={selectAction} ref={dropRef} /> : undefined}
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
