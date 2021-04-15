import { useState } from "react";
import SongList from "./SongList";
import "./Playlist.css";

export default function Playlist(props) {
    const [active, setActive] = useState(false);
    return (
        <li>
            <div className={`playlist ${active ? "open" : ""}`.trim()}>
                <div className="playlist-title-wrapper">
                    <div className="playlist-title kenny-bg focus-lighten" role="button" onClick={() => setActive(!active)}>
                        <i className="minimal-text">&nbsp;</i>
                        <i className="playlist-arrow" />
                        {props.name}
                    </div>
                    <div className="kenny-bg focus-lighten" role="button">▶</div>
                    <div className="playlist-title-menu kenny-bg focus-lighten" role="button">
                        <i className="minimal-text">&nbsp;</i>
                        <i className="kebab-menu" />
                    </div>
                </div>
                {active ? <SongList songs={props.Songs} /> : undefined}
            </div>
        </li>
    );
};
