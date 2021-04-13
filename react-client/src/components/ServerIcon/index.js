import { useState } from "react";
import { useHistory } from "react-router";
import "./ServerIcon.css";

export default function ServerIcon(props) {
    const history = useHistory();
    const [active, setActive] = useState(false);

    function click() {
        history.push(`/server/${props.id}`);
    }

    return (
        <div className="server-select center col s6 m1">
            <img
                role="button"
                className="server-icon circle"
                src={`https://cdn.discordapp.com/icons/${props.id}/${props.icon}`}
                alt={`${props.name} icon`}
                data-tooltip={props.name}
                onClick={click}
                onMouseEnter={() => setActive(true)}
                onMouseLeave={() => setActive(false)}
            />
            <div className={`server-name ${active ? "active" : "disabled"} dtnqb-bg`}>aaaaaaaaaaaaaaaaaaaaaaaaa</div>
        </div>
    );
};
