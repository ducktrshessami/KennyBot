import Song from "./Song";

export default function SongList(props) {
    return (
        <ul className="song-list dark-kenny-bg">
            {props.songs.map(song => <Song key={song.id} {...song} />)}
        </ul>
    );
};
