import API from "../../utils/API";

export default function Logout() {
    window.location.replace(API.ORIGIN + "/logout");
    return (
        <main />
    );
};
