export default function Extended(props) {
    var list = [];
    switch (props.code) {
        case 9:
        case 10: list = props.vars; break;
        case 14:
        case 15: list = props.vars.slice(1); break;
        default:
    }
    return (
        <ul className="audit-action-extended nqb-bg">
            {list.map((item, i) => <li key={i} className="extended-item"><span className={`dash ${props.adding ? "adding" : "removing"}`}>—</span> {item}</li>)}
        </ul>
    );
};
