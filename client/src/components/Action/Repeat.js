export default function Repeat(props) {
    return (
        <div className="action-text">
            <span className="greyple-text">turned</span> {props.value ? "on" : "off"} <span className="greyple-text">repeat</span>{props.value ? props.value === 1 ? " one" : " all" : undefined}
        </div>
    );
};
