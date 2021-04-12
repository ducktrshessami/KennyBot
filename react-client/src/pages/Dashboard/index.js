import { Redirect } from "react-router-dom";

export default function Dashboard(props) {
    return (
        <main>
            {!props.user ? <Redirect to="/" /> : undefined}
        </main>
    );
};
