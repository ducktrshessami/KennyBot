import {
    Link,
    Route,
    Switch
} from "react-router-dom";
import "./Footer.css";

export default function Footer(props) {
    return (
        <footer className="nqb-bg">
            <div className="center row">
                <div className="col s12 m8 l6 offset-m2 offset-l3 row">
                    <span className="col s6">
                        <Switch>
                            <Route path="/disclaimer">
                                <Link className="greyple-text" to={props.user ? "/dashboard" : "/"}>{props.user ? "Dashboard" : "Home"}</Link>
                            </Route>
                            <Route path="/">
                                <Link className="greyple-text" to="/disclaimer">Disclaimer</Link>
                            </Route>
                        </Switch>
                    </span>
                    <span className="col s6">
                        <a className="greyple-text" href="https://github.com/ducktrshessami/kennybot">GitHub</a>
                    </span>
                </div>
            </div>
        </footer>
    );
};
