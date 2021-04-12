import { Redirect } from "react-router-dom";
import LoginButton from "../../components/LoginButton";
import "./Home.css";

export default function Home(props) {
    return (
        <main>
            {props.user && props.ready ? <Redirect to="/dashboard" /> : undefined}
            <div className="home-button-wrapper">
                <LoginButton />
            </div>
        </main>
    );
};
