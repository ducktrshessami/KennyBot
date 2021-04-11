import { useHistory } from "react-router-dom";

export default function Dashboard(props) {
    const history = useHistory();
    if (!props.user) {
        history.push("/");
    }
    return (
        <main></main>
    );
};
