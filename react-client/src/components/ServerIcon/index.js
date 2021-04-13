import { useHistory } from "react-router";
import "./ServerIcon.css";

export default function ServerIcon(props) {
    const history = useHistory();
    return (
        <img
            role="button"
            onClick={() => history.push(`/server/${props.id}`)}
            className="server-icon circle col s6 m1"
            src={`https://cdn.discordapp.com/icons/${props.id}/${props.icon}`}
            alt={`${props.name} icon`}
            data-tooltip={props.name}
        />
    );
};
