import * as React from 'react';
import {NodeId, NodeItem, NodePath} from "../types";
import {NodeHead} from "./NodeHead";
import {NodeEnd} from "./NodeEnd";
import {App} from "./App";
import * as dlv from 'dlv';

export interface NodeProps {
    key?: string|number,
    node: NodeItem,
    depth: number,
    hovered: Set<string>,
    collapsed: Set<string>,
    searchTerm: string,
    selected: App['state']['selected'],
    select(id: NodeId, path: NodePath, head: boolean): void,
    addHover(id: NodeId): void,
    toggle(id: NodeId): void,
    removeHover(id: NodeId): void
}

export function Node(props: NodeProps) {
    const {node, depth, addHover, removeHover, hovered, searchTerm} = props;
    const {children} = node;
    const hasNodes = children && (children.length > 0);
    const isCollapsed = props.collapsed.has(node.id);
    const headIsSelected = props.selected.head && dlv(props, 'selected.node.id') === node.id;
    const body = (hasNodes && !isCollapsed) && (
        <div className="nodes">
            {children.map(n => {
                const nextDepth = depth + 1;
                return <Node
                    node={n}
                    depth={nextDepth}
                    key={n.id}
                    hovered={hovered}
                    addHover={addHover}
                    removeHover={removeHover}
                    toggle={props.toggle}
                    collapsed={props.collapsed}
                    searchTerm={searchTerm}
                    selected={props.selected}
                    select={props.select}
                />
            })}
        </div>
    );
    const indent = depth * 15;
    const isHovered = hovered.has(node.id);
    const head = <NodeHead
        node={node}
        hasChildren={hasNodes}
        indent={indent}
        addHover={addHover}
        removeHover={removeHover}
        isHovered={isHovered}
        isCollapsed={isCollapsed}
        toggle={props.toggle}
        searchTerm={searchTerm}
        isSelected={headIsSelected}
        select={props.select}
    />;
    const tailIsSelected = props.selected.tail && dlv(props, 'selected.node.id') === node.id;
    const tail = (!isCollapsed) && (
        <NodeEnd
            node={node}
            hasChildren={hasNodes}
            indent={indent}
            addHover={addHover}
            removeHover={removeHover}
            isHovered={isHovered}
            isSelected={tailIsSelected}
            select={props.select}
        />
    );
    return (
        <div className="node">
            {head}
            {body}
            {tail}
        </div>
    );
}