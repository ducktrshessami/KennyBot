import "./FilterDropdown.css";

export default function FilterDropdown(props) {
    return (
        <div className={`filter-dropdown ${props.className ? props.className : ""}`.trim()}></div>
    );
};
