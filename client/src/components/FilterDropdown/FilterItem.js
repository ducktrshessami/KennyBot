import { forwardRef } from "react";

export default forwardRef(function FilterItem(props, ref) {
    console.log(props);
    return (
        <li className="filter-item" ref={ref}>
            <img className="filter-image" alt={`${props.primary} icon`} src={props.image} />
            <div>{props.primary}<span className="greyple-text">{props.secondary}</span></div>
        </li>
    );
});
