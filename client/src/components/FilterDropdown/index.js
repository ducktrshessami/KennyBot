import { createRef, forwardRef, useState } from "react";
import FilterItem from "./FilterItem";
import isDescendent from "../../utils/isDescendent";
import userIcon from "../../images/user-filter.png";
import actionIcon from "../../images/action-filter.png";
import "./FilterDropdown.css";

const actionList = [
    {
        primary: "Updated Player",
        value: 0
    }
];

export default forwardRef(function FilterDropdown(props, ref) {
    const [search, setSearch] = useState("");
    const items = [
        {
            primary: `All ${props.users ? "Users" : "Actions"}`,
            image: props.users ? userIcon : actionIcon,
            value: null
        },
        ...(props.users ? props.users.map(user => ({
            primary: user.username,
            secondary: `#${user.discriminator}`,
            image: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
            value: user.id
        })) : actionList)
    ]
        .filter(item => `${item.primary}${item.secondary ? item.secondary : ""}`.includes(search));
    const itemRefs = items.map(() => createRef());

    function selectFilter(event) {
        let i = itemRefs.findIndex(ref => isDescendent(event.target, ref.current));
        if (i !== -1) {
            props.select(items[i].value === null ? null : {
                name: items[i].primary,
                value: items[i].value
            });
        }
    }

    return (
        <div className={`filter-dropdown dbnb-bg ${props.className ? props.className : ""}`.trim()} ref={ref}>
            <input className="filter-search dtnqb-bg white-text browser-default" type="text" placeholder={`Search ${props.users ? "Members" : "Actions"}`} onChange={event => setSearch(event.target.value.trim())} />
            <ul>
                {items.map((item, i) => <FilterItem key={item.value} active={item.value === props.activeValue} {...item} ref={itemRefs[i]} onClick={selectFilter} />)}
            </ul>
        </div>
    );
});
