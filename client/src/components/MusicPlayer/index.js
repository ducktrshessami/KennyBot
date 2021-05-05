import { createRef, useEffect } from "react";
import M from "materialize-css";
import "./MusicPlayer.css";

export default function MusicPlayer(props) {
    const volumeRef = createRef();

    function changeVolume() {
        if (props.socket) {
            props.socket.emit("volumeChange", volumeRef.current.value);
        }
    }

    useEffect(() => {
        let instance = M.Range.init(volumeRef.current);
        volumeRef.current.value = props.volume || 0;
        return () => {
            instance.destroy();
        }
    });

    return (
        <section className="music-player nqb-bg">
            <div className="row">
                <div role="button" className="music-player-outer-button col s1">
                    <i className="player-shuffle-icon" />
                </div>
                <div className="music-player-row col s10">
                    <div role={props.playing ? "button" : undefined} className="music-player-button disabled">
                        <i className="player-prev-icon" />
                    </div>
                    <div role={props.playing ? "button" : undefined} className={`music-player-button ${props.playing ? "" : "disabled"}`.trim()}>
                        <i className={"player-play-icon"} />
                    </div>
                    <div role={props.playing ? "button" : undefined} className={`music-player-button ${props.playing ? "" : "disabled"}`.trim()}>
                        <i className="player-skip-icon" />
                    </div>
                </div>
                <div role="button" className="music-player-outer-button col s1">
                    <i className="" />
                </div>
            </div>
            <div className="range-field">
                <input type="range" min="0" max="1.5" step="0.01" onMouseUp={changeVolume} ref={volumeRef} />
            </div>
        </section>
    );
};
