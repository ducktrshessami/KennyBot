import { Link } from "react-router-dom";

export default function ServerCard(props) {
    return (
        <Link className="card" to={`/server/${props.id}`}>{props.name}</Link>
    );
};
