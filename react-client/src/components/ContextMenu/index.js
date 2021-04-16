import { Component, useState } from "react";
import Option from "./Option";
import "./ContextMenu.css";

function findContextParent(element, root) {
    return element.classList.contains("context-menu") ? element : element === root ? null : findContextParent(element.parentNode, root);
}

export default function ContextMenu(props) {
    function outClickListener(event) {
        event.stopPropagation();
        if (!findContextParent(event.target, this)) {
            this.removeEventListener("click", outClickListener);
            props.close();
        }
    }

    document.getElementById("root").addEventListener("click", outClickListener);
    return (
        <ul className={`context-menu card ${props.className || ""}`.trim()}>
            {props.options.map(option => <Option key={option.name} className={props.optionClassName} {...option} />)}
        </ul>
    );
};
