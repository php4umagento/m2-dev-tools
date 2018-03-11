import * as React from 'react';
import {NodeItem} from "../types";
import {NodeHead} from "./NodeHead";
import {NodeEnd} from "./NodeEnd";

export interface NodeProps {
    node: NodeItem,
    depth: number,
    hovered: Set<string>,
    collapsed: Set<string>,
    searchTerm: string,
    selected: Set<string>,
    select(name: string): void,
    addHover(name: string): void,
    toggle(name: string): void,
    removeHover(name: string): void
}

export function Node(props: NodeProps) {
    const {node, depth, addHover, removeHover, hovered, searchTerm} = props;
    const {children} = node;
    const hasNodes = children && (children.length > 0);
    const isCollapsed = props.collapsed.has(node.name);
    const isSelected = props.selected.has(node.name);
    const body = (hasNodes && !isCollapsed) && (
        <div className="nodes">
            {children.map(n => {
                const nextDepth = depth + 1;
                return <Node
                    node={n}
                    depth={nextDepth}
                    key={n.name}
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
    const isHovered = hovered.has(node.name);
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
        isSelected={isSelected}
        select={props.select}
    />;
    const tail = (!isCollapsed) && (
        <NodeEnd
            node={node}
            hasChildren={hasNodes}
            indent={indent}
            addHover={addHover}
            removeHover={removeHover}
            isHovered={isHovered}
            isSelected={isSelected}
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