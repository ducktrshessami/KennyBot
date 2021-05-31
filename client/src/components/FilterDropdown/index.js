import { forwardRef, useState } from "react";
import "./FilterDropdown.css";

export default forwardRef(function FilterDropdown(props, ref) {
    const [search, setSearch] = useState("");
    return (
        <div className={`filter-dropdown dbnb-bg ${props.className ? props.className : ""}`.trim()} ref={ref}></div>
    );
});
