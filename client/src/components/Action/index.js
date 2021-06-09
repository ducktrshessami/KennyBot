import { useState } from "react";
import OneTwo from "./OneTwo";
import Repeat from "./Repeat";
import OneTwoOneTwo from "./OneTwoOneTwo";
import OneTwoOne from "./OneTwoOne";
import Extended from "./Extended";
import arrow from "../../images/grey-arrow.png";
import arrowDown from "../../images/grey-arrow-down.png";
import pauseIcon from "../../images/red-pause-icon.png";
import playIcon from "../../images/red-play-icon.png";
import skipIcon from "../../images/red-skip-icon.png";
import volumeIcon from "../../images/speaker-icon.png";
import shuffleIcon from "../../images/active-shuffle-icon.png";
import repeatIcon from "../../images/repeat-all-icon.png";
import queueIcon from "../../images/create-queue.png";
import dequeueIcon from "../../images/delete-queue.png";
import createPlaylistIcon from "../../images/create-playlist.png";
import editPlaylistIcon from "../../images/edit-playlist.png";
import deletePlaylistIcon from "../../images/delete-playlist.png";
import "./Action.css";

export default function Action(props) {
    var actionIcon = `https://cdn.discordapp.com/avatars/${props.User.id}/${props.User.avatar}.png`, actionElements;
    var activatable = false;
    const [active, setActive] = useState(false);
    const timestamp = new Date(props.createdAt);

    switch (props.code) {
        case 0:
            actionIcon = pauseIcon;
            actionElements = <OneTwo values={["paused ", props.vars[0]]} />;
            break;
        case 1:
            actionIcon = playIcon;
            actionElements = <OneTwo values={["unpaused ", props.vars[0]]} />;
            break;
        case 2:
            actionIcon = skipIcon;
            actionElements = <OneTwo values={["skipped ", props.vars[0]]} />;
            break;
        case 3:
            actionIcon = volumeIcon;
            actionElements = <OneTwo values={["set the volume to ", props.vars[0]]} />;
            break;
        case 4:
            actionIcon = shuffleIcon;
            actionElements = <OneTwo values={["toggled shuffle ", props.vars[0]]} />;
            break;
        case 5:
            actionIcon = repeatIcon;
            actionElements = <Repeat value={Number(props.vars[0])} />;
            break;
        case 6:
            actionIcon = playIcon;
            actionElements = <OneTwo values={["played song: ", props.vars[0]]} />;
            break;
        case 7:
            actionIcon = playIcon;
            actionElements = <OneTwo values={["played playlist: ", props.vars[0]]} />;
            break;
        case 8:
            actionIcon = playIcon;
            actionElements = <OneTwo values={["shuffle played playlist: ", props.vars[0]]} />;
            break;
        case 9:
            actionIcon = queueIcon;
            actionElements = <OneTwoOne values={["queued ", props.vars.length, ` song${props.vars.length > 1 ? "s" : ""}`]} />; activatable = true;
            break;
        case 10:
            actionIcon = dequeueIcon;
            actionElements = <OneTwoOne values={["dequeued ", props.vars.length, ` song${props.vars.length > 1 ? "s" : ""}`]} />; activatable = true;
            break;
        case 11:
            actionIcon = createPlaylistIcon;
            actionElements = <OneTwo values={["created playlist: ", props.vars[0]]} />;
            break;
        case 12:
            actionIcon = editPlaylistIcon;
            actionElements = <OneTwoOneTwo values={["renamed ", props.vars[0], " to ", props.vars[1]]} />;
            break;
        case 13:
            actionIcon = deletePlaylistIcon;
            actionElements = <OneTwo values={["deleted playlist: ", props.vars[0]]} />;
            break;
        case 14:
            // actionIcon = ;
            actionElements = <OneTwoOneTwo values={["added ", props.vars.length - 1, ` song${props.vars.length > 2 ? "s" : ""} to `, props.vars[0]]} />; activatable = true;
            break;
        case 15:
            // actionIcon = ;
            actionElements = <OneTwoOneTwo values={["deleted ", props.vars.length - 1, ` song${props.vars.length > 2 ? "s" : ""} from `, props.vars[0]]} />; activatable = true;
            break;
        default:
    }

    return (
        <li className="audit-item">
            <div className={`audit-action nqb-bg ${active ? "active" : ""}`.trim()} role={activatable ? "button" : undefined} onClick={activatable ? () => setActive(!active) : undefined}>
                <img className="action-icon" alt={`icon-${props.code}`} src={actionIcon} />
                <div className="action-details">
                    <img className="action-avatar" alt={`${props.User.username}'s avatar`} src={`https://cdn.discordapp.com/avatars/${props.User.id}/${props.User.avatar}.png`} />
                    <div className="action-info">
                        <div className="action-text">
                            {props.User.username}<span className="action-discriminator">#{props.User.discriminator}</span> {actionElements}
                        </div>
                        <div className="action-timestamp">{timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}</div>
                    </div>
                </div>
                {activatable ? <img className="action-collapse" alt="collapsible arrow" src={active ? arrowDown : arrow} /> : undefined}
            </div>
            {active ? <Extended code={props.code} vars={props.vars} /> : undefined}
        </li>
    );
};
