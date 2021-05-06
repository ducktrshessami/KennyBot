import "./SongDisplay.css";

export default function SongDisplay(props) {
    return (
        <div className="center">
            <a href={props.url} target="_blank" rel="noreferrer" className="greyple-text">
                <h6>
                    {props.title}
                    <i className="display-external-icon" />
                </h6>
            </a>
            <div className="display-playlist">Playlist: <b>{props.playlist}</b></div>
        </div>
    );
};
