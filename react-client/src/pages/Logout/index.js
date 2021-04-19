import API from "../../utils/API";

export default function Logout() {
    API.gotoLogout();
    return (
        <main />
    );
};
