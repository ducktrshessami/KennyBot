export default function OneTwoOneTwo(props) {
    return (
        <div className="action-text">
            <span className="greyple-text">{props.values[0]}</span>
            {props.values[1]}
            <span className="greyple-text">{props.values[2]}</span>
            {props.values[3]}
        </div>
    );
};
