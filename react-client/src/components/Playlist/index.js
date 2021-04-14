import { useState } from "react";
import SongList from "./SongList";
import "./Playlist.css";

export default function Playlist(props) {
    const [active, setActive] = useState(false);
    return (
        <li>
            <div className="playlist card dark-kenny-bg">
                <h5 role="button" className={`playlist-title ${active ? "open " : ""}card-title kenny-bg focus-lighten`} onClick={() => setActive(!active)}>
                    <span className="playlist-arrow">❯</span>
                    {props.name}
                </h5>
                {active ? <SongList songs={props.Songs} /> : undefined}
            </div>
        </li>
    );
};
