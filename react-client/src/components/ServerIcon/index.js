import "./ServerIcon.css";

export default function ServerIcon(props) {
    return (
        <img
            role="button"
            onClick={() => props.select(props.id)}
            className="server-icon circle col s6 m1"
            src={`https://cdn.discordapp.com/icons/${props.id}/${props.icon}`}
            alt={`${props.name} icon`}
            data-tooltip={props.name}
        />
    );
};
