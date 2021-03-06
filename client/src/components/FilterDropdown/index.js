import { createRef, forwardRef, useState } from "react";
import FilterItem from "./FilterItem";
import isDescendent from "../../utils/isDescendent";
import userIcon from "../../images/user-filter.png";
import actionIcon from "../../images/action-filter.png";
import playIcon from "../../images/red-play-icon.png";
import createPlaylistIcon from "../../images/create-playlist.png";
import editPlaylistIcon from "../../images/edit-playlist.png";
import deletePlaylistIcon from "../../images/delete-playlist.png";
import playerIcon from "../../images/speaker-icon.png";
import queueIcon from "../../images/create-queue.png";
import dequeueIcon from "../../images/delete-queue.png";
import addSongIcon from "../../images/create-song.png";
import deleteSongIcon from "../../images/delete-song.png";
import stockAvatar from "../../images/stock-avatar.png";
import "./FilterDropdown.css";

const actionList = [
    {
        primary: "Update Player",
        value: 0,
        image: playerIcon
    },
    {
        primary: "Play Music",
        value: 1,
        image: playIcon
    },
    {
        primary: "Queue Song",
        value: 2,
        image: queueIcon
    },
    {
        primary: "Dequeue Song",
        value: 3,
        image: dequeueIcon
    },
    {
        primary: "Create Playlist",
        value: 4,
        image: createPlaylistIcon
    },
    {
        primary: "Rename Playlist",
        value: 5,
        image: editPlaylistIcon
    },
    {
        primary: "Delete Playlist",
        value: 6,
        image: deletePlaylistIcon
    },
    {
        primary: "Add Song",
        value: 7,
        image: addSongIcon
    },
    {
        primary: "Delete Song",
        value: 8,
        image: deleteSongIcon
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
            image: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : stockAvatar,
            value: user.id
        })) : actionList)
    ]
        .filter(item => `${item.primary}${item.secondary ? item.secondary : ""}`.toLowerCase().includes(search.trim().toLowerCase()));
    const itemRefs = items.map(() => createRef());

    function selectFilter(event) {
        let i = itemRefs.findIndex(ref => isDescendent(event.target, ref.current));
        if (i !== -1) {
            props.select(items[i].value === null ? {
                name: "All",
                value: null
            } : {
                name: items[i].primary,
                value: items[i].value
            });
        }
    }

    return (
        <div className={`filter-dropdown dbnb-bg ${props.users ? "user-filter" : ""} ${props.className ? props.className : ""}`.trim()} ref={ref}>
            <input className="filter-search dtnqb-bg white-text browser-default" type="text" placeholder={`Search ${props.users ? "Members" : "Actions"}`} onChange={event => setSearch(event.target.value.trim())} />
            <ul>
                {items.map((item, i) => <FilterItem key={item.value} active={item.value === props.activeValue} primary={item.primary} secondary={item.secondary} image={item.image} ref={itemRefs[i]} onClick={selectFilter} />)}
            </ul>
        </div>
    );
});
