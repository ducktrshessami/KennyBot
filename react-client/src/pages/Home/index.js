import { useHistory } from "react-router-dom";
import LoginButton from "../../components/LoginButton";
import API from "../../utils/API";

export default function Home() {
    const history = useHistory();
    API.getUser()
        .then(res => {
            if (res) {
                history.push("/dashboard")
            }
        })
        .catch(console.error);
    return (
        <main>
            <LoginButton />
        </main>
    );
};
