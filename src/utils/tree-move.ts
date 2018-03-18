import {App} from "../components/App";
import {NodeItems} from "../types";

type Selected = App['state']['selected'];

export function down(selection: Selected, data: NodeItems, collapsed: App['state']['collapsed']): Selected {
    const {node, head, tail} = selection;
    if (!node) {
        return {
            node: data['$$root'],
            head: true,
            tail: false
        }
    }
    const current = data[node.id];
    const parent = data[current.parent];
    const nextSibling = getNextSibling(node.id, data);
    const isCollapsed = collapsed.has(node.id);
    const hasChildren = current.children && current.children.length > 0;
    const isRoot = node.id === '$$root';

    if (tail && !nextSibling) {
        return {
            node: current,
            head, tail
        }
    }

    if (head && hasChildren && !isCollapsed) {
        const firstChildId = isRoot
            ? '0'
            : node.path.concat('children', 0).join('.');

        return {
            node: data[firstChildId],
            head: true,
            tail: false
        }
    }

    if (nextSibling) {
        return {
            node: nextSibling,
            head: true,
            tail: false
        }
    } else {
        return {
            node: parent,
            head: false,
            tail: true,
        }
    }
}

export function up(selection: Selected, data: NodeItems, collapsed: App['state']['collapsed']): Selected {
    const {node, head, tail} = selection;
    if (!node || (node.id ==='$$root' && head)) {
        return {
            node: data['$$root'],
            head: true,
            tail: false
        }
    }
    const current = data[node.id];
    const hasChildren = (current.children||[]).length > 0;
    const parent = data[current.parent];
    const prevSibling = getPrevSibling(node.id, data);
    const isCollapsed = collapsed.has(node.id);
    if (tail) {
        const lastChild = current.children[current.children.length-1];
        return {
            node: data[lastChild],
            head: true,
            tail: false,
        }
    }
    if (!prevSibling) {
        if (tail && hasChildren) {
            const lastChild = current.children[current.children.length-1];
            const lastChildHasChildren = (lastChild.children||[]).length > 0;
            if (!lastChildHasChildren) {
                return {
                    node: data[lastChild],
                    head: true,
                    tail: false
                };
            }
        }
        return {
            node: parent,
            head: true,
            tail: false,
        }
    }
    const prevSiblingIsCollapsed = collapsed.has(prevSibling.id);
    const prevSiblingHasChildren = (prevSibling.children||[]).length > 0;
    if (prevSibling) {
        if (!prevSiblingIsCollapsed) {
            if (prevSiblingHasChildren) {
                return {
                    node: prevSibling,
                    head: false,
                    tail: true,
                }
            }
            return {
                node: prevSibling,
                head: true,
                tail: false,
            }
        }
        return {
            node: prevSibling,
            head: true,
            tail: false,
        }
    }
}

export function getPrevSibling(id: string, data: NodeItems) {
    const current = data[id];
    const parent = data[current.parent];
    if (!parent) {
        return null;
    }
    const hasPrevSibling = (parent.children || []).length > current.index - 1;
    if (hasPrevSibling) {
        return data[parent.children[current.index - 1]];
    }
    return null;
}

export function getNextSibling(id, data) {
    const current = data[id];
    const parent = data[current.parent];
    if (!parent) {
        return null;
    }
    const hasNextSibling = (parent.children || []).length > current.index + 1;
    if (hasNextSibling) {
        return data[parent.children[current.index + 1]];
    }
    return null;
}