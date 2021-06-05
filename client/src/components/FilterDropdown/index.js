import { forwardRef, useState } from "react";
import FilterItem from "./FilterItem";
import userIcon from "../../images/user-filter.png";
import actionIcon from "../../images/action-filter.png";
import "./FilterDropdown.css";

const actionList = [

];

export default forwardRef(function FilterDropdown(props, ref) {
    const [search, setSearch] = useState("");
    const items = [
        {
            primary: `All ${props.users ? "Users" : "Actions"}`,
            secondary: "",
            image: props.users ? userIcon : actionIcon
        },
        ...(props.users ? props.users.map(user => ({
            primary: user.username,
            secondary: `#${user.discriminator}`,
            image: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        })) : actionList)
    ]
        .filter(item => `${item.primary}${item.secondary}`.includes(search));
    return (
        <div className={`filter-dropdown dbnb-bg ${props.className ? props.className : ""}`.trim()} ref={ref}>
            <input className="filter-search dtnqb-bg white-text browser-default" type="text" placeholder={`Search ${props.users ? "Members" : "Actions"}`} onChange={event => setSearch(event.target.value.trim())} />
            <ul>
                {items.map((item, i) => <FilterItem key={i} {...item} />)}
            </ul>
        </div>
    );
});
