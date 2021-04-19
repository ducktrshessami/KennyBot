import { useHistory, useLocation } from "react-router-dom";
import Handler from "./Handler";

export default function Status() {
    const location = useLocation();
    const history = useHistory();
    return (
        <Handler location={location} history={history} />
    );
};
