import { createRef, useEffect, useState } from "react";
import M from "materialize-css";
import "./MusicPlayer.css";

export default function MusicPlayer(props) {
    const volumeRef = createRef();
    const [shuffle, setShuffle] = useState(props.shuffle);
    const [repeat, setRepeat] = useState(props.repeat);
    let repeatIcon;

    function changeVolume() {
        if (props.socket) {
            props.socket.emit("volumeChange", volumeRef.current.value);
        }
    }

    function toggleShuffle() {
        if (props.socket) {
            let newShuffle = !shuffle;
            props.socket.emit("shuffleChange", newShuffle);
            setShuffle(newShuffle);
        }
    }

    function changeRepeat() {
        if (props.socket) {
            let newRepeat = repeat - 1;
            if (newRepeat < 0) {
                newRepeat = 2;
            }
            props.socket.emit("repeatChange", newRepeat);
            setRepeat(newRepeat);
        }
    }

    switch (repeat) {
        case 1: repeatIcon = "one"; break;
        case 2: repeatIcon = "all"; break;
        default: repeatIcon = ""; break;
    }
    useEffect(() => {
        let instance = M.Range.init(volumeRef.current);
        console.log(props);
        volumeRef.current.value = props.volume || 0;
        return () => {
            instance.destroy();
        }
    });
    useEffect(() => {
        setShuffle(props.shuffle);
        setRepeat(props.repeat);
    }, [props]);

    return (
        <section className="music-player nqb-bg">
            <div className="row">
                <div role="button" className="music-player-outer-button col s1" onClick={toggleShuffle}>
                    <i className={`player-shuffle-icon ${shuffle ? "active" : ""}`.trim()} />
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
                <div role="button" className="music-player-outer-button col s1" onClick={changeRepeat}>
                    <i className={`repeat-icon ${repeatIcon}`.trim()} />
                </div>
            </div>
            <div className="range-field">
                <input type="range" min="0" max="1.5" step="0.01" onMouseUp={changeVolume} ref={volumeRef} />
            </div>
        </section>
    );
};
