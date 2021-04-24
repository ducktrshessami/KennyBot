import Listener from "./Listener";
import "./VoiceChannel.css";

export default function VoiceChannel(props) {
    return (
        <section className="voice-channel nqb-bg">
            <h5 className="voice-channel-name">
                Connected to
                <i className="speaker-icon" />
                {props.channel}
            </h5>
            <ul className="browser-default user-list">
                {props.users.map(user => <Listener key={user} name={user} />)}
            </ul>
        </section>
    );
};
