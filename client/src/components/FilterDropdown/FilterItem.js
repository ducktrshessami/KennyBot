import { forwardRef } from "react";

export default forwardRef(function FilterItem(props, ref) {
    console.log(props);
    return (
        <li ref={ref}></li>
    );
});
