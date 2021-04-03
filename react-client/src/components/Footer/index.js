export default function Footer() {
    let year = (new Date()).getFullYear();
    return (
        <footer>
            <span>Copyright ducktrshessami {year}</span>
        </footer>
    );
};
