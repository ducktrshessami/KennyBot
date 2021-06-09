import { Redirect } from "react-router-dom";
import LoginButton from "../../components/LoginButton";
import Loading from "../../components/Loading";
import "./Home.css";

export default function Home(props) {
    return (
        <main>
            {props.user && props.ready ? <Redirect to="/dashboard" /> : undefined}
            <div className="home-button-wrapper">
                <LoginButton />
                {!props.ready ? <Loading className="home-loader" size="small" /> : undefined}
            </div>
        </main>
    );
};
