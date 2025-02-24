import { Edge, Node } from "./types.js";
/**
 * Draws a Mermaid graph using the provided graph data
 */
export declare function drawMermaid(nodes: Record<string, Node>, edges: Edge[], config?: {
    firstNode?: string;
    lastNode?: string;
    curveStyle?: string;
    withStyles?: boolean;
    nodeColors?: Record<string, string>;
    wrapLabelNWords?: number;
}): string;
/**
 * Renders Mermaid graph using the Mermaid.INK API.
 */
export declare function drawMermaidPng(mermaidSyntax: string, config?: {
    backgroundColor?: string;
}): Promise<Blob>;
