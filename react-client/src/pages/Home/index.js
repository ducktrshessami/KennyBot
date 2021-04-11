import { useHistory } from "react-router-dom";
import LoginButton from "../../components/LoginButton";

export default function Home(props) {
    const history = useHistory();
    if (props.user) {
        history.push("/dashboard")
    }
    return (
        <main>
            <LoginButton />
        </main>
    );
};
