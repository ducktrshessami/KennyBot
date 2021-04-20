export default function isDescendent(child, ancestor) {
    return child && ancestor ? child === ancestor ? true : child === document.body ? false : isDescendent(child.parentNode, ancestor) : false;
};
