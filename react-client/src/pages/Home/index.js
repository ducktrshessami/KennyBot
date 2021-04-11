import { Redirect } from "react-router-dom";
import LoginButton from "../../components/LoginButton";

export default function Home(props) {
    return (
        <main>
            {props.user ? <Redirect to="/dashboard" /> : undefined}
            <LoginButton />
        </main>
    );
};
