import { useLocation } from "react-router-dom";

export default function StatusClear() {
    const location = useLocation();
    if (location.search) {
        location.search.replace("");
    }
    return null;
};
