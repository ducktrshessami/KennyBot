export default function Option(props) {
    return (
        <li role="button" className={`context-menu-option ${props.className || ""}`.trim()} onClick={props.callback}>
            <div>{props.name}</div>
        </li>
    );
};
