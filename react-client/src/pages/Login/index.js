import API from "../../utils/API";

export default function Login() {
    window.location.replace(API.ORIGIN + "/login");
    return (
        <main />
    );
};
