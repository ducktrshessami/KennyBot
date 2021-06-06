import { forwardRef } from "react";

export default forwardRef(function FilterItem(props, ref) {
    console.log(props);
    return (
        <li className={`filter-item ${props.active ? "active" : ""}`.trim()} role="button" ref={ref} onClick={props.onClick}>
            <img className="filter-image" alt={`${props.primary} icon`} src={props.image} />
            <div className="filter-text">{props.primary}<span className="greyple-text">{props.secondary}</span></div>
        </li>
    );
});
