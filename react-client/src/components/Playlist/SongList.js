import Song from "./Song";
import "./SongList.css";

export default function SongList(props) {
    return (
        <ul className="song-list dark-kenny-bg">
            {props.songs.length ? props.songs.map(song => <Song key={song.id} {...song} />) : <h6 className="playlist-empty">This playlist is empty</h6>}
        </ul>
    );
};
