import Song from "./Song";
import "./SongList.css";

export default function SongList(props) {
    return (
        <ul className="song-list">
            {props.songs.length ? props.songs.map(song => <Song key={song.id} guildId={props.guildId} {...song} />) : <h6 className="playlist-empty dark-kenny-bg">This playlist is empty</h6>}
        </ul>
    );
};
