import { forwardRef } from "react";

export default forwardRef(function FilterItem(props, ref) {
    return (
        <li className={`filter-item ${props.active ? "blurple-bg focus-darken" : "dbnb-bg focus-lighten"}`.trim()} role="button" ref={ref} onClick={props.onClick}>
            <img className="filter-image" alt={`${props.primary} icon`} src={props.image} />
            <div className="filter-text">
                {props.primary}
                {props.secondary ? <span className="greyple-text">{props.secondary}</span> : undefined}
            </div>
        </li>
    );
});
