import { Link } from "react-router-dom";

export default function Server(props) {
    return (
        <main>
            <section>
                <Link to="/dashboard" className="greyple-bg focus-darken white-text btn">❮ Back</Link>
            </section>
        </main>
    );
};
