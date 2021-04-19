import M from "materialize-css";

export default function Toast(message, type = 0) {
    let wrapperClass = "";
    switch (type) {
        case 0: wrapperClass = "greyple-bg"; break;
        case 1: wrapperClass = "kenny-bg"; break;
        default:
    }
    return new Promise((resolve, reject) => {
        M.toast({
            html: `
                <div class="toast-wrapper ${wrapperClass}">
                    <h6>${message}</h6>
                </div>
            `,
            displayLength: 5000,
            activationPercent: 0.66,
            completeCallback: resolve
        });
    });
}
