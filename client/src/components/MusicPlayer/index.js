import { createRef, useEffect, useState } from "react";
import M from "materialize-css";
import SongDisplay from "./SongDisplay";
import "./MusicPlayer.css";

export default function MusicPlayer(props) {
    const volumeRef = createRef();
    const [shuffle, setShuffle] = useState(props.shuffle);
    const [repeat, setRepeat] = useState(props.repeat);
    const [paused, setPaused] = useState(props.paused);
    const enableButtons = props.playing || props.queued;
    let repeatIcon;

    function changeVolume() {
        if (props.socket) {
            props.socket.emit("volumeChange", volumeRef.current.value);
        }
    }

    function toggleShuffle() {
        if (props.socket) {
            props.socket.emit("shuffleChange", !shuffle);
            setShuffle(!shuffle);
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

    function changePaused() {
        if (props.socket) {
            if (props.playing) {
                props.socket.emit("pauseChange", !paused);
                setPaused(!paused);
            }
            else {
                skip();
            }
        }
    }

    function skip() {
        if (props.socket) {
            props.socket.emit("playNext")
        }
    }

    switch (repeat) {
        case 1: repeatIcon = "one"; break;
        case 2: repeatIcon = "all"; break;
        default: repeatIcon = ""; break;
    }
    useEffect(() => {
        let instance = M.Range.init(volumeRef.current);
        volumeRef.current.value = props.volume || 0;
        return () => {
            instance.destroy();
        }
    }, [volumeRef, props.volume]);
    useEffect(() => {
        setShuffle(props.shuffle);
        setRepeat(props.repeat);
        setPaused(props.paused);
    }, [props.shuffle, props.repeat, props.paused]);

    return (
        <section className="music-player nqb-bg">
            <div className="row">
                <div role="button" className="music-player-outer-button col s1" onClick={toggleShuffle}>
                    <i className={`player-shuffle-icon ${shuffle ? "active" : ""}`.trim()} />
                </div>
                <div className="music-player-row col s10">
                    <div className="music-player-button disabled">
                        <i className="player-prev-icon" />
                    </div>
                    <div role={enableButtons ? "button" : undefined} className={`music-player-button ${enableButtons ? "" : "disabled"}`.trim()} onClick={changePaused}>
                        <i className={paused || !props.playing ? "player-play-icon" : "player-pause-icon"} />
                    </div>
                    <div role={enableButtons ? "button" : undefined} className={`music-player-button ${enableButtons ? "" : "disabled"}`.trim()} onClick={skip}>
                        <i className="player-skip-icon" />
                    </div>
                </div>
                <div role="button" className="music-player-outer-button col s1" onClick={changeRepeat}>
                    <i className={`repeat-icon ${repeatIcon}`.trim()} />
                </div>
            </div>
            <div className="volume-control">
                <i className="volume-control-icon muted-icon" />
                <div className="range-field">
                    <input type="range" min="0" max="1.5" step="0.01" onMouseUp={changeVolume} ref={volumeRef} />
                </div>
                <i className="volume-control-icon speaker-icon" />
            </div>
            {props.song ? <SongDisplay title={props.song.title} url={props.song.url} playlist={props.song.Playlist.name} /> : undefined}
        </section>
    );
};
