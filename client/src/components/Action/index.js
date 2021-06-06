import OneTwo from "./OneTwo";
import Repeat from "./Repeat";
import "./Action.css";

export default function Action(props) {
    const timestamp = new Date(props.createdAt);
    var actionElements;
    switch (props.code) {
        case 0: actionElements = <OneTwo values={["paused ", props.vars[0]]} />; break;
        case 1: actionElements = <OneTwo values={["unpaused ", props.vars[0]]} />; break;
        case 2: actionElements = <OneTwo values={["skipped ", props.vars[0]]} />; break;
        case 3: actionElements = <OneTwo values={["set the volume to ", props.vars[0]]} />; break;
        case 4: actionElements = <OneTwo values={["toggled shuffle ", props.vars[0]]} />; break;
        case 5: actionElements = <Repeat value={Number(props.vars[0])} />; break;
        case 6: actionElements = <OneTwo values={["played song: ", props.vars[0]]} />; break;
        case 7: actionElements = <OneTwo values={["played playlist: ", props.vars[0]]} />; break;
        case 8: actionElements = <OneTwo values={["shuffle played playlist: ", props.vars[0]]} />; break;
        case 9: actionElements = <OneTwo values={["queued ", props.vars[0]]} />; break;
        case 10: actionElements = `dequeued ${props.vars.length} song${props.vars > 1 ? "s" : ""}`; break;
        case 11: actionElements = <OneTwo values={["created playlist: ", props.vars[0]]} />; break;
        case 12: actionElements = `renamed ${props.vars[0]} to ${props.vars[1]}`; break;
        case 13: actionElements = <OneTwo values={["deleted playlist: ", props.vars[0]]} />; break;
        case 14: actionElements = `added ${props.vars.length - 1} song${props.vars.length > 2 ? "s" : ""} to ${props.vars[0]}`; break;
        case 15: actionElements = `deleted ${props.vars[1]} from ${props.vars[0]}`; break;
        default:
    }
    return (
        <li className="audit-action nqb-bg">
            <img className="action-icon" alt="placeholder" src={`https://cdn.discordapp.com/avatars/${props.User.id}/${props.User.avatar}.png`} />
            <img className="action-avatar" alt={`${props.User.username}'s avatar`} src={`https://cdn.discordapp.com/avatars/${props.User.id}/${props.User.avatar}.png`} />
            <div className="action-info">
                <div className="action-details">
                    {props.User.username}<span className="action-discriminator">#{props.User.discriminator}</span> {actionElements}
                </div>
                <div className="action-timestamp">{timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}</div>
            </div>
        </li>
    );
};
