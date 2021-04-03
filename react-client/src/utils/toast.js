import M from "materialize-css";

export default function toast(message, type = 0) {
    return new Promise((resolve, reject) => {
        M.toast({
            html: `
                <p>${message}</p>
            `,
            displayLength: 5000,
            activationPercent: 0.66,
            completeCallback: resolve
        });
    });
}
