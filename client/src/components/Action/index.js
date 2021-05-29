import "./Action.css";

export default function Action(props) {
    var header = `${props.User.username}#${props.User.discriminator} `;
    switch (props.code) {
        case 0: header += `paused ${props.vars[0]}`; break;
        case 1: header += `unpaused ${props.vars[0]}`; break;
        case 2: header += `skipped ${props.vars[0]}`; break;
        case 3: header += `set the volume to ${props.vars[0]}`; break;
        case 4: header += `toggled shuffle ${props.vars[0]}`; break;
        case 5:
            switch (props.vars[0]) {
                case 0: header += "turned off repeat"; break;
                case 1: header += "turned on repeat one"; break;
                case 2: header += "turned on repeat all"; break;
                default:
            }
            break;
        case 6: header += `played song: ${props.vars[0]}`; break;
        case 7: header += `played playlist: ${props.vars[0]}`; break;
        case 8: header += `shuffle played playlist: ${props.vars[0]}`; break;
        case 9: header += `queued ${props.vars[0]}`; break;
        case 10: header += `dequeued ${props.vars.length} song${props.vars > 1 ? "s" : ""}`; break;
        case 11: header += `created playlist: ${props.vars[0]}`; break;
        case 12: header += `renamed ${props.vars[0]} to ${props.vars[1]}`; break;
        case 13: header += `deleted playlist: ${props.vars[0]}`; break;
        case 14: header += `added ${props.vars.length - 1} song${props.vars.length > 2 ? "s" : ""} to ${props.vars[0]}`; break;
        case 15: header += `deleted ${props.vars[1]} from ${props.vars[0]}`; break;
        default:
    }
    return (
        <li className="audit-action nqb-bg">
            {header.trim()}
        </li>
    );
};
