"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = void 0;
const zod_to_json_schema_1 = require("zod-to-json-schema");
const uuid_1 = require("uuid");
const utils_js_1 = require("./utils.cjs");
const graph_mermaid_js_1 = require("./graph_mermaid.cjs");
function nodeDataStr(id, data) {
    if (id !== undefined && !(0, uuid_1.validate)(id)) {
        return id;
    }
    else if ((0, utils_js_1.isRunnableInterface)(data)) {
        try {
            let dataStr = data.getName();
            dataStr = dataStr.startsWith("Runnable")
                ? dataStr.slice("Runnable".length)
                : dataStr;
            return dataStr;
        }
        catch (error) {
            return data.getName();
        }
    }
    else {
        return data.name ?? "UnknownSchema";
    }
}
function nodeDataJson(node) {
    // if node.data implements Runnable
    if ((0, utils_js_1.isRunnableInterface)(node.data)) {
        return {
            type: "runnable",
            data: {
                id: node.data.lc_id,
                name: node.data.getName(),
            },
        };
    }
    else {
        return {
            type: "schema",
            data: { ...(0, zod_to_json_schema_1.zodToJsonSchema)(node.data.schema), title: node.data.name },
        };
    }
}
class Graph {
    constructor(params) {
        Object.defineProperty(this, "nodes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "edges", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.nodes = params?.nodes ?? this.nodes;
        this.edges = params?.edges ?? this.edges;
    }
    // Convert the graph to a JSON-serializable format.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toJSON() {
        const stableNodeIds = {};
        Object.values(this.nodes).forEach((node, i) => {
            stableNodeIds[node.id] = (0, uuid_1.validate)(node.id) ? i : node.id;
        });
        return {
            nodes: Object.values(this.nodes).map((node) => ({
                id: stableNodeIds[node.id],
                ...nodeDataJson(node),
            })),
            edges: this.edges.map((edge) => {
                const item = {
                    source: stableNodeIds[edge.source],
                    target: stableNodeIds[edge.target],
                };
                if (typeof edge.data !== "undefined") {
                    item.data = edge.data;
                }
                if (typeof edge.conditional !== "undefined") {
                    item.conditional = edge.conditional;
                }
                return item;
            }),
        };
    }
    addNode(data, id, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata) {
        if (id !== undefined && this.nodes[id] !== undefined) {
            throw new Error(`Node with id ${id} already exists`);
        }
        const nodeId = id ?? (0, uuid_1.v4)();
        const node = {
            id: nodeId,
            data,
            name: nodeDataStr(id, data),
            metadata,
        };
        this.nodes[nodeId] = node;
        return node;
    }
    removeNode(node) {
        // Remove the node from the nodes map
        delete this.nodes[node.id];
        // Filter out edges connected to the node
        this.edges = this.edges.filter((edge) => edge.source !== node.id && edge.target !== node.id);
    }
    addEdge(source, target, data, conditional) {
        if (this.nodes[source.id] === undefined) {
            throw new Error(`Source node ${source.id} not in graph`);
        }
        if (this.nodes[target.id] === undefined) {
            throw new Error(`Target node ${target.id} not in graph`);
        }
        const edge = {
            source: source.id,
            target: target.id,
            data,
            conditional,
        };
        this.edges.push(edge);
        return edge;
    }
    firstNode() {
        return _firstNode(this);
    }
    lastNode() {
        return _lastNode(this);
    }
    /**
     * Add all nodes and edges from another graph.
     * Note this doesn't check for duplicates, nor does it connect the graphs.
     */
    extend(graph, prefix = "") {
        let finalPrefix = prefix;
        const nodeIds = Object.values(graph.nodes).map((node) => node.id);
        if (nodeIds.every(uuid_1.validate)) {
            finalPrefix = "";
        }
        const prefixed = (id) => {
            return finalPrefix ? `${finalPrefix}:${id}` : id;
        };
        Object.entries(graph.nodes).forEach(([key, value]) => {
            this.nodes[prefixed(key)] = { ...value, id: prefixed(key) };
        });
        const newEdges = graph.edges.map((edge) => {
            return {
                ...edge,
                source: prefixed(edge.source),
                target: prefixed(edge.target),
            };
        });
        // Add all edges from the other graph
        this.edges = [...this.edges, ...newEdges];
        const first = graph.firstNode();
        const last = graph.lastNode();
        return [
            first ? { id: prefixed(first.id), data: first.data } : undefined,
            last ? { id: prefixed(last.id), data: last.data } : undefined,
        ];
    }
    trimFirstNode() {
        const firstNode = this.firstNode();
        if (firstNode && _firstNode(this, [firstNode.id])) {
            this.removeNode(firstNode);
        }
    }
    trimLastNode() {
        const lastNode = this.lastNode();
        if (lastNode && _lastNode(this, [lastNode.id])) {
            this.removeNode(lastNode);
        }
    }
    /**
     * Return a new graph with all nodes re-identified,
     * using their unique, readable names where possible.
     */
    reid() {
        const nodeLabels = Object.fromEntries(Object.values(this.nodes).map((node) => [node.id, node.name]));
        const nodeLabelCounts = new Map();
        Object.values(nodeLabels).forEach((label) => {
            nodeLabelCounts.set(label, (nodeLabelCounts.get(label) || 0) + 1);
        });
        const getNodeId = (nodeId) => {
            const label = nodeLabels[nodeId];
            if ((0, uuid_1.validate)(nodeId) && nodeLabelCounts.get(label) === 1) {
                return label;
            }
            else {
                return nodeId;
            }
        };
        return new Graph({
            nodes: Object.fromEntries(Object.entries(this.nodes).map(([id, node]) => [
                getNodeId(id),
                { ...node, id: getNodeId(id) },
            ])),
            edges: this.edges.map((edge) => ({
                ...edge,
                source: getNodeId(edge.source),
                target: getNodeId(edge.target),
            })),
        });
    }
    drawMermaid(params) {
        const { withStyles, curveStyle, nodeColors = {
            default: "fill:#f2f0ff,line-height:1.2",
            first: "fill-opacity:0",
            last: "fill:#bfb6fc",
        }, wrapLabelNWords, } = params ?? {};
        const graph = this.reid();
        const firstNode = graph.firstNode();
        const lastNode = graph.lastNode();
        return (0, graph_mermaid_js_1.drawMermaid)(graph.nodes, graph.edges, {
            firstNode: firstNode?.id,
            lastNode: lastNode?.id,
            withStyles,
            curveStyle,
            nodeColors,
            wrapLabelNWords,
        });
    }
    async drawMermaidPng(params) {
        const mermaidSyntax = this.drawMermaid(params);
        return (0, graph_mermaid_js_1.drawMermaidPng)(mermaidSyntax, {
            backgroundColor: params?.backgroundColor,
        });
    }
}
exports.Graph = Graph;
/**
 * Find the single node that is not a target of any edge.
 * Exclude nodes/sources with ids in the exclude list.
 * If there is no such node, or there are multiple, return undefined.
 * When drawing the graph, this node would be the origin.
 */
function _firstNode(graph, exclude = []) {
    const targets = new Set(graph.edges
        .filter((edge) => !exclude.includes(edge.source))
        .map((edge) => edge.target));
    const found = [];
    for (const node of Object.values(graph.nodes)) {
        if (!exclude.includes(node.id) && !targets.has(node.id)) {
            found.push(node);
        }
    }
    return found.length === 1 ? found[0] : undefined;
}
/**
 * Find the single node that is not a source of any edge.
 * Exclude nodes/targets with ids in the exclude list.
 * If there is no such node, or there are multiple, return undefined.
 * When drawing the graph, this node would be the destination.
 */
function _lastNode(graph, exclude = []) {
    const sources = new Set(graph.edges
        .filter((edge) => !exclude.includes(edge.target))
        .map((edge) => edge.source));
    const found = [];
    for (const node of Object.values(graph.nodes)) {
        if (!exclude.includes(node.id) && !sources.has(node.id)) {
            found.push(node);
        }
    }
    return found.length === 1 ? found[0] : undefined;
}
