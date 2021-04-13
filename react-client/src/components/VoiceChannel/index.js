import Member from "./Listener";
import "./VoiceChannel.css";

export default function VoiceChannel(props) {
    return (
        <article className="voice-channel nqb-bg">
            <h5 className="voice-channel-name">
                Connected to
                <i className="speaker-icon" />
                <b>{props.channel}</b>
            </h5>
            <ul className="browser-default user-list">
                {props.users.map(user => <Member name={user} />)}
            </ul>
        </article>
    );
};
