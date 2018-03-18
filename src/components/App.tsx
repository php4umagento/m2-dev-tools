import * as React from 'react';
import {Node} from "./Node";
declare var require;
import {collectIds, flattenNodes, flattenObjectByProp} from "../utils";
import {NodeId, NodeItem, NodeItems, NodeItemShort, NodePath} from "../types";
import {Observable} from "../rx";
import {Subject, Subscription} from "../rx";
import {Msg} from "../messages.types";
import {ActionBar} from "./ActionBar";
import * as dlv from "dlv";
import {keyPresses} from "./keypresses";

export interface AppProps {
    incoming$: Subject<Msg.PanelIncomingMessages>,
    outgoing$: Subject<Msg.PanelOutgoingMessages>,
    hover(name: string): void
    removeHover(name: string): void
}

export class App extends React.Component<AppProps, any> {
    props: AppProps;
    sub: Subscription | null;
    setState: (...args) => void;
    ref: any;
    state: {
        hovered: Set<string>,
        collapsed: Set<string>,
        selected: {
            node: NodeItemShort|null,
            head: boolean,
            tail: boolean,
        },
        root: NodeItem,
        searchTerm: string,
        inspecting: boolean
        selectionOverlay: boolean,
        flatNodes: NodeItems|null
    } = {
        inspecting: false,
        hovered: new Set<NodeId>([]),
        collapsed: new Set<NodeId>([]),
        selected: {node: null, head: false, tail: false},
        root: {
            name: "$$root",
            children: [],
            data: {type: "root", name: "$$root"},
            hasRelatedElement: false,
            path: [],
            id: "$$root"
        },
        searchTerm: "",
        selectionOverlay: false,
        flatNodes: null
    };

    componentDidMount() {
        this.sub = Observable.merge(
            this.props.incoming$
                .filter(x => x.type === Msg.Names.ParsedComments)
                .pluck('payload')
                .do((nodes: NodeItem[]) => {
                    this.setState((prev: App['state']) => {
                        const root = {
                            ...prev.root,
                            children: nodes,
                        };
                        return {
                            hovered: new Set<string>([]),
                            collapsed: new Set<string>([]),
                            selected: {
                                id: null,
                                path: null,
                                head: false,
                            },
                            inspecting: false,
                            flatNodes: flattenNodes(nodes),
                            root,
                        }
                    })
                }),
            this.props.incoming$
                .filter(x => x.type === Msg.Names.KeyUp)
                .groupBy(x => x.payload)
                .mergeMap(obs => {
                    return keyPresses[obs.key as number](obs, {state$: Observable.of(this.state), getState: () => this.state});
                })
                .do(x => {
                    this.setState(x);
                })
        ).subscribe();

    }

    componentWillUnmount() {
        if (this.sub) {
            this.sub.unsubscribe();
            this.sub = null;
        }
    }

    selectByName = (id: NodeId, path: NodePath, pos: {head: boolean, tail: boolean}) => {
        this.setState((prev: App['state']) => {
            const subject = prev.flatNodes[id];
            return {
                selected: {
                    node: subject,
                    ...pos
                }
            }
        });
    }

    render() {
        return (
            <div className="app" ref={(ref) => {this.ref = ref;}}>
              <div className="node-tree">
                    <Node
                        node={this.state.root}
                        depth={1}
                        hovered={this.state.hovered}
                        collapsed={this.state.collapsed}
                        searchTerm={this.state.searchTerm}
                        selected={this.state.selected}
                        select={this.selectByName}
                        addHover={(id: NodeId) => {
                            this.props.hover(id);
                            this.setState(prev => ({
                                hovered: (prev.hovered.add(id), prev.hovered)
                            }))
                        }}
                        removeHover={(id: NodeId) => {
                            this.props.removeHover(id);
                            this.setState(prev => ({
                                hovered: (prev.hovered.delete(id), prev.hovered)
                            }))
                        }}
                        toggle={(id: NodeId) => {
                            this.setState(prev => {
                                if (prev.collapsed.has(id)) {
                                    return {
                                        collapsed: (prev.collapsed.delete(id), prev.collapsed)
                                    }
                                } else {
                                    return {
                                        collapsed: (prev.collapsed.add(id), prev.collapsed)
                                    }
                                }
                            })
                        }}
                    />
                </div>
            </div>
        )
    }
}
