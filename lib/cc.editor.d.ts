declare module "cc/editor/2d-misc" {
    export function earcut(datas: number[], holeIndices: number[] | null, dim: number): number[];
    export {};
}
declare module "cc/editor/animation-clip-migration" {
    export import AnimationClipLegacyData = AnimationClip._legacy.AnimationClipLegacyData;
    import { AnimationClip } from "cc";
    export {};
}
declare module "cc/editor/color-utils" {
    export function linearToSrgb8Bit(x: number): number;
    export function srgbToLinear(x: number): number;
    export {};
}
declare module "cc/editor/custom-pipeline" {
    export function reindexEdgeList(el: (OutE | OutEP)[], u: number): void;
    export function removeAllEdgesFromList(edges: Set<Edge>, el: OutEP[], v: vertex_descriptor): void;
    export function getPath(g: ReferenceGraph & NamedGraph, v: vertex_descriptor | null): string;
    export function findRelative(g: ParentGraph, v: vertex_descriptor | null, path: string): vertex_descriptor | null;
    export function depthFirstSearch(g: IncidenceGraph & VertexListGraph, visitor: GraphVisitor, color: MutableVertexPropertyMap<GraphColor>, startVertex?: vertex_descriptor | null): void;
    export function depthFirstVisit(g: IncidenceGraph, u: vertex_descriptor, visitor: GraphVisitor, color: MutableVertexPropertyMap<GraphColor>, func?: TerminatorFunc): void;
    /****************************************************************************
     Copyright (c) 2021-2023 Xiamen Yaji Software Co., Ltd.
    
     http://www.cocos.com
    
     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights to
     use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
     of the Software, and to permit persons to whom the Software is furnished to do so,
     subject to the following conditions:
    
     The above copyright notice and this permission notice shall be included in
     all copies or substantial portions of the Software.
    
     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     THE SOFTWARE.
     ****************************************************************************/
    export const enum directional {
        undirected = 0,
        directed = 1,
        bidirectional = 2
    }
    export const enum parallel {
        disallow = 0,
        allow = 1
    }
    export const enum traversal {
        none = 0,
        incidence = 1,
        bidirectional = 2,
        adjacency = 4,
        vertex_list = 8,
        edge_list = 16
    }
    export interface Vertex {
        nullVertex(): Vertex | null;
    }
    export type vertex_descriptor = number | Vertex;
    export interface Edge {
        getProperty(): unknown;
        source: vertex_descriptor;
        target: vertex_descriptor;
    }
    export class ED {
        constructor(source: vertex_descriptor, target: vertex_descriptor);
        equals(rhs: ED): boolean;
        source: vertex_descriptor;
        target: vertex_descriptor;
    }
    export class EPD {
        constructor(source: vertex_descriptor, target: vertex_descriptor, edge: Edge);
        equals(rhs: EPD): boolean;
        source: vertex_descriptor;
        target: vertex_descriptor;
        readonly edge: Edge;
    }
    export type edge_descriptor = ED | EPD;
    export class OutE {
        constructor(target: vertex_descriptor);
        equals(rhs: OutE): boolean;
        target: vertex_descriptor;
    }
    export class OutEP {
        constructor(target: vertex_descriptor, edge: Edge);
        equals(rhs: OutEP): boolean;
        getProperty(): unknown;
        target: vertex_descriptor;
        readonly edge: Edge;
    }
    export class OutEI implements IterableIterator<ED> {
        constructor(iterator: IterableIterator<OutE>, source: vertex_descriptor);
        [Symbol.iterator](): OutEI;
        next(): IteratorResult<ED>;
        readonly iterator: IterableIterator<OutE>;
        readonly source: vertex_descriptor;
    }
    export class OutEPI implements IterableIterator<EPD> {
        constructor(iterator: IterableIterator<OutEP>, source: vertex_descriptor);
        [Symbol.iterator](): OutEPI;
        next(): IteratorResult<EPD>;
        readonly iterator: IterableIterator<OutEP>;
        readonly source: vertex_descriptor;
    }
    export type out_edge_iterator = OutEI | OutEPI;
    export class InEI implements IterableIterator<ED> {
        constructor(iterator: IterableIterator<OutE>, source: vertex_descriptor);
        [Symbol.iterator](): InEI;
        next(): IteratorResult<ED>;
        readonly iterator: IterableIterator<OutE>;
        readonly source: vertex_descriptor;
    }
    export class InEPI implements IterableIterator<EPD> {
        constructor(iterator: IterableIterator<OutEP>, source: vertex_descriptor);
        [Symbol.iterator](): InEPI;
        next(): IteratorResult<EPD>;
        readonly iterator: IterableIterator<OutEP>;
        readonly source: vertex_descriptor;
    }
    export type in_edge_iterator = InEI | InEPI;
    export interface Graph {
        readonly directed_category: directional;
        readonly edge_parallel_category: parallel;
        readonly traversal_category: traversal;
        nullVertex(): vertex_descriptor | null;
    }
    export interface IncidenceGraph extends Graph {
        edge(u: vertex_descriptor, v: vertex_descriptor): boolean;
        source(e: edge_descriptor): vertex_descriptor;
        target(e: edge_descriptor): vertex_descriptor;
        outEdges(v: vertex_descriptor): out_edge_iterator;
        outDegree(v: vertex_descriptor): number;
    }
    export interface BidirectionalGraph extends IncidenceGraph {
        inEdges(v: vertex_descriptor): in_edge_iterator;
        inDegree(v: vertex_descriptor): number;
        degree(v: vertex_descriptor): number;
    }
    export class AdjI implements IterableIterator<vertex_descriptor> {
        constructor(graph: IncidenceGraph, iterator: OutEI);
        [Symbol.iterator](): AdjI;
        next(): IteratorResult<vertex_descriptor>;
        readonly graph: IncidenceGraph;
        readonly iterator: OutEI;
    }
    export class AdjPI implements IterableIterator<vertex_descriptor> {
        constructor(graph: IncidenceGraph, iterator: OutEPI);
        [Symbol.iterator](): AdjPI;
        next(): IteratorResult<vertex_descriptor>;
        readonly graph: IncidenceGraph;
        readonly iterator: OutEPI;
    }
    export type adjacency_iterator = AdjI | AdjPI;
    export interface AdjacencyGraph extends Graph {
        adjacentVertices(v: vertex_descriptor): adjacency_iterator;
    }
    export interface VertexListGraph extends Graph {
        vertices(): IterableIterator<vertex_descriptor>;
        numVertices(): number;
    }
    export interface EdgeListGraph extends Graph {
        edges(): IterableIterator<edge_descriptor>;
        numEdges(): number;
        source(e: edge_descriptor): vertex_descriptor;
        target(e: edge_descriptor): vertex_descriptor;
    }
    export interface MutableGraph extends Graph {
        addVertex(...args: any[]): vertex_descriptor;
        clearVertex(v: vertex_descriptor): void;
        removeVertex(v: vertex_descriptor): void;
        addEdge(u: vertex_descriptor, v: vertex_descriptor, p?: unknown): edge_descriptor | null;
        removeEdges(u: vertex_descriptor, v: vertex_descriptor): void;
        removeEdge(e: edge_descriptor): void;
    }
    export interface PropertyMap {
        get(x: vertex_descriptor | edge_descriptor): unknown;
    }
    export interface MutableVertexPropertyMap<T> extends PropertyMap {
        put(x: vertex_descriptor, value: T): void;
    }
    export interface PropertyGraph extends Graph {
        get(tag: string): PropertyMap;
    }
    export interface NamedGraph extends Graph {
        vertexName(v: vertex_descriptor): string;
        vertexNameMap(): PropertyMap;
    }
    export interface ComponentGraph extends Graph {
        readonly components: string[];
        component(id: number, v: vertex_descriptor): unknown;
        componentMap(id: number): unknown;
    }
    export interface PolymorphicGraph extends Graph {
        holds(id: number, v: vertex_descriptor): boolean;
        id(v: vertex_descriptor): number;
        object(v: vertex_descriptor): unknown;
        value(id: number, v: vertex_descriptor): unknown;
        tryValue(id: number, v: vertex_descriptor): unknown;
        visitVertex(visitor: unknown, v: vertex_descriptor): void;
    }
    export type reference_descriptor = ED | EPD;
    export type child_iterator = OutEI | OutEPI;
    export type parent_iterator = InEI | InEPI;
    export interface ReferenceGraph extends Graph {
        reference(u: vertex_descriptor, v: vertex_descriptor): boolean;
        parent(e: reference_descriptor): vertex_descriptor;
        child(e: reference_descriptor): vertex_descriptor;
        parents(v: vertex_descriptor): parent_iterator;
        children(v: vertex_descriptor): child_iterator;
        numParents(v: vertex_descriptor): number;
        numChildren(v: vertex_descriptor): number;
        getParent(v: vertex_descriptor): vertex_descriptor | null;
        isAncestor(ancestor: vertex_descriptor, descendent: vertex_descriptor): boolean;
    }
    export interface MutableReferenceGraph extends ReferenceGraph {
        addReference(u: vertex_descriptor, v: vertex_descriptor, p?: unknown): reference_descriptor | null;
        removeReference(e: reference_descriptor): void;
        removeReferences(u: vertex_descriptor, v: vertex_descriptor): void;
    }
    export interface ParentGraph extends ReferenceGraph, NamedGraph {
        locateChild(v: vertex_descriptor | null, name: string): vertex_descriptor | null;
    }
    export interface AddressableGraph extends ParentGraph {
        addressable(absPath: string): boolean;
        locate(absPath: string): vertex_descriptor | null;
        locateRelative(path: string, start?: vertex_descriptor | null): vertex_descriptor | null;
        path(v: vertex_descriptor): string;
    }
    export interface UuidGraph<Key> extends Graph {
        contains(key: Key): boolean;
        vertex(key: Key): vertex_descriptor;
        find(key: Key): vertex_descriptor | null;
    }
    export interface TerminatorFunc {
        terminate(v: vertex_descriptor, g: IncidenceGraph): boolean;
    }
    export interface GraphVisitor {
        initializeVertex(v: vertex_descriptor, g: IncidenceGraph): void;
        startVertex(v: vertex_descriptor, g: IncidenceGraph): void;
        discoverVertex(v: vertex_descriptor, g: IncidenceGraph): void;
        examineEdge(e: edge_descriptor, g: IncidenceGraph): void;
        treeEdge(e: edge_descriptor, g: IncidenceGraph): void;
        backEdge(e: edge_descriptor, g: IncidenceGraph): void;
        forwardOrCrossEdge(e: edge_descriptor, g: IncidenceGraph): void;
        finishEdge(e: edge_descriptor, g: IncidenceGraph): void;
        finishVertex(v: vertex_descriptor, g: IncidenceGraph): void;
    }
    export enum GraphColor {
        WHITE = 0,
        GRAY = 1,
        GREEN = 2,
        RED = 3,
        BLACK = 4
    }
    export class DefaultVisitor implements GraphVisitor {
        initializeVertex(v: vertex_descriptor, g: IncidenceGraph): void;
        startVertex(v: vertex_descriptor, g: IncidenceGraph): void;
        discoverVertex(v: vertex_descriptor, g: IncidenceGraph): void;
        examineEdge(e: edge_descriptor, g: IncidenceGraph): void;
        treeEdge(e: edge_descriptor, g: IncidenceGraph): void;
        backEdge(e: edge_descriptor, g: IncidenceGraph): void;
        forwardOrCrossEdge(e: edge_descriptor, g: IncidenceGraph): void;
        finishEdge(e: edge_descriptor, g: IncidenceGraph): void;
        finishVertex(v: vertex_descriptor, g: IncidenceGraph): void;
    }
    export class ReferenceGraphView<BaseGraph extends ReferenceGraph & VertexListGraph> implements IncidenceGraph, VertexListGraph {
        constructor(g: BaseGraph);
        nullVertex(): vertex_descriptor | null;
        edge(u: vertex_descriptor, v: vertex_descriptor): boolean;
        source(e: edge_descriptor): vertex_descriptor;
        target(e: edge_descriptor): vertex_descriptor;
        outEdges(v: vertex_descriptor): out_edge_iterator;
        outDegree(v: vertex_descriptor): number;
        vertices(): IterableIterator<vertex_descriptor>;
        numVertices(): number;
        readonly directed_category: directional;
        readonly edge_parallel_category: parallel;
        readonly traversal_category: traversal;
        g: BaseGraph;
    }
    export function getRenderPassTypeName(e: RenderPassType): string;
    export function getLayoutGraphValueName(e: LayoutGraphValue): string;
    export function getLayoutGraphDataValueName(e: LayoutGraphDataValue): string;
    export function saveDescriptorDB(ar: rendering.OutputArchive, v: DescriptorDB): void;
    export function loadDescriptorDB(ar: rendering.InputArchive, v: DescriptorDB): void;
    export function saveRenderPhase(ar: rendering.OutputArchive, v: RenderPhase): void;
    export function loadRenderPhase(ar: rendering.InputArchive, v: RenderPhase): void;
    export function saveLayoutGraph(ar: rendering.OutputArchive, g: LayoutGraph): void;
    export function loadLayoutGraph(ar: rendering.InputArchive, g: LayoutGraph): void;
    export function saveUniformData(ar: rendering.OutputArchive, v: UniformData): void;
    export function loadUniformData(ar: rendering.InputArchive, v: UniformData): void;
    export function saveUniformBlockData(ar: rendering.OutputArchive, v: UniformBlockData): void;
    export function loadUniformBlockData(ar: rendering.InputArchive, v: UniformBlockData): void;
    export function saveDescriptorData(ar: rendering.OutputArchive, v: DescriptorData): void;
    export function loadDescriptorData(ar: rendering.InputArchive, v: DescriptorData): void;
    export function saveDescriptorBlockData(ar: rendering.OutputArchive, v: DescriptorBlockData): void;
    export function loadDescriptorBlockData(ar: rendering.InputArchive, v: DescriptorBlockData): void;
    export function saveDescriptorSetLayoutData(ar: rendering.OutputArchive, v: DescriptorSetLayoutData): void;
    export function loadDescriptorSetLayoutData(ar: rendering.InputArchive, v: DescriptorSetLayoutData): void;
    export function saveDescriptorSetData(ar: rendering.OutputArchive, v: DescriptorSetData): void;
    export function loadDescriptorSetData(ar: rendering.InputArchive, v: DescriptorSetData): void;
    export function savePipelineLayoutData(ar: rendering.OutputArchive, v: PipelineLayoutData): void;
    export function loadPipelineLayoutData(ar: rendering.InputArchive, v: PipelineLayoutData): void;
    export function saveShaderBindingData(ar: rendering.OutputArchive, v: ShaderBindingData): void;
    export function loadShaderBindingData(ar: rendering.InputArchive, v: ShaderBindingData): void;
    export function saveShaderLayoutData(ar: rendering.OutputArchive, v: ShaderLayoutData): void;
    export function loadShaderLayoutData(ar: rendering.InputArchive, v: ShaderLayoutData): void;
    export function saveTechniqueData(ar: rendering.OutputArchive, v: TechniqueData): void;
    export function loadTechniqueData(ar: rendering.InputArchive, v: TechniqueData): void;
    export function saveEffectData(ar: rendering.OutputArchive, v: EffectData): void;
    export function loadEffectData(ar: rendering.InputArchive, v: EffectData): void;
    export function saveShaderProgramData(ar: rendering.OutputArchive, v: ShaderProgramData): void;
    export function loadShaderProgramData(ar: rendering.InputArchive, v: ShaderProgramData): void;
    export function saveRenderStageData(ar: rendering.OutputArchive, v: RenderStageData): void;
    export function loadRenderStageData(ar: rendering.InputArchive, v: RenderStageData): void;
    export function saveRenderPhaseData(ar: rendering.OutputArchive, v: RenderPhaseData): void;
    export function loadRenderPhaseData(ar: rendering.InputArchive, v: RenderPhaseData): void;
    export function saveLayoutGraphData(ar: rendering.OutputArchive, g: LayoutGraphData): void;
    export function loadLayoutGraphData(ar: rendering.InputArchive, g: LayoutGraphData): void;
    export class DescriptorDB {
        readonly blocks: Map<string, rendering.DescriptorBlock>;
    }
    export class RenderPhase {
        readonly shaders: Set<string>;
    }
    export enum RenderPassType {
        SINGLE_RENDER_PASS = 0,
        RENDER_PASS = 1,
        RENDER_SUBPASS = 2
    }
    export const enum LayoutGraphValue {
        RenderStage = 0,
        RenderPhase = 1
    }
    export interface LayoutGraphValueType {
        [LayoutGraphValue.RenderStage]: RenderPassType;
        [LayoutGraphValue.RenderPhase]: RenderPhase;
    }
    export interface LayoutGraphVisitor {
        renderStage(value: RenderPassType): unknown;
        renderPhase(value: RenderPhase): unknown;
    }
    export type LayoutGraphObject = RenderPassType | RenderPhase;
    export class LayoutGraphVertex {
        readonly id: LayoutGraphValue;
        readonly object: LayoutGraphObject;
        constructor(id: LayoutGraphValue, object: LayoutGraphObject);
        readonly _outEdges: OutE[];
        readonly _inEdges: OutE[];
        readonly _id: LayoutGraphValue;
        _object: LayoutGraphObject;
    }
    export class LayoutGraphNameMap implements PropertyMap {
        readonly names: string[];
        constructor(names: string[]);
        get(v: number): string;
        readonly _names: string[];
    }
    export class LayoutGraphDescriptorsMap implements PropertyMap {
        readonly descriptors: DescriptorDB[];
        constructor(descriptors: DescriptorDB[]);
        get(v: number): DescriptorDB;
        readonly _descriptors: DescriptorDB[];
    }
    export const enum LayoutGraphComponent {
        Name = 0,
        Descriptors = 1
    }
    export interface LayoutGraphComponentType {
        [LayoutGraphComponent.Name]: string;
        [LayoutGraphComponent.Descriptors]: DescriptorDB;
    }
    export interface LayoutGraphComponentPropertyMap {
        [LayoutGraphComponent.Name]: LayoutGraphNameMap;
        [LayoutGraphComponent.Descriptors]: LayoutGraphDescriptorsMap;
    }
    export class LayoutGraph implements BidirectionalGraph, AdjacencyGraph, VertexListGraph, MutableGraph, PropertyGraph, NamedGraph, ComponentGraph, PolymorphicGraph, ReferenceGraph, MutableReferenceGraph, AddressableGraph {
        nullVertex(): number;
        readonly directed_category: directional;
        readonly edge_parallel_category: parallel;
        readonly traversal_category: traversal;
        edge(u: number, v: number): boolean;
        source(e: ED): number;
        target(e: ED): number;
        outEdges(v: number): OutEI;
        outDegree(v: number): number;
        inEdges(v: number): InEI;
        inDegree(v: number): number;
        degree(v: number): number;
        adjacentVertices(v: number): AdjI;
        vertices(): IterableIterator<number>;
        numVertices(): number;
        numEdges(): number;
        clear(): void;
        addVertex<T extends LayoutGraphValue>(id: LayoutGraphValue, object: LayoutGraphValueType[T], name: string, descriptors: DescriptorDB, u?: number): number;
        clearVertex(v: number): void;
        removeVertex(u: number): void;
        addEdge(u: number, v: number): ED | null;
        removeEdges(u: number, v: number): void;
        removeEdge(e: ED): void;
        vertexName(v: number): string;
        vertexNameMap(): LayoutGraphNameMap;
        get(tag: string): LayoutGraphNameMap | LayoutGraphDescriptorsMap;
        component<T extends LayoutGraphComponent>(id: T, v: number): LayoutGraphComponentType[T];
        componentMap<T extends LayoutGraphComponent>(id: T): LayoutGraphComponentPropertyMap[T];
        getName(v: number): string;
        getDescriptors(v: number): DescriptorDB;
        holds(id: LayoutGraphValue, v: number): boolean;
        id(v: number): LayoutGraphValue;
        object(v: number): LayoutGraphObject;
        value<T extends LayoutGraphValue>(id: T, v: number): LayoutGraphValueType[T];
        tryValue<T extends LayoutGraphValue>(id: T, v: number): LayoutGraphValueType[T] | null;
        visitVertex(visitor: LayoutGraphVisitor, v: number): unknown;
        getRenderStage(v: number): RenderPassType;
        getRenderPhase(v: number): RenderPhase;
        tryGetRenderStage(v: number): RenderPassType | null;
        tryGetRenderPhase(v: number): RenderPhase | null;
        reference(u: number, v: number): boolean;
        parent(e: ED): number;
        child(e: ED): number;
        parents(v: number): InEI;
        children(v: number): OutEI;
        numParents(v: number): number;
        numChildren(v: number): number;
        getParent(v: number): number;
        isAncestor(ancestor: number, descendent: number): boolean;
        addReference(u: number, v: number): ED | null;
        removeReference(e: ED): void;
        removeReferences(u: number, v: number): void;
        locateChild(u: number, name: string): number;
        addressable(absPath: string): boolean;
        locate(absPath: string): number;
        locateRelative(path: string, start?: number): number;
        path(v: number): string;
        readonly components: string[];
        readonly _vertices: LayoutGraphVertex[];
        readonly _names: string[];
        readonly _descriptors: DescriptorDB[];
    }
    export class UniformData {
        constructor(uniformID?: number, uniformType?: gfx.Type, offset?: number);
        uniformID: number;
        uniformType: gfx.Type;
        offset: number;
        size: number;
    }
    export class UniformBlockData {
        bufferSize: number;
        readonly uniforms: UniformData[];
    }
    export class DescriptorData {
        constructor(descriptorID?: number, type?: gfx.Type, count?: number);
        descriptorID: number;
        type: gfx.Type;
        count: number;
    }
    export class DescriptorBlockData {
        constructor(type?: rendering.DescriptorTypeOrder, visibility?: gfx.ShaderStageFlagBit, capacity?: number);
        type: rendering.DescriptorTypeOrder;
        visibility: gfx.ShaderStageFlagBit;
        offset: number;
        capacity: number;
        readonly descriptors: DescriptorData[];
    }
    export class DescriptorSetLayoutData {
        constructor(slot?: number, capacity?: number, descriptorBlocks?: DescriptorBlockData[], uniformBlocks?: Map<number, gfx.UniformBlock>, bindingMap?: Map<number, number>);
        slot: number;
        capacity: number;
        uniformBlockCapacity: number;
        samplerTextureCapacity: number;
        readonly descriptorBlocks: DescriptorBlockData[];
        readonly uniformBlocks: Map<number, gfx.UniformBlock>;
        readonly bindingMap: Map<number, number>;
    }
    export class DescriptorSetData {
        constructor(descriptorSetLayoutData?: DescriptorSetLayoutData, descriptorSetLayout?: gfx.DescriptorSetLayout | null, descriptorSet?: gfx.DescriptorSet | null);
        readonly descriptorSetLayoutData: DescriptorSetLayoutData;
        readonly descriptorSetLayoutInfo: gfx.DescriptorSetLayoutInfo;
        descriptorSetLayout: gfx.DescriptorSetLayout | null;
        descriptorSet: gfx.DescriptorSet | null;
    }
    export class PipelineLayoutData {
        readonly descriptorSets: Map<rendering.UpdateFrequency, DescriptorSetData>;
    }
    export class ShaderBindingData {
        readonly descriptorBindings: Map<number, number>;
    }
    export class ShaderLayoutData {
        readonly layoutData: Map<rendering.UpdateFrequency, DescriptorSetLayoutData>;
        readonly bindingData: Map<rendering.UpdateFrequency, ShaderBindingData>;
    }
    export class TechniqueData {
        readonly passes: ShaderLayoutData[];
    }
    export class EffectData {
        readonly techniques: Map<string, TechniqueData>;
    }
    export class ShaderProgramData {
        readonly layout: PipelineLayoutData;
        pipelineLayout: gfx.PipelineLayout | null;
    }
    export class RenderStageData {
        readonly descriptorVisibility: Map<number, gfx.ShaderStageFlagBit>;
    }
    export class RenderPhaseData {
        rootSignature: string;
        readonly shaderPrograms: ShaderProgramData[];
        readonly shaderIndex: Map<string, number>;
        pipelineLayout: gfx.PipelineLayout | null;
    }
    export const enum LayoutGraphDataValue {
        RenderStage = 0,
        RenderPhase = 1
    }
    export interface LayoutGraphDataValueType {
        [LayoutGraphDataValue.RenderStage]: RenderStageData;
        [LayoutGraphDataValue.RenderPhase]: RenderPhaseData;
    }
    export interface LayoutGraphDataVisitor {
        renderStage(value: RenderStageData): unknown;
        renderPhase(value: RenderPhaseData): unknown;
    }
    export type LayoutGraphDataObject = RenderStageData | RenderPhaseData;
    export class LayoutGraphDataVertex {
        readonly id: LayoutGraphDataValue;
        readonly object: LayoutGraphDataObject;
        constructor(id: LayoutGraphDataValue, object: LayoutGraphDataObject);
        readonly _outEdges: OutE[];
        readonly _inEdges: OutE[];
        readonly _id: LayoutGraphDataValue;
        _object: LayoutGraphDataObject;
    }
    export class LayoutGraphDataNameMap implements PropertyMap {
        readonly names: string[];
        constructor(names: string[]);
        get(v: number): string;
        readonly _names: string[];
    }
    export class LayoutGraphDataUpdateMap implements PropertyMap {
        readonly updateFrequencies: rendering.UpdateFrequency[];
        constructor(updateFrequencies: rendering.UpdateFrequency[]);
        get(v: number): rendering.UpdateFrequency;
        set(v: number, updateFrequencies: rendering.UpdateFrequency): void;
        readonly _updateFrequencies: rendering.UpdateFrequency[];
    }
    export class LayoutGraphDataLayoutMap implements PropertyMap {
        readonly layouts: PipelineLayoutData[];
        constructor(layouts: PipelineLayoutData[]);
        get(v: number): PipelineLayoutData;
        readonly _layouts: PipelineLayoutData[];
    }
    export const enum LayoutGraphDataComponent {
        Name = 0,
        Update = 1,
        Layout = 2
    }
    export interface LayoutGraphDataComponentType {
        [LayoutGraphDataComponent.Name]: string;
        [LayoutGraphDataComponent.Update]: rendering.UpdateFrequency;
        [LayoutGraphDataComponent.Layout]: PipelineLayoutData;
    }
    export interface LayoutGraphDataComponentPropertyMap {
        [LayoutGraphDataComponent.Name]: LayoutGraphDataNameMap;
        [LayoutGraphDataComponent.Update]: LayoutGraphDataUpdateMap;
        [LayoutGraphDataComponent.Layout]: LayoutGraphDataLayoutMap;
    }
    export class LayoutGraphData implements BidirectionalGraph, AdjacencyGraph, VertexListGraph, MutableGraph, PropertyGraph, NamedGraph, ComponentGraph, PolymorphicGraph, ReferenceGraph, MutableReferenceGraph, AddressableGraph {
        nullVertex(): number;
        readonly directed_category: directional;
        readonly edge_parallel_category: parallel;
        readonly traversal_category: traversal;
        edge(u: number, v: number): boolean;
        source(e: ED): number;
        target(e: ED): number;
        outEdges(v: number): OutEI;
        outDegree(v: number): number;
        inEdges(v: number): InEI;
        inDegree(v: number): number;
        degree(v: number): number;
        adjacentVertices(v: number): AdjI;
        vertices(): IterableIterator<number>;
        numVertices(): number;
        numEdges(): number;
        clear(): void;
        addVertex<T extends LayoutGraphDataValue>(id: LayoutGraphDataValue, object: LayoutGraphDataValueType[T], name: string, update: rendering.UpdateFrequency, layout: PipelineLayoutData, u?: number): number;
        clearVertex(v: number): void;
        removeVertex(u: number): void;
        addEdge(u: number, v: number): ED | null;
        removeEdges(u: number, v: number): void;
        removeEdge(e: ED): void;
        vertexName(v: number): string;
        vertexNameMap(): LayoutGraphDataNameMap;
        get(tag: string): LayoutGraphDataNameMap | LayoutGraphDataUpdateMap | LayoutGraphDataLayoutMap;
        component<T extends LayoutGraphDataComponent>(id: T, v: number): LayoutGraphDataComponentType[T];
        componentMap<T extends LayoutGraphDataComponent>(id: T): LayoutGraphDataComponentPropertyMap[T];
        getName(v: number): string;
        getUpdate(v: number): rendering.UpdateFrequency;
        setUpdate(v: number, value: rendering.UpdateFrequency): void;
        getLayout(v: number): PipelineLayoutData;
        holds(id: LayoutGraphDataValue, v: number): boolean;
        id(v: number): LayoutGraphDataValue;
        object(v: number): LayoutGraphDataObject;
        value<T extends LayoutGraphDataValue>(id: T, v: number): LayoutGraphDataValueType[T];
        tryValue<T extends LayoutGraphDataValue>(id: T, v: number): LayoutGraphDataValueType[T] | null;
        visitVertex(visitor: LayoutGraphDataVisitor, v: number): unknown;
        getRenderStage(v: number): RenderStageData;
        getRenderPhase(v: number): RenderPhaseData;
        tryGetRenderStage(v: number): RenderStageData | null;
        tryGetRenderPhase(v: number): RenderPhaseData | null;
        reference(u: number, v: number): boolean;
        parent(e: ED): number;
        child(e: ED): number;
        parents(v: number): InEI;
        children(v: number): OutEI;
        numParents(v: number): number;
        numChildren(v: number): number;
        getParent(v: number): number;
        isAncestor(ancestor: number, descendent: number): boolean;
        addReference(u: number, v: number): ED | null;
        removeReference(e: ED): void;
        removeReferences(u: number, v: number): void;
        locateChild(u: number, name: string): number;
        addressable(absPath: string): boolean;
        locate(absPath: string): number;
        locateRelative(path: string, start?: number): number;
        path(v: number): string;
        readonly components: string[];
        readonly _vertices: LayoutGraphDataVertex[];
        readonly _names: string[];
        readonly _updateFrequencies: rendering.UpdateFrequency[];
        readonly _layouts: PipelineLayoutData[];
        readonly valueNames: string[];
        readonly attributeIndex: Map<string, number>;
        readonly constantIndex: Map<string, number>;
        readonly shaderLayoutIndex: Map<string, number>;
        readonly effects: Map<string, EffectData>;
        constantMacros: string;
    }
    export function getGfxDescriptorType(type: rendering.DescriptorTypeOrder): gfx.DescriptorType;
    export function getDescriptorTypeOrder(type: gfx.DescriptorType): rendering.DescriptorTypeOrder;
    export function getCustomPassID(lg: LayoutGraphData, name: string | undefined): number;
    export function getCustomSubpassID(lg: LayoutGraphData, passID: number, name: string): number;
    export function getCustomPhaseID(lg: LayoutGraphData, subpassOrPassID: number, name: string | number | undefined): number;
    export function getOrCreateDescriptorID(lg: LayoutGraphData, name: string): number;
    export function getOrCreateConstantID(lg: LayoutGraphData, name: string): number;
    export function buildLayoutGraphData(lg: LayoutGraph, lgData: LayoutGraphData): void;
    export function createGfxDescriptorSetsAndPipelines(device: gfx.Device | null, g: LayoutGraphData): void;
    export function printLayoutGraphData(g: LayoutGraphData): string;
    export function makeDescriptorSetLayoutData(lg: LayoutGraphData, rate: rendering.UpdateFrequency, set: number, descriptors: EffectAsset.IDescriptorInfo): DescriptorSetLayoutData;
    export function initializeDescriptorSetLayoutInfo(layoutData: DescriptorSetLayoutData, info: gfx.DescriptorSetLayoutInfo): void;
    export function initializeLayoutGraphData(device: gfx.Device, lg: LayoutGraphData): void;
    export function terminateLayoutGraphData(lg: LayoutGraphData): void;
    export function getEmptyDescriptorSetLayout(): gfx.DescriptorSetLayout;
    export function getEmptyPipelineLayout(): gfx.PipelineLayout;
    export function getOrCreateDescriptorSetLayout(lg: LayoutGraphData, subpassOrPassID: number, phaseID: number, rate: rendering.UpdateFrequency): gfx.DescriptorSetLayout;
    export function getDescriptorSetLayout(lg: LayoutGraphData, subpassOrPassID: number, phaseID: number, rate: rendering.UpdateFrequency): gfx.DescriptorSetLayout | null;
    export function getOrCreateDescriptorBlockData(data: DescriptorSetLayoutData, type: gfx.DescriptorType, vis: gfx.ShaderStageFlagBit): DescriptorBlockData;
    export function getProgramID(lg: LayoutGraphData, phaseID: number, programName: string): number;
    export function getDescriptorNameID(lg: LayoutGraphData, name: string): number;
    export function getDescriptorName(lg: LayoutGraphData, nameID: number): string;
    export function getPerPassDescriptorSetLayoutData(lg: LayoutGraphData, subpassOrPassID: number): DescriptorSetLayoutData | null;
    export function getPerPhaseDescriptorSetLayoutData(lg: LayoutGraphData, phaseID: number): DescriptorSetLayoutData | null;
    export function getPerBatchDescriptorSetLayoutData(lg: LayoutGraphData, phaseID: number, programID: any): DescriptorSetLayoutData | null;
    export function getPerInstanceDescriptorSetLayoutData(lg: LayoutGraphData, phaseID: number, programID: any): DescriptorSetLayoutData | null;
    export function getBinding(layout: DescriptorSetLayoutData, nameID: number): number;
    export const INVALID_ID = 4294967295;
    export const ENABLE_SUBPASS = true;
    export class PrintVisitor extends DefaultVisitor {
        discoverVertex(u: number, g: LayoutGraphData): void;
        finishVertex(v: number, g: LayoutGraphData): void;
        space: string;
        oss: string;
    }
    export class VisibilityIndex {
        constructor(updateFrequency?: rendering.UpdateFrequency, parameterType?: rendering.ParameterType, descriptorType?: rendering.DescriptorTypeOrder);
        updateFrequency: rendering.UpdateFrequency;
        parameterType: rendering.ParameterType;
        descriptorType: rendering.DescriptorTypeOrder;
    }
    export class VisibilityBlock {
        mergeVisibility(name: string, vis: gfx.ShaderStageFlagBit): void;
        getVisibility(name: string): gfx.ShaderStageFlagBit;
        descriptors: Map<string, gfx.ShaderStageFlagBit>;
    }
    export class VisibilityDB {
        getBlock(index: VisibilityIndex): VisibilityBlock;
        blocks: Map<string, VisibilityBlock>;
    }
    export class VisibilityPass {
        getPhase(phaseName: string): VisibilityDB;
        phases: Map<string, VisibilityDB>;
    }
    export class VisibilityGraph {
        getPass(passName: string): VisibilityPass;
        mergeEffect(asset: EffectAsset): void;
        passes: Map<string, VisibilityPass>;
    }
    export class LayoutGraphInfo {
        constructor(visg: VisibilityGraph);
        lg: LayoutGraph;
        visg: VisibilityGraph;
        readonly enableDebug = false;
        addEffect(asset: EffectAsset): void;
        build(): number;
        print(): string;
    }
    export class BinaryOutputArchive implements rendering.OutputArchive {
        constructor();
        writeBool(value: boolean): void;
        writeNumber(value: number): void;
        writeString(value: string): void;
        reserve(requiredSize: number): void;
        get data(): ArrayBuffer;
        capacity: number;
        size: number;
        buffer: Uint8Array;
        dataView: DataView;
    }
    export class BinaryInputArchive implements rendering.InputArchive {
        constructor(data: ArrayBuffer);
        readBool(): boolean;
        readNumber(): number;
        readString(): string;
        offset: number;
        dataView: DataView;
    }
    export import getUpdateFrequencyName = rendering.getUpdateFrequencyName;
    export import getParameterTypeName = rendering.getParameterTypeName;
    export import getResourceResidencyName = rendering.getResourceResidencyName;
    export import getQueueHintName = rendering.getQueueHintName;
    export import getResourceDimensionName = rendering.getResourceDimensionName;
    export import getTaskTypeName = rendering.getTaskTypeName;
    export import getLightingModeName = rendering.getLightingModeName;
    export import getAttachmentTypeName = rendering.getAttachmentTypeName;
    export import getAccessTypeName = rendering.getAccessTypeName;
    export import getClearValueTypeName = rendering.getClearValueTypeName;
    export import getDescriptorTypeOrderName = rendering.getDescriptorTypeOrderName;
    export import saveLightInfo = rendering.saveLightInfo;
    export import loadLightInfo = rendering.loadLightInfo;
    export import saveDescriptor = rendering.saveDescriptor;
    export import loadDescriptor = rendering.loadDescriptor;
    export import saveDescriptorBlock = rendering.saveDescriptorBlock;
    export import loadDescriptorBlock = rendering.loadDescriptorBlock;
    export import saveDescriptorBlockFlattened = rendering.saveDescriptorBlockFlattened;
    export import loadDescriptorBlockFlattened = rendering.loadDescriptorBlockFlattened;
    export import saveDescriptorBlockIndex = rendering.saveDescriptorBlockIndex;
    export import loadDescriptorBlockIndex = rendering.loadDescriptorBlockIndex;
    export import saveResolvePair = rendering.saveResolvePair;
    export import loadResolvePair = rendering.loadResolvePair;
    export import saveCopyPair = rendering.saveCopyPair;
    export import loadCopyPair = rendering.loadCopyPair;
    export import saveMovePair = rendering.saveMovePair;
    export import loadMovePair = rendering.loadMovePair;
    export import savePipelineStatistics = rendering.savePipelineStatistics;
    export import loadPipelineStatistics = rendering.loadPipelineStatistics;
    export import UpdateFrequency = rendering.UpdateFrequency;
    export import ParameterType = rendering.ParameterType;
    export import ResourceResidency = rendering.ResourceResidency;
    export import QueueHint = rendering.QueueHint;
    export import ResourceDimension = rendering.ResourceDimension;
    export import ResourceFlags = rendering.ResourceFlags;
    export import TaskType = rendering.TaskType;
    export import SceneFlags = rendering.SceneFlags;
    export import LightingMode = rendering.LightingMode;
    export import AttachmentType = rendering.AttachmentType;
    export import AccessType = rendering.AccessType;
    export import ClearValueType = rendering.ClearValueType;
    export import LightInfo = rendering.LightInfo;
    export import DescriptorTypeOrder = rendering.DescriptorTypeOrder;
    export import Descriptor = rendering.Descriptor;
    export import DescriptorBlock = rendering.DescriptorBlock;
    export import DescriptorBlockFlattened = rendering.DescriptorBlockFlattened;
    export import DescriptorBlockIndex = rendering.DescriptorBlockIndex;
    export import ResolveFlags = rendering.ResolveFlags;
    export import ResolvePair = rendering.ResolvePair;
    export import CopyPair = rendering.CopyPair;
    export import UploadPair = rendering.UploadPair;
    export import MovePair = rendering.MovePair;
    export import PipelineStatistics = rendering.PipelineStatistics;
    export import OutputArchive = rendering.OutputArchive;
    export import InputArchive = rendering.InputArchive;
    import { rendering, gfx, EffectAsset } from "cc";
    export {};
}
declare module "cc/editor/embedded-player" {
    export const embeddedPlayerCountTag: unique symbol;
    export const getEmbeddedPlayersTag: unique symbol;
    export const addEmbeddedPlayerTag: unique symbol;
    export const removeEmbeddedPlayerTag: unique symbol;
    export const clearEmbeddedPlayersTag: unique symbol;
    export class EmbeddedPlayer extends ___private._cocos_core_data_editor_extendable__EditorExtendable {
        /**
         * @en
         * Begin time, in seconds.
         * @zh
         * 开始时间，以秒为单位。
         */
        begin: number;
        /**
         * @en
         * End time, in seconds.
         * @zh
         * 结束时间，以秒为单位。
         */
        end: number;
        /**
         * @en
         * Whether the speed of this embedded player should be reconciled with the host animation clip.
         * @zh
         * 子区域的播放速度是否应和宿主动画剪辑保持一致。
         */
        reconciledSpeed: boolean;
        /**
         * @en
         * Player of the embedded player.
         * @zh
         * 子区域的播放器。
         */
        playable: EmbeddedPlayable | null;
    }
    export abstract class EmbeddedPlayable {
        /**
         * @en
         * Instantiates this sub region.
         * @zh
         * 实例化此子区域。
         * @param root The root node of animation context.
         * @internal
         */
        abstract instantiate(root: Node): ___private._cocos_animation_embedded_player_embedded_player__EmbeddedPlayableState | null;
    }
    /**
     * @en
     * The embedded particle system playable. The players play particle system on a embedded player.
     * @zh
     * 粒子系统子区域播放器。此播放器在子区域上播放粒子系统。
     */
    export class EmbeddedParticleSystemPlayable extends EmbeddedPlayable {
        /**
         * @en
         * Path to the node where particle system inhabits, relative from animation context root.
         * @zh
         * 粒子系统所在的结点路径，相对于动画上下文的根节点。
         */
        path: string;
        instantiate(root: Node): ___private._cocos_animation_embedded_player_embedded_particle_system_player__EmbeddedParticleSystemPlayableState | null;
    }
    /**
     * @en
     * The embedded animation clip playable. The playable play animation clip on a embedded player.
     * @zh
     * 动画剪辑子区域播放器。此播放器在子区域上播放动画剪辑。
     */
    export class EmbeddedAnimationClipPlayable extends EmbeddedPlayable {
        /**
         * @en
         * Path to the node onto which the animation clip would be played, relative from animation context root.
         * @zh
         * 要播放动画剪辑的节点的路径，相对于动画上下文的根节点。
         */
        path: string;
        /**
         * @en
         * The animation clip to play.
         * @zh
         * 要播放的动画剪辑。
         */
        clip: AnimationClip | null;
        instantiate(root: Node): ___private._cocos_animation_embedded_player_embedded_animation_clip_player__EmbeddedAnimationClipPlayableState | null;
    }
    import { __private as ___private, Node, AnimationClip } from "cc";
    export {};
}
declare module "cc/editor/exotic-animation" {
    export const exoticAnimationTag: unique symbol;
    /**
     * Animation that:
     * - does not exposed by users;
     * - does not compatible with regular animation;
     * - non-editable;
     * - currently only generated imported from model file.
     */
    export class ExoticAnimation {
        createEvaluator(binder: ___private._cocos_animation_tracks_track__Binder): ___private._cocos_animation_exotic_animation_exotic_animation__ExoticTrsAnimationEvaluator;
        createEvaluatorForAnimationGraph(context: ____private._cocos_animation_marionette_animation_graph_animation_clip_binding__AnimationClipGraphBindingContext): ___private._cocos_animation_exotic_animation_exotic_animation__ExoticTrsAGEvaluation;
        addNodeAnimation(path: string): ___private._cocos_animation_exotic_animation_exotic_animation__ExoticNodeAnimation;
        collectAnimatedJoints(): string[];
        split(from: number, to: number): ExoticAnimation;
        /**
         * @internal
         */
        toHashString(): string;
    }
    /**
     * @en
     * A real array track animates a real array attribute of target(such as morph weights of mesh renderer).
     * Every element in the array is corresponding to a real channel.
     * @zh
     * 实数数组轨道描述目标上某个实数数组属性（例如网格渲染器的形变权重）的动画。
     * 数组中的每个元素都对应一条实数通道。
     */
    export class RealArrayTrack extends animation.Track {
        /**
         * @en The number of elements in the array which this track produces.
         * If you increased the count, there will be new empty real channels appended.
         * Otherwise if you decreased the count, the last specified number channels would be removed.
         * @zh 此轨道产生的数组元素的数量。
         * 当你增加数量时，会增加新的空实数通道；当你减少数量时，最后几个指定数量的通道会被移除。
         */
        get elementCount(): number;
        set elementCount(value: number);
        /**
         * @en The channels of the track.
         * @zh 返回此轨道的所有通道的数组。
         */
        channels(): ___private._cocos_animation_tracks_track__RealChannel[];
        /**
         * @internal
         */
        [___private._cocos_animation_define__createEvalSymbol](): ___private._cocos_animation_tracks_array_track__RealArrayTrackEval;
    }
    /**
     * Tag to access the additive settings associated on animation clip.
     */
    export const additiveSettingsTag: unique symbol;
    export class AnimationClipAdditiveSettings {
        enabled: boolean;
        refClip: AnimationClip | null;
    }
    import { AnimationMask, __private as ____private } from "cc/editor/new-gen-anim";
    import { __private as ___private, Node, animation, AnimationClip } from "cc";
    export {};
}
declare module "cc/editor/lod-group-utils" {
    export class LODGroupEditorUtility {
        /**
         * @en Get the lod level used under the current camera, -1 indicates no lod is used.
         * @zh 获取当前摄像机下，使用哪一级的LOD，-1 表示没有lod被使用
         * @param lodGroup current LOD Group component.
         * @param camera current perspective camera.
         * @returns visible LOD index in lodGroup.
         */
        static getVisibleLOD(lodGroup: LODGroup, camera: renderer.scene.Camera): number;
        /**
         * @en Get the percentage of objects used on the screen under the current camera.
         * @zh 获取当前摄像机下，物体在屏幕上的占用比率
         * @param lodGroup current LOD Group component
         * @param camera current perspective camera
         * @returns height of current lod group relative to camera position in screen space, aka. relativeHeight
         */
        static getRelativeHeight(lodGroup: LODGroup, camera: renderer.scene.Camera): number | null;
    }
    import { LODGroup, renderer } from "cc";
    export {};
}
declare module "cc/editor/macro" {
    export { macro, Macro } from "cc";
    export {};
}
declare module "cc/editor/material" {
    export class RasterizerStateEditor extends gfx.RasterizerState {
        isDiscard: boolean;
        polygonMode: gfx.PolygonMode;
        shadeModel: gfx.ShadeModel;
        cullMode: gfx.CullMode;
        isFrontFaceCCW: boolean;
        depthBias: number;
        depthBiasClamp: number;
        depthBiasSlop: number;
        isDepthClip: boolean;
        isMultisample: boolean;
        lineWidth: number;
    }
    export class DepthStencilStateEditor extends gfx.DepthStencilState {
        depthTest: boolean;
        depthWrite: boolean;
        depthFunc: gfx.ComparisonFunc;
        stencilTestFront: boolean;
        stencilFuncFront: gfx.ComparisonFunc;
        stencilReadMaskFront: number;
        stencilWriteMaskFront: number;
        stencilFailOpFront: gfx.StencilOp;
        stencilZFailOpFront: gfx.StencilOp;
        stencilPassOpFront: gfx.StencilOp;
        stencilRefFront: number;
        stencilTestBack: boolean;
        stencilFuncBack: gfx.ComparisonFunc;
        stencilReadMaskBack: number;
        stencilWriteMaskBack: number;
        stencilFailOpBack: gfx.StencilOp;
        stencilZFailOpBack: gfx.StencilOp;
        stencilPassOpBack: gfx.StencilOp;
        stencilRefBack: number;
    }
    export class BlendTargetEditor extends gfx.BlendTarget {
        blend: boolean;
        blendSrc: gfx.BlendFactor;
        blendDst: gfx.BlendFactor;
        blendEq: gfx.BlendOp;
        blendSrcAlpha: gfx.BlendFactor;
        blendDstAlpha: gfx.BlendFactor;
        blendAlphaEq: gfx.BlendOp;
        blendColorMask: gfx.ColorMask;
    }
    export class BlendStateEditor {
        isA2C: boolean;
        isIndepend: boolean;
        blendColor: math.Color;
        targets: BlendTargetEditor[];
        init(blendState: any): void;
    }
    export class PassStatesEditor implements EffectAsset.IPassStates {
        priority: number;
        primitive: gfx.PrimitiveMode;
        stage: pipeline.RenderPassStage;
        rasterizerState: RasterizerStateEditor;
        depthStencilState: DepthStencilStateEditor;
        blendState: BlendStateEditor;
        dynamics: never[];
        customizations: never[];
        phase: string;
    }
    import { gfx, math, pipeline, EffectAsset } from "cc";
    export {};
}
declare module "cc/editor/new-gen-anim" {
    export function blend1D(weights: number[], thresholds: readonly number[], value: number): void;
    /**
     * Blends given samples using simple directional algorithm.
     * @param weights Result weights of each sample.
     * @param samples Every samples' parameter.
     * @param input Input parameter.
     */
    export const blendSimpleDirectional: (weights: number[], samples: readonly math.Vec2[], input: Readonly<math.Vec2>) => void;
    /**
     * Validates the samples if they satisfied the requirements of simple directional algorithm.
     * @param samples Samples to validate.
     * @returns Issues the samples containing.
     */
    export function validateSimpleDirectionalSamples(samples: ReadonlyArray<math.Vec2>): SimpleDirectionalSampleIssue[];
    /**
     * Simple directional issue representing some samples have same(or very similar) direction.
     */
    export class SimpleDirectionalIssueSameDirection {
        samples: readonly number[];
        constructor(samples: readonly number[]);
    }
    export type SimpleDirectionalSampleIssue = SimpleDirectionalIssueSameDirection;
    export function viewVariableBindings(animationGraph: AnimationGraph): Generator<VariableBindingView>;
    export interface VariableBindingView {
        /**
         * The current bounded variable name.
         */
        readonly name: string;
        /**
         * The acceptable types of this binding.
         */
        readonly acceptableTypes: animation.VariableType[];
        /**
         * Rebinds this binding to new variable.
         * @param _newVariableName
         */
        rebind(_newVariableName: string): void;
        /**
         * Unbinds the variable.
         */
        unbind(): void;
    }
    export class MotionPreviewer extends ___private._editor_src_marionette_preview__AnimationGraphPartialPreviewer {
        get timelineStats(): Readonly<MotionPreviewerTimelineStats>;
        /**
         * Gets an iterable to the weights of each motion(that has runtime ID).
         */
        queryWeights(): Iterable<[
            __private._cocos_animation_marionette_graph_debug__RuntimeID,
            number
        ]>;
        setMotion(motion: Motion): void;
        setTime(time: number): void;
        updateVariable(id: string, value: animation.Value_experimental): void;
        protected doEvaluate(context: __private._cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext): ___private._cocos_animation_core_pose__Pose;
    }
    export class TransitionPreviewer extends ___private._editor_src_marionette_preview__AnimationGraphPartialPreviewer {
        constructor(root: Node);
        destroy(): void;
        get timelineStats(): Readonly<TransitionPreviewerTimelineStats>;
        setSourceMotion(motion: Motion): void;
        setTargetMotion(motion: Motion): void;
        setTransitionDuration(value: number): void;
        setRelativeTransitionDuration(value: boolean): void;
        calculateTransitionDurationFromTimelineLength(value: number): number;
        setExitTimes(value: number): void;
        setExitTimeEnabled(value: boolean): void;
        setDestinationStart(value: number): void;
        setRelativeDestinationStart(value: boolean): void;
        calculateExitTimesFromTimelineLength(value: number): number;
        updateVariable(id: string, value: animation.Value_experimental): void;
        /**
         *
         * @param time Player time, in seconds.
         */
        setTime(time: number): void;
        protected doEvaluate(context: __private._cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext): ___private._cocos_animation_core_pose__Pose;
    }
    export interface MotionPreviewerTimelineStats {
        timeLineLength: number;
    }
    export interface TransitionPreviewerTimelineStats {
        timeLineLength: number;
        sourceMotionStart: number;
        sourceMotionRepeatCount: number;
        sourceMotionDuration: number;
        targetMotionStart: number;
        targetMotionRepeatCount: number;
        targetMotionDuration: number;
        exitTimesStart: number;
        exitTimesLength: number;
        transitionDurationStart: number;
        transitionDurationLength: number;
    }
    /**
     * Clones a state into same state machine.
     * @param stateMachine The state machine within which the motion state locates.
     * @param state The state.
     * @param includeTransitions If true, transitions are also cloned.
     * @returns The newly created state.
     *
     * For each editor extras object attached on animation-graph-specific objects,
     * if the editor extras object has a method called `clone`,
     * that method would be called to perform a clone operation on that editor extras object.
     * The return value would be used as the clone result.
     * The method `clone` has the signature: `(host: EditorExtendableObject) => unknown`.
     * Otherwise, if no `clone` method provide, the new editor extras would be set to undefined.
     */
    export function cloneState<TState extends MotionState | EmptyState | SubStateMachine | ProceduralPoseState>(stateMachine: StateMachine, state: TState, includeTransitions: boolean): TState;
    /**
     * Clones a state into maybe another state machine.
     * @param stateMachine The state machine within which the motion state locates.
     * @param state The state.
     * @param targetStateMachine Target state machine
     * @returns The newly created state.
     *
     * For each editor extras object attached on animation-graph-specific objects,
     * if the editor extras object has a method called `clone`,
     * that method would be called to perform a clone operation on that editor extras object.
     * The return value would be used as the clone result.
     * The method `clone` has the signature: `(host: EditorExtendableObject) => unknown`.
     * Otherwise, if no `clone` method provide, the new editor extras would be set to undefined.
     */
    export function cloneState(stateMachine: StateMachine, state: MotionState | EmptyState | SubStateMachine | ProceduralPoseState, targetStateMachine: StateMachine): SubStateMachine;
    /**
     * Turns a motion state into a new sub state machine.
     * @param stateMachine The state machine within which the motion state locates.
     * @param state The motion state.
     * @returns The newly created sub state machine.
     */
    export function turnMotionStateIntoSubStateMachine(stateMachine: StateMachine, state: MotionState): SubStateMachine;
    export function visitAnimationClips(animationGraph: AnimationGraph): Generator<AnimationClip>;
    export function visitAnimationClipsInController(animationController: animation.AnimationController): Generator<AnimationClip>;
    export function visitAnimationGraphEditorExtras(animationGraph: AnimationGraph): Generator<___private._cocos_core_data_editor_extras_tag__EditorExtendableObject>;
    export function getVariableValueAttributes(variableDescription: VariableDescription): unknown;
    export class InvalidTransitionError extends Error {
        constructor(type: "to-entry" | "to-any" | "from-exit");
    }
    export class VariableNotDefinedError extends Error {
        constructor(name: string);
    }
    export class AnimationGraph extends __private._cocos_animation_marionette_animation_graph_like__AnimationGraphLike implements animation.AnimationGraphRunTime {
        readonly __brand: "AnimationGraph";
        constructor();
        onLoaded(): void;
        get layers(): readonly Layer[];
        get variables(): Iterable<[
            string,
            VariableDescription
        ]>;
        /**
         * Adds a layer.
         * @returns The new layer.
         */
        addLayer(): Layer;
        /**
         * Removes a layer.
         * @param index Index to the layer to remove.
         */
        removeLayer(index: number): void;
        /**
         * Adjusts the layer's order.
         * @param index
         * @param newIndex
         */
        moveLayer(index: number, newIndex: number): void;
        /**
         * Adds a variable into this graph.
         * @param name The variable's name.
         * @param type The variable's type.
         * @param initialValue Initial value.
         */
        addVariable<TVariableType extends animation.VariableType>(name: string, type: TVariableType, initialValue?: __private._cocos_animation_marionette_variable_basic__VariableTypeValueTypeMap[TVariableType]): VariableDescription;
        removeVariable(name: string): void;
        getVariable(name: string): VariableDescription | undefined;
        /**
         * @zh 重命名一个变量。注意，所有对该变量的引用都不会修改。
         * 如果变量的原始名称不存在或者新的名称已存在，此方法不会做任何事。
         * 变量在图中的顺序会保持不变。
         * @en Renames an variable. Note, this won't changes any reference to the variable.
         * If the original name of the variable doesn't exists or
         * the new name has already existed, this method won't do anything.
         * The variable's order in the graph is also retained.
         * @param name @zh 要重命名的变量的名字。 @en The name of the variable to be renamed.
         * @param newName @zh 新的名字。 @en New name.
         */
        renameVariable(name: string, newName: string): void;
    }
    export function isAnimationTransition(transition: Transition): transition is AnimationTransition;
    export class StateMachine extends ___private._cocos_core_data_editor_extendable__EditorExtendable {
        /**
         * @internal
         */
        _allowEmptyStates: boolean;
        /**
         * // TODO: HACK
         * @internal
         */
        __callOnAfterDeserializeRecursive(): void;
        constructor(allowEmptyStates?: boolean);
        [___private._cocos_serialization_deserialize_symbols__onAfterDeserializedTag](): void;
        get allowEmptyStates(): boolean;
        /**
         * The entry state.
         */
        get entryState(): State;
        /**
         * The exit state.
         */
        get exitState(): State;
        /**
         * The any state.
         */
        get anyState(): State;
        /**
         * Gets an iterator to all states within this graph.
         * @returns The iterator.
         */
        states(): Iterable<State>;
        /**
         * Gets an iterator to all transitions within this graph.
         * @returns The iterator.
         */
        transitions(): Iterable<__private._cocos_animation_marionette_animation_graph__Transition>;
        /**
         * Gets the transitions between specified states.
         * @param from Transition source.
         * @param to Transition target.
         * @returns Iterator to the transitions
         */
        getTransitionsBetween(from: State, to: State): Iterable<__private._cocos_animation_marionette_animation_graph__Transition>;
        /**
         * @en
         * Gets all transitions outgoing from specified state.
         * @zh
         * 获取从指定状态引出的所有过渡。
         * @param from @en The state. @zh 指定状态。
         * @returns @en Iterable to result transitions, in priority order. @zh 到结果过渡的迭代器，按优先级顺序。
         */
        getOutgoings(from: State): Iterable<__private._cocos_animation_marionette_animation_graph__Transition>;
        /**
         * Gets all incoming transitions of specified state.
         * @param to The state.
         * @returns Result transitions.
         */
        getIncomings(to: State): Iterable<__private._cocos_animation_marionette_animation_graph__Transition>;
        /**
         * Adds a motion state into this state machine.
         * @returns The newly created motion.
         */
        addMotion(): MotionState;
        /**
         * Adds a sub state machine into this state machine.
         * @returns The newly created state machine.
         */
        addSubStateMachine(): SubStateMachine;
        /**
         * Adds an empty state into this state machine.
         * @returns The newly created empty state.
         */
        addEmpty(): EmptyState;
        /**
         * @zh 向此状态机中添加一项姿势状态。
         * @en Adds an pose state into this state machine.
         * @returns @zh 新创建的姿势状态。 @en The newly created pose state.
         */
        addProceduralPoseState(): __private._cocos_animation_marionette_animation_graph__ProceduralPoseState;
        /**
         * Removes specified state from this state machine.
         * @param state The state to remove.
         */
        remove(state: State): void;
        /**
         * Connect two states.
         * @param from Source state.
         * @param to Target state.
         * @param condition The transition condition.
         */
        connect(from: MotionState, to: State, conditions?: Condition[]): AnimationTransition;
        /**
         * Connect two states.
         * @param from Source state.
         * @param to Target state.
         * @param condition The transition condition.
         */
        connect(from: EmptyState, to: State, conditions?: Condition[]): EmptyStateTransition;
        /**
         * Connect two states.
         * @param from Source state.
         * @param to Target state.
         * @param condition The transition condition.
         */
        connect(from: __private._cocos_animation_marionette_animation_graph__ProceduralPoseState, to: State, conditions?: Condition[]): __private._cocos_animation_marionette_animation_graph__ProceduralPoseTransition;
        /**
         * Connect two states.
         * @param from Source state.
         * @param to Target state.
         * @param condition The transition condition.
         * @throws `InvalidTransitionError` if:
         * - the target state is entry or any, or
         * - the source state is exit.
         */
        connect(from: State, to: State, conditions?: Condition[]): Transition;
        disconnect(from: State, to: State): void;
        removeTransition(removal: __private._cocos_animation_marionette_animation_graph__Transition): void;
        eraseOutgoings(from: State): void;
        eraseIncomings(to: State): void;
        eraseTransitionsIncludes(state: State): void;
        /**
         * @en
         * Adjusts the priority of a transition.
         *
         * To demonstrate, one can imagine a transition array sorted by their priority.
         * - If `diff` is zero, nothing's gonna happen.
         * - Negative `diff` raises the priority:
         *   `diff` number of transitions originally having higher priority than `adjusting`
         *   will then have lower priority than `adjusting`.
         * - Positive `diff` reduce the priority:
         *   `|diff|` number of transitions originally having lower priority than `adjusting`
         *   will then have higher priority than `adjusting`.
         *
         * If the number of transitions indicated by `diff`
         * is more than the actual one, the actual number would be taken.
         * @zh
         * 调整过渡的优先级。
         *
         * 为了说明，可以想象一个由优先级排序的过渡数组。
         * - 如果 `diff` 是 0，无事发生。
         * - 负的 `diff` 会提升该过渡的优先级：原本优先于 `adjusting` 的 `diff` 条过渡的优先级会设置为低于 `adjusting`。
         * - 正的 `diff` 会降低该过渡的优先级：原本优先级低于 `adjusting` 的 `|diff|` 条过渡会设置为优先于 `adjusting`。
         *
         * 如果 `diff` 指示的过渡数量比实际多，则会使用实际数量。
         *
         * @param adjusting @en The transition to adjust the priority. @zh 需要调整优先级的过渡。
         * @param diff @en Indicates how to adjust the priority. @zh 指示如何调整优先级。
         */
        adjustTransitionPriority(adjusting: __private._cocos_animation_marionette_animation_graph__Transition, diff: number): void;
        copyTo(that: StateMachine): void;
        clone(): StateMachine;
    }
    export class SubStateMachine extends __private._cocos_animation_marionette_state_machine_state__InteractiveState {
        constructor(allowEmptyStates?: boolean);
        get stateMachine(): StateMachine;
        copyTo(that: SubStateMachine): void;
    }
    export class EmptyStateTransition extends __private._cocos_animation_marionette_animation_graph__DurationalTransition {
        /**
         * The transition duration, in seconds.
         */
        duration: number;
        copyTo(that: EmptyStateTransition): void;
    }
    export class EmptyState extends State {
        __brand: "EmptyState";
    }
    export type ProceduralPoseState = __private._cocos_animation_marionette_animation_graph__ProceduralPoseState;
    export const ProceduralPoseState: typeof __private._cocos_animation_marionette_animation_graph__ProceduralPoseState;
    export type ProceduralPoseTransition = __private._cocos_animation_marionette_animation_graph__ProceduralPoseTransition;
    export const ProceduralPoseTransition: typeof __private._cocos_animation_marionette_animation_graph__ProceduralPoseTransition;
    export type Transition = Omit<__private._cocos_animation_marionette_animation_graph__Transition, "from" | "to"> & {
        readonly from: __private._cocos_animation_marionette_animation_graph__Transition["from"];
        readonly to: __private._cocos_animation_marionette_animation_graph__Transition["to"];
    };
    export type AnimationTransition = Omit<__private._cocos_animation_marionette_animation_graph__AnimationTransition, "from" | "to"> & {
        readonly from: __private._cocos_animation_marionette_animation_graph__AnimationTransition["from"];
        readonly to: __private._cocos_animation_marionette_animation_graph__AnimationTransition["to"];
    };
    export class Layer implements __private._cocos_animation_marionette_ownership__OwnedBy<AnimationGraph> {
        [__private._cocos_animation_marionette_ownership__ownerSymbol]: AnimationGraph | undefined;
        name: string;
        weight: number;
        mask: AnimationMask | null;
        additive: boolean;
        /**
         * // TODO: HACK
         * @internal
         */
        __callOnAfterDeserializeRecursive(): void;
        stashes(): Iterable<Readonly<[
            string,
            __private._cocos_animation_marionette_animation_graph__PoseGraphStash
        ]>>;
        getStash(id: string): __private._cocos_animation_marionette_animation_graph__PoseGraphStash | undefined;
        addStash(id: string): __private._cocos_animation_marionette_animation_graph__PoseGraphStash;
        removeStash(id: string): void;
        renameStash(id: string, newId: string): void;
        /**
         * @marked_as_engine_private
         */
        constructor();
        get stateMachine(): StateMachine;
    }
    export class State extends ___private._cocos_core_data_editor_extendable__EditorExtendable implements __private._cocos_animation_marionette_ownership__OwnedBy<Layer | StateMachine> {
        [__private._cocos_animation_marionette_ownership__ownerSymbol]: StateMachine | undefined;
        name: string;
        [__private._cocos_animation_marionette_state_machine_state__outgoingsSymbol]: __private._cocos_animation_marionette_animation_graph__TransitionInternal[];
        [__private._cocos_animation_marionette_state_machine_state__incomingsSymbol]: __private._cocos_animation_marionette_animation_graph__TransitionInternal[];
        constructor();
        copyTo(that: State): void;
    }
    /**
     * @zh 描述一个二元条件，它有两个数值类型的操作数。
     * @en Describes a binary condition, there are two operands with numeric type.
     */
    export class BinaryCondition implements Condition {
        static readonly Operator: typeof __private._cocos_animation_marionette_state_machine_condition_binary_condition__BinaryOperator;
        /**
         * @zh
         * 运算符。
         * @en
         * Operator.
         */
        operator: __private._cocos_animation_marionette_state_machine_condition_binary_condition__BinaryOperator;
        /**
         * @zh
         * 左操作数的值。
         * @en
         * Left operand value.
         */
        lhs: number;
        /**
         * @zh
         * 左操作数上的绑定。
         * @en
         * Left operand binding.
         */
        lhsBinding: __private._cocos_animation_marionette_state_machine_condition_binary_condition__LhsBinding;
        /**
         * @zh
         * 右操作数的值。
         * @en
         * Right operand value.
         */
        rhs: number;
        clone(): BinaryCondition;
        [__private._cocos_animation_marionette_create_eval__createEval](context: __private._cocos_animation_marionette_state_machine_condition_condition_base__ConditionBindingContext): __private._cocos_animation_marionette_state_machine_condition_binary_condition__BinaryConditionEval;
    }
    export namespace BinaryCondition {
        export type Operator = __private._cocos_animation_marionette_state_machine_condition_binary_condition__BinaryOperator;
    }
    export class UnaryCondition implements Condition {
        static readonly Operator: typeof __private._cocos_animation_marionette_state_machine_condition_unary_condition__UnaryOperator;
        operator: __private._cocos_animation_marionette_state_machine_condition_unary_condition__UnaryOperator;
        operand: BindableBoolean;
        clone(): UnaryCondition;
        [__private._cocos_animation_marionette_create_eval__createEval](context: __private._cocos_animation_marionette_state_machine_condition_condition_base__ConditionBindingContext): __private._cocos_animation_marionette_state_machine_condition_unary_condition__UnaryConditionEval;
    }
    export namespace UnaryCondition {
        export type Operator = __private._cocos_animation_marionette_state_machine_condition_unary_condition__UnaryOperator;
    }
    export class TriggerCondition implements Condition {
        trigger: string;
        clone(): TriggerCondition;
        [__private._cocos_animation_marionette_create_eval__createEval](context: __private._cocos_animation_marionette_state_machine_condition_condition_base__ConditionBindingContext): __private._cocos_animation_marionette_state_machine_condition_condition_base__ConditionEval;
    }
    export interface Condition {
        clone(): Condition;
        [__private._cocos_animation_marionette_create_eval__createEval](context: __private._cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext): __private._cocos_animation_marionette_state_machine_condition_condition_base__ConditionEval;
    }
    /**
     * @zh 描述过渡条件中的值绑定，例如，二元条件的左操作数上的绑定。
     * 前缀 “TC” 是 “Transition Condition” 的缩写。
     *
     * @en Describes a value binding in transition condition,
     * for example, the binding on binary condition's left hand operand.
     * The prefix "TC" is abbr of `Transition Condition`.
     */
    export abstract class TCBinding<TValueType extends TCBindingValueType> {
        /**
         * @zh
         * 获取绑定的值类型。
         * @en
         * Gets the binding value type.
         */
        abstract getValueType(): TValueType;
        abstract bind(context: __private._cocos_animation_marionette_state_machine_condition_condition_base__ConditionBindingContext): __private._cocos_animation_marionette_state_machine_condition_binding_binding__TCBindingEvaluation<TValueType> | undefined;
    }
    /**
     * @zh
     * 描述过渡条件中，某个绑定提供的值的类型。
     * @en
     * Describes the type of value providing by a transition condition binding.
     */
    export enum TCBindingValueType {
        FLOAT = 0,
        INTEGER = 3
    }
    /**
     * @zh 获取指定（过渡条件）绑定类的类型信息。
     * @zh Gets the type info of specified (transition condition)binding class.
     * @param constructor @zh 该绑定类的构造函数。@en The binding class's constructor.
     * @returns @zh 类型信息。@en Type info.
     */
    export function getTCBindingTypeInfo(constructor: ___private._types_globals__Constructor<TCBinding<number>>): Readonly<TCBindingTypeInfo> | undefined;
    export enum TCBindingTransitionSourceFilter {
        /** Motion states. */
        MOTION = 1,
        /** Pose states. */
        POSE = 2,
        /** Empty states. */
        EMPTY = 4,
        /** All states having weight concept. */
        WEIGHTED = 7
    }
    /**
     * @zh
     * 描述某个（过渡条件）绑定类的类型信息。
     * @en
     * Describes the type info of a (transition condition)binding class.
     */
    export interface TCBindingTypeInfo {
        /**
         * @zh
         * 该绑定类型的创建菜单信息。
         * @en
         * The creation menu info of this binding class.
         */
        menu?: string;
        /**
         * @zh
         * 该绑定类能提供的所有值类型。
         * @en
         * All value types that this binding can provides.
         */
        provisions?: readonly TCBindingValueType[];
        /**
         * @zh
         * 如果有定义，表示该类型的绑定支持的过渡源状态的类型。
         * @en
         * If defined, represents the type(s) of the transition source state supported by this type of binding.
         */
        transitionSourceFilter?: TCBindingTransitionSourceFilter;
    }
    export type VariableDescription = __private._cocos_animation_marionette_variable_primitive_variable__PlainVariable | __private._cocos_animation_marionette_variable_vec3_variable__Vec3Variable | __private._cocos_animation_marionette_variable_quat_variable__QuatVariable | __private._cocos_animation_marionette_variable_trigger_variable__TriggerVariable;
    /**
     * @en The reset mode of boolean variables. It indicates when to reset the variable as `false`.
     * @zh 布尔类型变量的重置模式，指示在哪些情况下将变量重置为 `false`。
     */
    export enum TriggerResetMode {
        /**
         * @en The variable is reset when it's consumed by animation transition.
         * @zh 在该变量被动画过渡消耗后自动重置。
         */
        AFTER_CONSUMED = 0,
        /**
         * @en The variable is reset in next frame or when it's consumed by animation transition.
         * @zh 下一帧自动重置；在该变量被动画过渡消耗后也会自动重置。
         */
        NEXT_FRAME_OR_AFTER_CONSUMED = 1
    }
    export class MotionState extends __private._cocos_animation_marionette_state_machine_state__InteractiveState {
        motion: Motion | null;
        speed: number;
        /**
         * Should be float.
         */
        speedMultiplier: string;
        speedMultiplierEnabled: boolean;
        /**
         * @zh 状态进入事件绑定，此处绑定的事件会在状态机向该状态过渡时触发。
         * @en State entered event binding. The event bound here will be triggered
         * when the state machine starts to transition into this state.
         */
        transitionInEventBinding: __private._cocos_animation_marionette_event_event_binding__AnimationGraphEventBinding;
        /**
         * @zh 状态离开事件绑定，此处绑定的事件会在状态机从该状态离开时触发。
         * @en State left event binding. The event bound here will be triggered
         * when the state machine starts to transition out from this state.
         */
        transitionOutEventBinding: __private._cocos_animation_marionette_event_event_binding__AnimationGraphEventBinding;
        /**
         * // TODO: HACK
         * @internal
         */
        __callOnAfterDeserializeRecursive(): void;
        copyTo(that: MotionState): MotionState;
    }
    export class BindableNumber implements __private._cocos_animation_marionette_parametric__Bindable<number> {
        variable: string;
        value: number;
        constructor(value?: number);
        clone(): __private._cocos_animation_marionette_parametric__Bindable<number>;
    }
    export class BindableBoolean implements __private._cocos_animation_marionette_parametric__Bindable<boolean> {
        variable: string;
        value: boolean;
        constructor(value?: boolean);
        clone(): __private._cocos_animation_marionette_parametric__Bindable<boolean>;
    }
    export class AnimationMask extends Asset {
        get joints(): Iterable<__private._cocos_animation_marionette_animation_mask__JointMaskInfo>;
        set joints(value: Iterable<__private._cocos_animation_marionette_animation_mask__JointMaskInfo>);
        /**
         * @zh 添加一个关节遮罩项。
         * 已存在的相同路径的关节遮罩项会被替换为新的。
         * @en Add a joint mask item.
         * Already existing joint mask with same path item will be replaced.
         * @param path @zh 关节的路径。 @en The joint's path.
         * @param enabled @zh 是否启用该关节。 @en Whether to enable the joint.
         */
        addJoint(path: string, enabled: boolean): void;
        removeJoint(removal: string): void;
        clear(): void;
        filterDisabledNodes(root: Node): Set<Node>;
        isExcluded(path: string): boolean;
    }
    export namespace AnimationMask {
        export type JointMaskInfo = __private._cocos_animation_marionette_animation_mask__JointMaskInfo_;
    }
    export class AnimationGraphVariant extends __private._cocos_animation_marionette_animation_graph_like__AnimationGraphLike implements animation.AnimationGraphVariantRunTime {
        __brand: "AnimationGraphVariant";
        get original(): AnimationGraph | null;
        set original(value: AnimationGraph | null);
        get clipOverrides(): __private._cocos_animation_marionette_animation_graph_variant__ClipOverrideMap;
    }
    /**
     * @zh
     * 姿势图。
     * @en
     * Pose graph.
     */
    export class PoseGraph extends ___private._cocos_core_data_editor_extendable__EditorExtendable {
        constructor();
        /**
         * @zh 姿势图的输出结点。
         * @en The pose graph's output node.
         */
        get outputNode(): __private._cocos_animation_marionette_pose_graph_graph_output_node__PoseGraphOutputNode;
        /**
         * // TODO: HACK
         * @internal
         */
        __callOnAfterDeserializeRecursive(): void;
        /**
         * @zh 获取所有结点。
         * @en Gets all nodes.
         * @returns @zh 用于遍历所有结点的迭代器。 @en The iterator to iterate all nodes.
         */
        nodes(): IterableIterator<poseGraphOp.Node>;
        /**
         * @zh 添加一个结点到图中。
         * @en Adds a node into graph.
         * @param node @zh 要添加的结点。 @en Node to add.
         * @returns `node`
         *
         * @note
         * @zh 注意，要添加的结点必须是“独立”的，也就是说它不能已经在任何图中。否则会抛出异常。
         * @en Note, the node to add should be "freestanding",
         * means it should not been already in any graph. Otherwise, an exception would be thrown.
         */
        addNode<TNode extends poseGraphOp.Node>(node: TNode): TNode;
        /**
         * @zh 将指定的结点从图中移除。
         * @en Removes specified node from the graph.
         * @param removal @zh 要移除的结点。 @en The node to remove.
         *
         * @note
         * @zh 如果要移除的结点不在图中或该结点是图的输出结点，则此方法不会生效。
         * @en If the removal node is not within graph or is the output node of graph,
         * this method takes no effect.
         */
        removeNode(removal: poseGraphOp.Node): void;
        /**
         * @zh
         * 获取指定结点在姿势图中的外壳。
         * @en
         * Gets the specified node's shell in pose graph.
         * @internal
         */
        getShell(node: poseGraphOp.Node): __private._cocos_animation_marionette_pose_graph_foundation_node_shell__PoseGraphNodeShell | undefined;
    }
    export type EnterNodeInfo = {
        type: "animation-blend";
        target: AnimationBlend;
    } | {
        type: "state-machine";
        target: StateMachine;
    } | {
        type: "stash";
        stashName: string;
    };
    export abstract class Motion extends ___private._cocos_core_data_editor_extendable__EditorExtendable {
        abstract [__private._cocos_animation_marionette_create_eval__createEval](context: __private._cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext, ignoreEmbeddedPlayers: boolean): MotionEval | null;
        abstract clone(): Motion;
        /**
         * // TODO: HACK
         * @internal
         */
        __callOnAfterDeserializeRecursive(): void;
    }
    export interface MotionEval {
        /**
         * The runtime ID. Maybe invalid.
         */
        readonly runtimeId?: __private._cocos_animation_marionette_graph_debug__RuntimeID;
        /**
         * The duration of this motion. If it's a clip motion.
         * It should be $duration_{clip} / speed_{clip}$.
         */
        readonly duration: number;
        getClipStatuses(baseWeight: number): Iterator<animation.ClipStatus>;
        overrideClips(context: __private._cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext): void;
        createPort(): MotionPort;
    }
    export interface MotionPort {
        evaluate(progress: number, context: __private._cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext): ___private._cocos_animation_core_pose__Pose;
        reenter(): void;
    }
    export class ClipMotion extends Motion {
        clip: AnimationClip | null;
        [__private._cocos_animation_marionette_create_eval__createEval](context: __private._cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext, ignoreEmbeddedPlayers: boolean): __private._cocos_animation_marionette_motion_clip_motion__ClipMotionEval | null;
        clone(): ClipMotion;
    }
    export abstract class AnimationBlend extends Motion {
        name: string;
        copyTo(that: AnimationBlend): void;
    }
    export class AnimationBlend1D extends AnimationBlend {
        static Item: typeof __private._cocos_animation_marionette_motion_animation_blend_1d__AnimationBlend1DItem;
        param: BindableNumber;
        get items(): Iterable<__private._cocos_animation_marionette_motion_animation_blend_1d__AnimationBlend1DItem>;
        set items(value: Iterable<__private._cocos_animation_marionette_motion_animation_blend_1d__AnimationBlend1DItem>);
        clone(): AnimationBlend1D;
        [__private._cocos_animation_marionette_create_eval__createEval](context: __private._cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext, ignoreEmbeddedPlayers: boolean): any;
    }
    export namespace AnimationBlend1D {
        export type Item = __private._cocos_animation_marionette_motion_animation_blend_1d__AnimationBlend1DItem;
    }
    export class AnimationBlend2D extends AnimationBlend {
        static Algorithm: typeof __private._cocos_animation_marionette_motion_animation_blend_2d__Algorithm;
        static Item: typeof __private._cocos_animation_marionette_motion_animation_blend_2d__AnimationBlend2DItem;
        get algorithm(): __private._cocos_animation_marionette_motion_animation_blend_2d__Algorithm;
        set algorithm(value: __private._cocos_animation_marionette_motion_animation_blend_2d__Algorithm);
        paramX: BindableNumber;
        paramY: BindableNumber;
        get items(): Iterable<__private._cocos_animation_marionette_motion_animation_blend_2d__AnimationBlend2DItem>;
        set items(items: Iterable<__private._cocos_animation_marionette_motion_animation_blend_2d__AnimationBlend2DItem>);
        /**
         * // TODO: HACK
         * @internal
         */
        __callOnAfterDeserializeRecursive(): void;
        clone(): AnimationBlend2D;
        [__private._cocos_animation_marionette_create_eval__createEval](context: __private._cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext, ignoreEmbeddedPlayers: boolean): __private._cocos_animation_marionette_motion_animation_blend__AnimationBlendEval;
    }
    export namespace AnimationBlend2D {
        export type Algorithm = typeof __private._cocos_animation_marionette_motion_animation_blend_2d__Algorithm;
        export type Item = __private._cocos_animation_marionette_motion_animation_blend_2d__AnimationBlend2DItem;
    }
    export class AnimationBlendDirect extends AnimationBlend {
        static Item: typeof __private._cocos_animation_marionette_motion_animation_blend_direct__AnimationBlendDirectItem;
        get items(): __private._cocos_animation_marionette_motion_animation_blend_direct__AnimationBlendDirectItem[];
        set items(value: __private._cocos_animation_marionette_motion_animation_blend_direct__AnimationBlendDirectItem[]);
        clone(): AnimationBlendDirect;
        [__private._cocos_animation_marionette_create_eval__createEval](context: __private._cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext, ignoreEmbeddedPlayers: boolean): __private._cocos_animation_marionette_motion_animation_blend_direct__AnimationBlendDirectEval;
    }
    export namespace AnimationBlendDirect {
        export type Item = __private._cocos_animation_marionette_motion_animation_blend_direct__AnimationBlendDirectItem;
    }
    export namespace poseGraphOp {
        export function getInputKeys(node: Node): readonly import("../foundation/node-shell").NodeInputPath[];
        export function isValidInputKey(node: Node, key: InputKey): boolean;
        export function getInputMetadata(node: Node, key: InputKey): Readonly<InputMetadata> | undefined;
        export function getInputConstantValue(node: Node, key: InputKey): unknown;
        export function getInputBinding(graph: PoseGraph, node: Node, key: InputKey): Readonly<{
            producer: Node;
            outputIndex: number;
        }> | undefined;
        export function getInputInsertInfos(node: Node): Readonly<Record<string, {
            displayName: string;
        }>>;
        export function insertInput(graph: PoseGraph, node: Node, insertId: InputInsertId): void;
        export function deleteInput(graph: PoseGraph, node: Node, key: InputKey): void;
        export function getOutputType(node: Node, outputId: OutputKey): PoseGraphType;
        export function connectNode(graph: PoseGraph, node: Node, key: InputKey, producer: Node, outputKey?: OutputKey): void;
        export function disconnectNode(graph: PoseGraph, node: Node, key: InputKey): void;
        export function connectOutputNode(graph: PoseGraph, producer: __private._cocos_animation_marionette_pose_graph_pose_node__PoseNode): void;
        export function hasInputBinding(graph: PoseGraph, node: Node, key: InputKey, producerNode: Node, producerOutputKey: OutputKey): boolean;
        export function isWellFormedInputKey(test: unknown): test is InputKey;
        export type InputKey = __private._cocos_animation_marionette_pose_graph_foundation_node_shell__NodeInputPath;
        export type InputDisplayName = string | [
            string,
            Record<string, string | number>
        ];
        export interface InputMetadata {
            type: PoseGraphType;
            displayName?: InputDisplayName;
            deletable?: boolean;
            insertPoint?: boolean;
        }
        export type InputInsertId = string;
        export type OutputKey = number;
        /**
         * @zh
         * 姿势图中的结点类。
         * @en
         * Class of node in pose graph.
         */
        export class Node extends ___private._cocos_core_data_editor_extendable__EditorExtendable {
            /**
             * @internal Temporarily hack for deserialization callback.
             */
            __callOnAfterDeserializeRecursive?(): void;
            /**
             * @zh
             * 获取该结点的标题。
             * @en
             * Gets title of this node.
             * @returns @zh
             * - 若返回 `string`，则用该字符串作为标题。
             * - 否则，若返回 `undefined`，表示标题未定义。
             * - 否则，返回的是标题的参数化 i18n 表示。
             * @en
             * - If `string` is returned, then use the string as title.
             * - Otherwise, if `undefined` is returned, then the title is not defined.
             * - Otherwise, the returned value is the parametric representation of title.
             */
            getTitle?(): string | [
                string,
                Record<string, string>
            ] | undefined;
            /**
             * @zh
             * 获取该结点的进入信息。
             * @en
             * Gets enter info of this node.
             */
            getEnterInfo?(): EnterNodeInfo | undefined;
        }
        export enum PoseGraphType {
            FLOAT = 0,
            INTEGER = 1,
            BOOLEAN = 2,
            VEC3 = 3,
            QUAT = 4,
            POSE = 5
        }
        export const getOutputKeys: (node: Node) => readonly OutputKey[];
    }
    export function getCreatePoseGraphNodeEntries(classConstructor: ___private._editor_src_marionette_pose_graph_editor_api__Constructor<poseGraphOp.Node>, createNodeContext: PoseGraphCreateNodeContext): Iterable<PoseGraphCreateNodeEntry>;
    export function createPoseGraphNode(classConstructor: ___private._editor_src_marionette_pose_graph_editor_api__Constructor<poseGraphOp.Node>, arg: unknown): poseGraphOp.Node;
    export function getNodeAppearanceOptions(node: poseGraphOp.Node): PoseGraphNodeAppearanceOptions | undefined;
    export function getInputConventionalI18nInfo(inputKey: poseGraphOp.InputKey): [
        string,
        Record<string, string | number>?
    ];
    export function getInputDefaultDisplayName(inputKey: poseGraphOp.InputKey): string;
    export function getPoseGraphNodeInputAttrs(node: poseGraphOp.Node, inputKey: poseGraphOp.InputKey): {
        [attributeName: string]: any;
    };
    export function copyPoseGraphNodes(poseGraph: PoseGraph, nodes: poseGraphOp.Node[], options?: CopyPoseGraphNodesOptions): ___private._editor_src_marionette_pose_graph_editor_api__PoseGraphNodesCopyInfo;
    export function copyStateMachineAsPoseGraphNode(stateMachine: StateMachine): ___private._editor_src_marionette_pose_graph_editor_api__PoseGraphNodesCopyInfo;
    export function pastePoseGraphNodes(poseGraph: PoseGraph, copyInfo: ___private._editor_src_marionette_pose_graph_editor_api__PoseGraphNodesCopyInfo, options?: PastePoseGraphNodesOptions): {
        addedNodes: poseGraphOp.Node[];
    };
    /**
     * Stash specified pose graph.
     *
     * Creates a stash, then move all contents in the pose graph into the stash.
     * Then, create a "PoseNodeUseStashedPose" node to reference the newly created stash.
     *
     * @param layer The layer that the pose graph belongs to.
     * @param poseGraph The pose graph to stash.
     * @param newStashId Id of the newStash.
     * @returns The stash operation result, or undefined if error occurred.
     */
    export function stashPoseGraph(layer: Layer, poseGraph: PoseGraph, newStashId: string): StashPoseGraphResult | undefined;
    export function visitStashReferences(layer: Layer, stashId: string): Generator<StashReference>;
    export interface PoseGraphCreateNodeEntry {
        category?: string;
        subMenu?: string;
        arg: unknown;
    }
    export interface PoseGraphCreateNodeContext {
        animationGraph: AnimationGraph;
        layerIndex: number;
    }
    /**
     * @zh 描述某类型结点的编辑器外观选项。
     * @en Describes the editor appearance of a type of nodes.
     */
    export interface PoseGraphNodeAppearanceOptions {
        /**
         * @zh
         * 主题颜色。目前应为以 “#” 开头的十六进制字符串颜色表示，例如 `"#FF00FF"`。
         * @en
         * Theme color. Currently should be a color hex string starting with "#", for example: `"#FF00FF"`.
         */
        themeColor?: `#${string}`;
        /**
         * @zh
         * 为 `true` 时表示展示该类型结点时尽可能地使用“内联”样式。
         * @en
         * If `true`, indicates editor should show this type of nodes in "inline" style if possible.
         */
        inline?: boolean;
    }
    export interface CopyPoseGraphNodesOptions {
        copyOutputNodeEditorExtras?: boolean;
    }
    export interface pastePoseGraphNodesResult {
        addedNodes: poseGraphOp.Node[];
    }
    export interface PastePoseGraphNodesOptions {
        outputNodeBindingRedirect?: {
            consumerNode: __private._cocos_animation_marionette_pose_graph_pose_node__PoseNode;
            inputKey: poseGraphOp.InputKey;
        };
    }
    export interface StashPoseGraphResult {
        /**
         * Newly created stash.
         */
        stash: __private._cocos_animation_marionette_animation_graph__PoseGraphStash;
        /**
         * The `PoseNodeUseStashedPose` node added into the graph.
         */
        useStashNode: poseGraphOp.Node;
    }
    export interface StashReference {
        location: ___private._editor_src_marionette_visit_visit_pose_node__PoseNodeLocation;
        alterReference(newStashName: string): void;
    }
    /**
     * Query all asset drag handlers.
     */
    export function getPoseGraphAssetDragHandlersMap(): Generator<[
        Constructor<Asset>,
        PoseGraphAssetDragHandlersInfo
    ]>;
    export function createPoseNodeOnAssetDrag(asset: Asset, handlerId: string): poseGraphOp.Node | undefined;
    /**
     * In pose graph, describes the drag handling info for an asset type.
     */
    export type PoseGraphAssetDragHandlersInfo = {
        /**
         * All handlers handling dragging on this asset type. The key is handler id.
         */
        handlers: Record<string, {
            /**
             * The handler's display name.
             */
            displayName: string;
        }>;
    };
    export import Value = animation.Value_experimental;
    export import VariableType = animation.VariableType;
    export namespace __private {
        /**
         * This module contains utilities to marry animation clip with animation graph.
         *
         * A typical workflow is:
         *
         * At initial, an animation clip is bound to animation graph in `AnimationClipGraphBindingContext`,
         * an `AnimationClipAGEvaluation` is created after this phase to track the evaluation.
         *
         * Then at each frame, `AnimationClipAGEvaluation.evaluate()` is called,
         * passed with the current `AnimationClipGraphEvaluationContext`.
         * The evaluation context gives the pose that need to be filled,
         * then animation clip emplaces sampled animation data into the pose.
         */
        /**
         * The context in which animation clips can be bound in an animation graph.
         */
        export interface _cocos_animation_marionette_animation_graph_animation_clip_binding__AnimationClipGraphBindingContext {
            /**
             * The root node. This should be the animation controller's host node.
             */
            origin: Node;
            /**
             * Binds a scene node transform into animation graph.
             * @param path Path to the scene node from `origin`.
             * @returns The transform handle if successfully bound, `null` otherwise.
             */
            bindTransform(path: string): ___private._cocos_animation_core_animation_handle__TransformHandle | null;
            /**
             * Binds an auxiliary curve.
             * @param curveName Curve name.
             */
            bindAuxiliaryCurve(curveName: string): ___private._cocos_animation_core_animation_handle__AuxiliaryCurveHandle;
        }
        export type _cocos_animation_marionette_graph_debug__RuntimeID = number;
        /**
         * @zh
         * 表示某些姿势图结点在接受变换输入（包括整个变换或者单独的位置旋转）时，
         * 该变换所在的空间。
         * @en
         * Represents the space of input transforms(including whole transform or individual position or rotation)
         * accepted by certain pose graph nodes.
         */
        export enum _cocos_animation_marionette_pose_graph_pose_nodes_transform_space__TransformSpace {
            /**
             * @zh 表示该变换是在世界空间中描述的。
             * @en Indicates the transform is described in world space.
             */
            WORLD = 0,
            /**
             * @zh 表示该变换是在动画图所在组件（即动画控制器组件）的所属结点的本地空间中描述的。
             * @en Indicates the transform is described in local space of the node
             * to which the animation graph's belonging component(ie. the animation controller) is attached.
             */
            COMPONENT = 1,
            /**
             * @zh 表示该变换是在应用到的目标结点的父结点的本地空间中描述的。
             * @en Indicates the transform is described in local space of the applying node(bone).
             */
            PARENT = 2,
            /**
             * @zh 表示该变换是在应用到的目标结点的本地空间中描述的。
             * @en Indicates the transform is described in local space of the applying node(bone).
             */
            LOCAL = 3
        }
        export class _cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext {
            constructor(transformCount: number, metaValueCount: number, parentTable: readonly number[], componentNode: Node);
            destroy(): void;
            get allocatedPoseCount(): number;
            get parentTable(): readonly number[];
            pushDefaultedPose(): ___private._cocos_animation_core_pose__Pose;
            pushDefaultedPoseInComponentSpace(): ___private._cocos_animation_core_pose__Pose;
            pushZeroDeltaPose(): ___private._cocos_animation_core_pose__Pose;
            pushDuplicatedPose(src: ___private._cocos_animation_core_pose__Pose): ___private._cocos_animation_core_pose__Pose;
            popPose(): void;
            /**
             * @internal
             */
            get _stackSize_debugging(): number;
            /**
             * @internal
             */
            _isStackTopPose_debugging(pose: ___private._cocos_animation_core_pose__Pose): boolean;
            /** @internal */
            _poseTransformsSpaceLocalToComponent(pose: ___private._cocos_animation_core_pose__Pose): void;
            /** @internal */
            _poseTransformsSpaceComponentToLocal(pose: ___private._cocos_animation_core_pose__Pose): void;
            _convertPoseSpaceTransformToTargetSpace(transform: ___private._cocos_animation_core_transform__Transform, outTransformSpace: _cocos_animation_marionette_pose_graph_pose_nodes_transform_space__TransformSpace, pose: ___private._cocos_animation_core_pose__Pose, poseTransformIndex: number): ___private._cocos_animation_core_transform__Transform;
            _convertTransformToPoseTransformSpace(transform: ___private._cocos_animation_core_transform__Transform, transformSpace: _cocos_animation_marionette_pose_graph_pose_nodes_transform_space__TransformSpace, pose: ___private._cocos_animation_core_pose__Pose, poseTransformIndex: number): ___private._cocos_animation_core_transform__Transform;
        }
        export class _cocos_animation_marionette_animation_graph_context__AuxiliaryCurveRegistry {
            names(): IterableIterator<string>;
            has(name: string): boolean;
            get(name: string): number;
            set(name: string, value: number): void;
        }
        export class _cocos_animation_marionette_animation_graph_context__TransformHandleInternal implements ___private._cocos_animation_core_animation_handle__TransformHandle {
            __brand: ___private._cocos_animation_core_animation_handle__TransformHandle["__brand"];
            constructor(host: _cocos_animation_marionette_animation_graph_context__AnimationGraphPoseLayoutMaintainer, index: number);
            index: number;
            destroy(): void;
        }
        export class _cocos_animation_marionette_animation_graph_context__AuxiliaryCurveHandleInternal implements ___private._cocos_animation_core_animation_handle__AuxiliaryCurveHandle {
            constructor(host: _cocos_animation_marionette_animation_graph_context__AnimationGraphPoseLayoutMaintainer, index: number);
            __brand: ___private._cocos_animation_core_animation_handle__AuxiliaryCurveHandle["__brand"];
            index: number;
            destroy(): void;
        }
        export interface _cocos_animation_marionette_pose_graph_stash_runtime_stash__PoseStashAllocator {
            allocatePose(): ___private._cocos_animation_core_pose__Pose;
            destroyPose(pose: ___private._cocos_animation_core_pose__Pose): void;
        }
        export class _cocos_animation_marionette_animation_graph_context__DeferredPoseStashAllocator implements _cocos_animation_marionette_pose_graph_stash_runtime_stash__PoseStashAllocator {
            get allocatedPoseCount(): number;
            /** @internal */
            _reset(transformCount: number, auxiliaryCurveCount: number): void;
            allocatePose(): ___private._cocos_animation_core_pose__Pose;
            destroyPose(pose: ___private._cocos_animation_core_pose__Pose): void;
        }
        export class _cocos_animation_marionette_animation_graph_context__AnimationGraphPoseLayoutMaintainer {
            /**
             * @param origin This node and all nodes under this node can be bound.
             */
            constructor(origin: Node, auxiliaryCurveRegistry: _cocos_animation_marionette_animation_graph_context__AuxiliaryCurveRegistry);
            get transformCount(): number;
            get auxiliaryCurveCount(): number;
            get auxiliaryCurveRegistry(): {
                get(name: string): number;
            };
            getOrCreateTransformBinding(node: Node): _cocos_animation_marionette_animation_graph_context__TransformHandleInternal | null;
            getOrCreateAuxiliaryCurveBinding(name: string): _cocos_animation_marionette_animation_graph_context__AuxiliaryCurveHandleInternal;
            createEvaluationContext(): _cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext;
            resetPoseStashAllocator(allocator: _cocos_animation_marionette_animation_graph_context__DeferredPoseStashAllocator): void;
            createTransformFilter(mask: Readonly<AnimationMask>): ___private._cocos_animation_core_pose__TransformFilter;
            fetchDefaultTransforms(transforms: ___private._cocos_animation_core_transform_array__TransformArray): void;
            apply(pose: ___private._cocos_animation_core_pose__Pose): void;
            startBind(): void;
            endBind(): number;
        }
        export abstract class _cocos_animation_marionette_variable_basic__VarInstanceBase {
            readonly type: animation.VariableType;
            constructor(type: animation.VariableType);
            bind<T, TThis, ExtraArgs extends any[]>(fn: (this: TThis, value: T, ...args: ExtraArgs) => void, thisArg: TThis, ...args: ExtraArgs): animation.Value_experimental;
            get value(): animation.Value_experimental;
            set value(value: animation.Value_experimental);
            protected abstract getValue(): animation.Value_experimental;
            protected abstract setValue(value: animation.Value_experimental): void;
        }
        export type _cocos_animation_marionette_variable_index__VarInstance = _cocos_animation_marionette_variable_basic__VarInstanceBase;
        export type _cocos_animation_marionette_animation_graph_context__VarRegistry = Record<string, _cocos_animation_marionette_variable_index__VarInstance>;
        export type _cocos_animation_marionette_animation_graph_context__TriggerResetter = (triggerName: string) => void;
        /**
         * @zh
         * 描述了如何对动画图中引用的动画剪辑进行替换。
         * @en
         * Describes how to override animation clips in an animation graph.
         */
        export interface _cocos_animation_marionette_clip_overriding__ReadonlyClipOverrideMap {
            /**
             * @zh
             * 获取指定原始动画剪辑应替换成的动画剪辑。
             * @en
             * Gets the overriding animation clip of specified original animation clip.
             *
             * @param animationClip @zh 原始动画剪辑。@en Original animation clip.
             *
             * @returns @zh 替换的动画剪辑；如果原始动画剪辑不应被替换，则应该返回 `undefined`。 @en
             * The overriding animation clip.
             * If the original animation clip should not be overrode, `undefined` should be returned.
             */
            get(animationClip: AnimationClip): AnimationClip | undefined;
        }
        export interface _cocos_animation_marionette_animation_graph_context__EvaluationTimeAuxiliaryCurveView {
            get(curveName: string): number;
        }
        /**
         * The update context for animation graph building blocks(state machine/pose node/motion...etc).
         */
        export interface _cocos_animation_marionette_animation_graph_context__AnimationGraphUpdateContext {
            /**
             * Delta time to update.
             */
            readonly deltaTime: number;
            /**
             * Indicative weight of the updating target.
             *
             * The updating target shall not, for example, weight the result pose by this weight.
             */
            readonly indicativeWeight: number;
        }
        export interface _cocos_animation_marionette_pose_graph_stash_runtime_stash__RuntimeStash {
            reenter(): void;
            requestUpdate(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphUpdateContext): void;
            evaluate(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext): ___private._cocos_animation_core_pose__Pose | null;
        }
        export interface _cocos_animation_marionette_pose_graph_stash_runtime_stash__RuntimeStashView {
            bindStash(id: string): _cocos_animation_marionette_pose_graph_stash_runtime_stash__RuntimeStash | undefined;
        }
        export class _cocos_animation_marionette_pose_graph_motion_sync_motion_sync_info__MotionSyncInfo {
            group: string;
        }
        export interface _cocos_animation_marionette_pose_graph_motion_sync_runtime_motion_sync__RuntimeMotionSyncRecord {
            notifyRenter(normalizedTime: number): void;
            notifyUpdate(deltaTime: number, weight: number): void;
            getSyncedEnterTime(): number;
        }
        export class _cocos_animation_marionette_pose_graph_motion_sync_runtime_motion_sync__RuntimeMotionSyncManager {
            register(syncInfo: _cocos_animation_marionette_pose_graph_motion_sync_motion_sync_info__MotionSyncInfo): _cocos_animation_marionette_pose_graph_motion_sync_runtime_motion_sync__RuntimeMotionSyncRecord;
            sync(): void;
        }
        /**
         * The binding context of an animation graph.
         */
        export class _cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext {
            constructor(origin: Node, poseLayoutMaintainer: _cocos_animation_marionette_animation_graph_context__AnimationGraphPoseLayoutMaintainer, varRegistry: _cocos_animation_marionette_animation_graph_context__VarRegistry, _controller: animation.AnimationController);
            /**
             * The origin node.
             *
             * The origin node is the origin from where the animation target start to resolve.
             * It's now definitely the node hosting the running animation controller component.
             */
            get origin(): Node;
            /**
             * The animation controller component currently running the animation graph.
             */
            get controller(): animation.AnimationController;
            /**
             * A free function to reset specified trigger.
             * @internal This function should only be accessed by the builtin state machine.
             */
            get triggerResetter(): _cocos_animation_marionette_animation_graph_context__TriggerResetter;
            get clipOverrides(): _cocos_animation_marionette_clip_overriding__ReadonlyClipOverrideMap | undefined;
            /**
             * Returns if current context expects to have an additive pose.
             */
            get additive(): boolean;
            bindTransform(bone: string): ___private._cocos_animation_core_animation_handle__TransformHandle | null;
            bindTransformByName(bone: string): ___private._cocos_animation_core_animation_handle__TransformHandle | null;
            getBoneChildren(bone: string): string[];
            getParentBoneNameByName(bone: string): string | null | undefined;
            bindAuxiliaryCurve(name: string): ___private._cocos_animation_core_animation_handle__AuxiliaryCurveHandle;
            getEvaluationTimeAuxiliaryCurveView(): _cocos_animation_marionette_animation_graph_context__EvaluationTimeAuxiliaryCurveView;
            getVar(id: string): _cocos_animation_marionette_variable_index__VarInstance | undefined;
            /**
             * Pushes the `additive` flag. A later `_popAdditiveFlag` is required to pop the change.
             * @internal
             */
            _pushAdditiveFlag(additive: boolean): void;
            /**
             * Undo last `_pushAdditiveFlag`.
             * @internal
             */
            _popAdditiveFlag(): void;
            /** @internal */
            _integrityCheck(): boolean;
            get stashView(): _cocos_animation_marionette_pose_graph_stash_runtime_stash__RuntimeStashView;
            get motionSyncManager(): _cocos_animation_marionette_pose_graph_motion_sync_runtime_motion_sync__RuntimeMotionSyncManager;
            /**
             * @internal
             */
            _setLayerWideContextProperties(stashView: _cocos_animation_marionette_pose_graph_stash_runtime_stash__RuntimeStashView, motionSyncManager: _cocos_animation_marionette_pose_graph_motion_sync_runtime_motion_sync__RuntimeMotionSyncManager): void;
            /**
             * @internal
             */
            _unsetLayerWideContextProperties(): void;
            /**
             * @internal
             */
            _setClipOverrides(clipOverrides: _cocos_animation_marionette_clip_overriding__ReadonlyClipOverrideMap | undefined): void;
        }
        export interface _cocos_animation_marionette_variable_basic__VariableTypeValueTypeMap {
            [animation.VariableType.FLOAT]: number;
            [animation.VariableType.INTEGER]: number;
            [animation.VariableType.BOOLEAN]: boolean;
            [animation.VariableType.TRIGGER]: boolean;
            [animation.VariableType.VEC3_experimental]: math.Vec3;
            [animation.VariableType.QUAT_experimental]: math.Quat;
        }
        /**
         * @zh `AnimationGraph` 和 `AnimationGraphVariant` 的内部共同基类，
         * 仅用于特殊目的，不应另作它用，也不应导出为公开接口。
         * @en The common base class of `AnimationGraph` and `AnimationGraphVariant`
         * which exists for special purpose and should not be used otherwise and should not be exported.
         *
         * @internal This class serves as the editor switch of
         * animation graph asset and animation graph variant asset,
         * especially as the `graph` property on animation controller component.
         */
        export abstract class _cocos_animation_marionette_animation_graph_like__AnimationGraphLike extends Asset {
        }
        export const _cocos_animation_marionette_ownership__ownerSymbol: unique symbol;
        export interface _cocos_animation_marionette_ownership__OwnedBy<T> {
            [_cocos_animation_marionette_ownership__ownerSymbol]: T | undefined;
        }
        export class _cocos_animation_marionette_animation_graph__Transition extends ___private._cocos_core_data_editor_extendable__EditorExtendable implements _cocos_animation_marionette_ownership__OwnedBy<StateMachine>, _cocos_animation_marionette_animation_graph__Transition {
            [_cocos_animation_marionette_ownership__ownerSymbol]: StateMachine | undefined;
            /**
             * The transition source.
             */
            from: State;
            /**
             * The transition target.
             */
            to: State;
            /**
             * The transition condition.
             */
            conditions: Condition[];
            constructor(from: State, to: State, conditions?: Condition[]);
            copyTo(that: _cocos_animation_marionette_animation_graph__Transition): void;
            [_cocos_animation_marionette_ownership__ownerSymbol]: StateMachine | undefined;
        }
        /**
         * @zh 描述动画图中的事件绑定。
         * @en Describes the event bindings in animation graph.
         */
        export class _cocos_animation_marionette_event_event_binding__AnimationGraphEventBinding {
            /**
             * @zh 绑定的方法名。
             * @en The event name bound.
             */
            methodName: string;
            /**
             * @zh 获取该绑定是否绑定了任何事件。
             * @en Tells if there's any event bound to this binding.
             */
            get isBound(): boolean;
            emit(origin: Node): void;
            copyTo(that: _cocos_animation_marionette_event_event_binding__AnimationGraphEventBinding): _cocos_animation_marionette_event_event_binding__AnimationGraphEventBinding;
        }
        export class _cocos_animation_marionette_animation_graph__ProceduralPoseState extends State {
            graph: PoseGraph;
            /**
             * @zh 状态进入事件绑定，此处绑定的事件会在状态机向该状态过渡时触发。
             * @en State entered event binding. The event bound here will be triggered
             * when the state machine starts to transition into this state.
             */
            transitionInEventBinding: _cocos_animation_marionette_event_event_binding__AnimationGraphEventBinding;
            /**
             * @zh 状态离开事件绑定，此处绑定的事件会在状态机从该状态离开时触发。
             * @en State left event binding. The event bound here will be triggered
             * when the state machine starts to transition out from this state.
             */
            transitionOutEventBinding: _cocos_animation_marionette_event_event_binding__AnimationGraphEventBinding;
            /**
             * // TODO: HACK
             * @internal
             */
            __callOnAfterDeserializeRecursive(): void;
            copyTo(that: MotionState): _cocos_animation_marionette_animation_graph__ProceduralPoseState;
        }
        export class _cocos_animation_marionette_animation_graph__DurationalTransition extends _cocos_animation_marionette_animation_graph__Transition {
            /**
             * @en The start time of (final) destination motion state when this transition starts.
             * Its unit is seconds if `relativeDestinationStart` is `false`,
             * Otherwise, its unit is the duration of destination motion state.
             * @zh 此过渡开始时，（最终）目标动作状态的起始时间。
             * 如果 `relativeDestinationStart`为 `false`，其单位是秒，否则其单位是目标动作状态的周期。
             */
            destinationStart: number;
            /**
             * @en Determines the unit of destination start time. See `destinationStart`.
             * @zh 决定了目标起始时间的单位。见 `destinationStart`。
             */
            relativeDestinationStart: boolean;
            /**
             * @zh 过渡开始事件绑定，此处绑定的事件会在过渡开始时触发。
             * @en Transition start event binding. The event bound here will be triggered on the transition starts.
             */
            startEventBinding: _cocos_animation_marionette_event_event_binding__AnimationGraphEventBinding;
            /**
             * @zh 过渡结束事件绑定，此处绑定的事件会在过渡结束时触发。
             * @en Transition end event binding. The event bound here will be triggered on the transition ends.
             */
            endEventBinding: _cocos_animation_marionette_event_event_binding__AnimationGraphEventBinding;
            copyTo(that: _cocos_animation_marionette_animation_graph__DurationalTransition): void;
            [_cocos_animation_marionette_ownership__ownerSymbol]: StateMachine | undefined;
        }
        export class _cocos_animation_marionette_animation_graph__ProceduralPoseTransition extends _cocos_animation_marionette_animation_graph__DurationalTransition {
            /**
             * The transition duration, in seconds.
             */
            duration: number;
            copyTo(that: _cocos_animation_marionette_animation_graph__ProceduralPoseTransition): void;
        }
        export type _cocos_animation_marionette_state_machine_state__StateMachineComponentConstructor<T extends animation.StateMachineComponent> = ___private._types_globals__Constructor<T>;
        export class _cocos_animation_marionette_state_machine_state__InteractiveState extends State {
            get components(): Iterable<animation.StateMachineComponent>;
            addComponent<T extends animation.StateMachineComponent>(constructor: _cocos_animation_marionette_state_machine_state__StateMachineComponentConstructor<T>): T;
            removeComponent(component: animation.StateMachineComponent): void;
            instantiateComponents(): animation.StateMachineComponent[];
            copyTo(that: _cocos_animation_marionette_state_machine_state__InteractiveState): void;
        }
        export class _cocos_animation_marionette_animation_graph__AnimationTransition extends _cocos_animation_marionette_animation_graph__DurationalTransition {
            /**
             * The transition duration.
             * The unit of the duration is the real duration of transition source
             * if `relativeDuration` is `true` or seconds otherwise.
             */
            duration: number;
            /**
             * Determines the unit of transition duration. See `duration`.
             */
            relativeDuration: boolean;
            exitConditionEnabled: boolean;
            get exitCondition(): number;
            set exitCondition(value: number);
            copyTo(that: _cocos_animation_marionette_animation_graph__AnimationTransition): void;
        }
        export class _cocos_animation_marionette_animation_graph__PoseGraphStash extends ___private._cocos_core_data_editor_extendable__EditorExtendable {
            graph: PoseGraph;
        }
        export const _cocos_animation_marionette_state_machine_state__outgoingsSymbol: unique symbol;
        export type _cocos_animation_marionette_animation_graph__TransitionInternal = _cocos_animation_marionette_animation_graph__Transition;
        export const _cocos_animation_marionette_state_machine_state__incomingsSymbol: unique symbol;
        /**
         * @zh 二元条件操作符。
         * @en Operator used in binary condition.
         */
        export enum _cocos_animation_marionette_state_machine_condition_binary_condition__BinaryOperator {
            EQUAL_TO = 0,
            NOT_EQUAL_TO = 1,
            LESS_THAN = 2,
            LESS_THAN_OR_EQUAL_TO = 3,
            GREATER_THAN = 4,
            GREATER_THAN_OR_EQUAL_TO = 5
        }
        export type _cocos_animation_marionette_state_machine_condition_binary_condition__LhsBinding = TCBinding<TCBindingValueType.FLOAT | TCBindingValueType.INTEGER>;
        export const _cocos_animation_marionette_create_eval__createEval: unique symbol;
        export type _cocos_animation_marionette_state_machine_condition_condition_base__ConditionBindingContext = _cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext;
        /**
         * Describes the context under which a transition condition evaluates.
         */
        export interface _cocos_animation_marionette_state_machine_condition_condition_base__ConditionEvaluationContext {
            /**
             * Weight of current transition's source state.
             */
            readonly sourceStateWeight: number;
            /**
             * The elapsed normalized time of motions in source state.
             */
            readonly sourceStateMotionTimeNormalized: number;
        }
        export interface _cocos_animation_marionette_state_machine_condition_binding_binding__TCBindingValueTypeMap {
            [TCBindingValueType.FLOAT]: number;
            [TCBindingValueType.INTEGER]: number;
        }
        /**
         * @zh 过渡条件中的值绑定的求值。
         * @en The evaluation of a float binding in transition condition.
         */
        export interface _cocos_animation_marionette_state_machine_condition_binding_binding__TCBindingEvaluation<TValueType extends TCBindingValueType> {
            evaluate(context: _cocos_animation_marionette_state_machine_condition_condition_base__ConditionEvaluationContext): _cocos_animation_marionette_state_machine_condition_binding_binding__TCBindingValueTypeMap[TValueType];
        }
        export type _cocos_animation_marionette_state_machine_condition_binary_condition__lhsBindingEvaluation = _cocos_animation_marionette_state_machine_condition_binding_binding__TCBindingEvaluation<TCBindingValueType.FLOAT | TCBindingValueType.INTEGER>;
        export interface _cocos_animation_marionette_state_machine_condition_condition_base__ConditionEval {
            /**
             * Evaluates this condition.
             */
            eval(context: _cocos_animation_marionette_state_machine_condition_condition_base__ConditionEvaluationContext): boolean;
        }
        export class _cocos_animation_marionette_state_machine_condition_binary_condition__BinaryConditionEval implements _cocos_animation_marionette_state_machine_condition_condition_base__ConditionEval {
            constructor(_operator: _cocos_animation_marionette_state_machine_condition_binary_condition__BinaryOperator, lhsValue: number, rhsValue: number, _lhsBindingEvaluation: _cocos_animation_marionette_state_machine_condition_binary_condition__lhsBindingEvaluation | undefined);
            /**
             * Evaluates this condition.
             */
            eval(context: _cocos_animation_marionette_state_machine_condition_condition_base__ConditionEvaluationContext): boolean;
        }
        export enum _cocos_animation_marionette_state_machine_condition_unary_condition__UnaryOperator {
            TRUTHY = 0,
            FALSY = 1
        }
        export class _cocos_animation_marionette_state_machine_condition_unary_condition__UnaryConditionEval implements _cocos_animation_marionette_state_machine_condition_condition_base__ConditionEval {
            constructor(operator: _cocos_animation_marionette_state_machine_condition_unary_condition__UnaryOperator, operand: boolean);
            reset(value: boolean): void;
            setOperand(value: boolean): void;
            /**
             * Evaluates this condition.
             */
            eval(): boolean;
        }
        export type _cocos_animation_marionette_variable_primitive_variable__PlainVariableType = animation.VariableType.FLOAT | animation.VariableType.INTEGER | animation.VariableType.BOOLEAN;
        export const _cocos_animation_marionette_variable_basic__createInstanceTag: unique symbol;
        export class _cocos_animation_marionette_variable_primitive_variable__VarInstancePrimitive extends _cocos_animation_marionette_variable_basic__VarInstanceBase {
            constructor(type: animation.VariableType, value: animation.Value_experimental);
            protected getValue(): animation.Value_experimental;
            protected setValue(value: animation.Value_experimental): void;
        }
        export class _cocos_animation_marionette_variable_primitive_variable__PlainVariable {
            constructor(type?: _cocos_animation_marionette_variable_primitive_variable__PlainVariableType);
            get type(): _cocos_animation_marionette_variable_primitive_variable__PlainVariableType;
            get value(): animation.Value_experimental;
            set value(value: animation.Value_experimental);
            [_cocos_animation_marionette_variable_basic__createInstanceTag](): _cocos_animation_marionette_variable_primitive_variable__VarInstancePrimitive;
        }
        export class _cocos_animation_marionette_variable_vec3_variable__VarInstanceVec3 extends _cocos_animation_marionette_variable_basic__VarInstanceBase {
            constructor(value: Readonly<math.Vec3>);
            protected getValue(): animation.Value_experimental;
            protected setValue(value: animation.Value_experimental): void;
        }
        export interface _cocos_animation_marionette_variable_basic__BasicVariableDescription<TType> {
            readonly type: TType;
            value: TType extends keyof _cocos_animation_marionette_variable_basic__VariableTypeValueTypeMap ? _cocos_animation_marionette_variable_basic__VariableTypeValueTypeMap[TType] : never;
            /**
             * @internal
             */
            [_cocos_animation_marionette_variable_basic__createInstanceTag](): _cocos_animation_marionette_variable_basic__VarInstanceBase;
        }
        export class _cocos_animation_marionette_variable_vec3_variable__Vec3Variable implements _cocos_animation_marionette_variable_basic__BasicVariableDescription<animation.VariableType.VEC3_experimental> {
            get type(): animation.VariableType.VEC3_experimental;
            get value(): Readonly<math.Vec3>;
            set value(value: Readonly<math.Vec3>);
            [_cocos_animation_marionette_variable_basic__createInstanceTag](): _cocos_animation_marionette_variable_vec3_variable__VarInstanceVec3;
        }
        export class _cocos_animation_marionette_variable_quat_variable__VarInstanceQuat extends _cocos_animation_marionette_variable_basic__VarInstanceBase {
            constructor(value: Readonly<math.Quat>);
            protected getValue(): animation.Value_experimental;
            protected setValue(value: animation.Value_experimental): void;
        }
        export class _cocos_animation_marionette_variable_quat_variable__QuatVariable implements _cocos_animation_marionette_variable_basic__BasicVariableDescription<animation.VariableType.QUAT_experimental> {
            get type(): animation.VariableType.QUAT_experimental;
            get value(): Readonly<math.Quat>;
            set value(value: Readonly<math.Quat>);
            [_cocos_animation_marionette_variable_basic__createInstanceTag](): _cocos_animation_marionette_variable_quat_variable__VarInstanceQuat;
        }
        export class _cocos_animation_marionette_variable_trigger_variable__VarInstanceTrigger extends _cocos_animation_marionette_variable_basic__VarInstanceBase {
            readonly resetMode: TriggerResetMode;
            constructor(value: animation.Value_experimental, resetMode: TriggerResetMode);
            protected getValue(): animation.Value_experimental;
            protected setValue(value: animation.Value_experimental): void;
        }
        export class _cocos_animation_marionette_variable_trigger_variable__TriggerVariable implements _cocos_animation_marionette_variable_basic__BasicVariableDescription<animation.VariableType.TRIGGER> {
            get type(): animation.VariableType.TRIGGER;
            get value(): boolean;
            set value(value: boolean);
            get resetMode(): TriggerResetMode;
            set resetMode(value: TriggerResetMode);
            [_cocos_animation_marionette_variable_basic__createInstanceTag](): _cocos_animation_marionette_variable_trigger_variable__VarInstanceTrigger;
        }
        export interface _cocos_animation_marionette_parametric__Bindable<TValue> {
            value: TValue;
            variable: string;
            clone(): _cocos_animation_marionette_parametric__Bindable<TValue>;
        }
        export interface _cocos_animation_marionette_animation_mask__JointMaskInfo {
            readonly path: string;
            enabled: boolean;
        }
        export type _cocos_animation_marionette_animation_mask__JointMaskInfo_ = _cocos_animation_marionette_animation_mask__JointMaskInfo;
        export class _cocos_animation_marionette_animation_graph_variant__ClipOverrideEntry {
            original: AnimationClip;
            substitution: AnimationClip;
        }
        export class _cocos_animation_marionette_animation_graph_variant__ClipOverrideMap implements _cocos_animation_marionette_clip_overriding__ReadonlyClipOverrideMap {
            get size(): number;
            [Symbol.iterator](): IterableIterator<_cocos_animation_marionette_animation_graph_variant__ClipOverrideEntry>;
            has(original: AnimationClip): boolean;
            get(original: AnimationClip): AnimationClip | undefined;
            set(original: AnimationClip, substitution: AnimationClip): void;
            delete(original: AnimationClip): void;
            clear(): void;
        }
        /**
         * The settle context for animation graph building blocks(state machine/pose node/motion...etc).
         */
        export class _cocos_animation_marionette_animation_graph_context__AnimationGraphSettleContext {
            constructor(_layoutMaintainer: _cocos_animation_marionette_animation_graph_context__AnimationGraphPoseLayoutMaintainer);
            /**
             * Gets the number of transforms in pose.
             */
            get transformCount(): number;
            /**
             * Creates a transform filter expressing specified animation mask effect.
             * @param mask Animation mask.
             * @returns Result transform filter.
             */
            createTransformFilter(mask: Readonly<AnimationMask>): ___private._cocos_animation_core_pose__TransformFilter;
        }
        export enum _cocos_animation_marionette_pose_graph_pose_node__PoseTransformSpaceRequirement {
            NO = 0,
            LOCAL = 1,
            COMPONENT = 2
        }
        export interface _cocos_animation_marionette_pose_graph_instantiation__PoseNodeDependencyEvaluation {
            evaluate(): void;
        }
        /**
         * Base class of all pose nodes.
         *
         * Pose nodes are nodes in pose graph that yields pose objects.
         */
        export abstract class _cocos_animation_marionette_pose_graph_pose_node__PoseNode extends poseGraphOp.Node {
            /**
             * Starts the bind stage on this pose node.
             *
             * @param context The bind context.
             *
             * @note Subclasses shall implement this method to perform some preparing works
             * and invoke this method on dependant pose nodes.
             */
            abstract bind(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext): void;
            /**
             * Starts the settle stage on this pose node.
             *
             * @param context The settle context.
             *
             * @note Subclasses shall implement this method to perform some post-binding works
             * and invoke this method on dependant pose nodes.
             *
             */
            abstract settle(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphSettleContext): void;
            /**
             * Reenter this pose nodes.
             *
             * @note Subclasses shall implement this method to perform some state resetting works.
             * and invoke this method on dependant pose nodes.
             *
             * This method would be fired if other pose nodes that depends on this pose node requests a "reset".
             * For example, if this pose node is as a node of a pose state.
             * When this state is activated, this method is invoked.
             */
            abstract reenter(): void;
            /**
             * Perform the update stage on this pose node.
             * This method will directly forward to call `this.doUpdate`.
             *
             * @param context The update context.
             *
             * @note Subclasses shall not override this method and should override `doUpdate` instead.
             */
            update(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphUpdateContext): void;
            /**
             * Evaluates this pose node.
             * This method will directly forward to call `this.doEvaluate`.
             *
             * @param context The evaluation context.
             *
             * @note Subclasses shall not override this method and should override `doEvaluate` instead.
             */
            evaluate(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext, poseTransformSpaceRequirement: _cocos_animation_marionette_pose_graph_pose_node__PoseTransformSpaceRequirement): ___private._cocos_animation_core_pose__Pose;
            static evaluateDefaultPose(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext, poseTransformSpaceRequirement: _cocos_animation_marionette_pose_graph_pose_node__PoseTransformSpaceRequirement): ___private._cocos_animation_core_pose__Pose;
            /** @internal */
            _setDependencyEvaluation(dependency: _cocos_animation_marionette_pose_graph_instantiation__PoseNodeDependencyEvaluation): void;
            /**
             * Implement this method to performs the update stage on this pose node.
             *
             * @param context The update context.
             *
             * @note Subclasses shall implement this method to perform some updating works.
             * and invoke `this.update` on dependant pose nodes.
             */
            protected abstract doUpdate(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphUpdateContext): void;
            /**
             * Implement this method to evaluate this pose node.
             *
             * @param context The evaluation context.
             *
             * @returns The result pose.
             */
            protected abstract doEvaluate(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext): ___private._cocos_animation_core_pose__Pose;
            /**
             * TODO: some nodes access dependencies in reenter(). See: cocos/cocos-engine#15305
             */
            protected _forceEvaluateEvaluation(): void;
        }
        export class _cocos_animation_marionette_pose_graph_graph_output_node__PoseGraphOutputNode extends poseGraphOp.Node {
            pose: _cocos_animation_marionette_pose_graph_pose_node__PoseNode | null;
        }
        /**
         * @zh
         * 描述姿势图结点上的某项输入的路径。
         * @en
         * Describes the path to a input of a pose graph node.
         *
         * @internal Internally, the path is stored as an tuple.
         * The first element of tuple is always the input's property key.
         * There can be an optional second tuple element,
         * which represents the input's property's element, if it's an array property.
         */
        export type _cocos_animation_marionette_pose_graph_foundation_node_shell__NodeInputPath = readonly [
            string
        ] | readonly [
            string,
            number
        ];
        /**
         * @zh 描述既定结点（作为消费方）和另一结点（作为生产方）之间的绑定信息。
         * @en Describes the binding information between a given node(as consumer) and another node(as producer).
         */
        export class _cocos_animation_marionette_pose_graph_foundation_node_shell__PoseGraphNodeInputBinding {
            constructor(inputPath: _cocos_animation_marionette_pose_graph_foundation_node_shell__NodeInputPath, producer: poseGraphOp.Node, outputIndex?: number);
            /**
             * @zh 消费方结点的输入路径。
             * @en Input path of consumer node.
             */
            get inputPath(): _cocos_animation_marionette_pose_graph_foundation_node_shell__NodeInputPath;
            /**
             * @zh 生产方结点。
             * @en The producer node.
             */
            get producer(): poseGraphOp.Node;
            /**
             * @zh 生产方结点的输出索引。
             * @en The producer node's output index.
             */
            get outputIndex(): number;
        }
        /**
         * @zh 表示姿势图结点的外壳。
         *
         * 结点外壳是附着在结点上的、对结点之间的连接（称之为绑定）的描述。
         * 外壳由姿势图以及绑定系统操纵，结点对于其外壳是无感知的。
         *
         * @en Represents the shell of a pose graph node.
         *
         * The node shell is attached to a node,
         * and describes the connections(so called binding) between nodes.
         * Shells are manipulated by pose graph and binding system.
         * Nodes are imperceptible to their shells.
         */
        export class _cocos_animation_marionette_pose_graph_foundation_node_shell__PoseGraphNodeShell extends ___private._cocos_core_data_editor_extendable__EditorExtendable {
            /**
             * @zh
             * 获取此结点上的所有的绑定。
             * @en
             * Gets all bindings on this node.
             * @returns @zh 绑定对象数组。 @en The binding objects array.
             */
            getBindings(): _cocos_animation_marionette_pose_graph_foundation_node_shell__PoseGraphNodeInputBinding[];
            /**
             * @zh
             * 添加一项绑定。
             * @en
             * Adds a binding.
             * @param inputPath @zh 要绑定的输入的路径。 @en Path of the input to bind.
             * @param producer @zh 生产方结点。 @en The producer node.
             * @param outputIndex @zh 要绑定的生产方的输出索引。 @en Index of the output to bind.
             * @note
             * @zh 绑定是由三元组输入路径、生产方结点和生产方索引唯一键定的。重复的添加相同绑定没有效果。
             * @en A binding is keyed by the 3-element tuple: input path, producer node and producer output index.
             * Redundantly adding a binding takes no effect.
             */
            addBinding(inputPath: _cocos_animation_marionette_pose_graph_foundation_node_shell__NodeInputPath, producer: poseGraphOp.Node, outputIndex: number): void;
            /**
             * @zh
             * 删除指定输入上的绑定。
             * @en
             * Deletes the binding on specified input.
             * @param inputPath @zh 要解绑的输入的路径。 @en Path of the input to unbind.
             */
            deleteBinding(inputPath: _cocos_animation_marionette_pose_graph_foundation_node_shell__NodeInputPath): void;
            /**
             * @zh
             * 更新绑定，
             * 对于具有相同属性键的、索引小于（或大于） `firstIndex` 的输入的绑定，
             * 将它们替换为上一个（或下一个）索引上的绑定。
             * @en
             * Update bindings so that
             * for the input bindings having specified property key but having element index less than the specified index,
             * substitute them as previous(or next) index's binding.
             * @param propertyKey @zh 输入的属性键。 @en The input's property key.
             * @param firstIndex @zh 见描述。 @en See description.
             * @param forward @en 替换的方向。`true` 表示向前替换，反之向后。
             *              @en Substitution direction. `true` means substitute in forward, backward otherwise.
             */
            moveArrayElementBindingForward(propertyKey: string, firstIndex: number, forward: boolean): void;
            /**
             * @zh
             * 删除绑定到指定生产方结点的所有绑定。
             * @en
             * Deletes all the bindings bound to specified producer.
             * @param producer @zh 生产方结点。 @en The producer node.
             */
            deleteBindingTo(producer: poseGraphOp.Node): void;
            /**
             * @zh
             * 查找指定输入上的绑定。
             * @en
             * Finds the binding on specified input.
             * @param inputPath @zh 要查找的输入的路径。 @en Path of the input to find.
             */
            findBinding(inputPath: _cocos_animation_marionette_pose_graph_foundation_node_shell__NodeInputPath): _cocos_animation_marionette_pose_graph_foundation_node_shell__PoseGraphNodeInputBinding | undefined;
        }
        export const _cocos_animation_marionette_motion_clip_motion__evaluatePortTag: unique symbol;
        export class _cocos_animation_marionette_motion_clip_motion__ClipMotionEval implements MotionEval {
            /**
             * @internal
             */
            __DEBUG__ID__?: string;
            runtimeId?: number;
            constructor(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext, clip: AnimationClip, ignoreEmbeddedPlayers: boolean);
            get duration(): number;
            createPort(): MotionPort;
            getClipStatuses(baseWeight: number): Iterator<animation.ClipStatus>;
            [_cocos_animation_marionette_motion_clip_motion__evaluatePortTag](progress: number, context: _cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext): ___private._cocos_animation_core_pose__Pose;
            overrideClips(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext): void;
            reenter(): void;
        }
        export class _cocos_animation_marionette_motion_animation_blend__AnimationBlendItem {
            motion: Motion | null;
            clone(): _cocos_animation_marionette_motion_animation_blend__AnimationBlendItem;
            protected _copyTo(that: _cocos_animation_marionette_motion_animation_blend__AnimationBlendItem): _cocos_animation_marionette_motion_animation_blend__AnimationBlendItem;
        }
        export class _cocos_animation_marionette_motion_animation_blend_1d__AnimationBlend1DItem extends _cocos_animation_marionette_motion_animation_blend__AnimationBlendItem {
            threshold: number;
            clone(): _cocos_animation_marionette_motion_animation_blend_1d__AnimationBlend1DItem;
            protected _copyTo(that: _cocos_animation_marionette_motion_animation_blend_1d__AnimationBlend1DItem): _cocos_animation_marionette_motion_animation_blend_1d__AnimationBlend1DItem;
        }
        export enum _cocos_animation_marionette_motion_animation_blend_2d__Algorithm {
            SIMPLE_DIRECTIONAL = 0,
            FREEFORM_CARTESIAN = 1,
            FREEFORM_DIRECTIONAL = 2
        }
        export class _cocos_animation_marionette_motion_animation_blend_2d__AnimationBlend2DItem extends _cocos_animation_marionette_motion_animation_blend__AnimationBlendItem {
            threshold: math.Vec2;
            clone(): _cocos_animation_marionette_motion_animation_blend_2d__AnimationBlend2DItem;
            protected _copyTo(that: _cocos_animation_marionette_motion_animation_blend_2d__AnimationBlend2DItem): _cocos_animation_marionette_motion_animation_blend_2d__AnimationBlend2DItem;
        }
        export class _cocos_animation_marionette_motion_animation_blend__AnimationBlendPort implements MotionPort {
            constructor(host: _cocos_animation_marionette_motion_animation_blend__AnimationBlendEval, childPorts: readonly (MotionPort | null)[]);
            childPorts: readonly (MotionPort | null)[];
            evaluate(progress: number, context: _cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext): ___private._cocos_animation_core_pose__Pose;
            reenter(): void;
        }
        export abstract class _cocos_animation_marionette_motion_animation_blend__AnimationBlendEval implements MotionEval {
            runtimeId?: number;
            constructor(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext, ignoreEmbeddedPlayers: boolean, base: AnimationBlend, children: _cocos_animation_marionette_motion_animation_blend__AnimationBlendItem[], inputs: number[]);
            createPort(): MotionPort;
            get childCount(): number;
            getChildWeight(childIndex: number): number;
            getChildMotionEval(childIndex: number): MotionEval | null;
            get duration(): number;
            getClipStatuses(baseWeight: number): Iterator<animation.ClipStatus, any, undefined>;
            __evaluatePort(port: _cocos_animation_marionette_motion_animation_blend__AnimationBlendPort, progress: number, context: _cocos_animation_marionette_animation_graph_context__AnimationGraphEvaluationContext): ___private._cocos_animation_core_pose__Pose;
            overrideClips(context: _cocos_animation_marionette_animation_graph_context__AnimationGraphBindingContext): void;
            setInput(value: number, index: number): void;
            protected doEval(): void;
            protected abstract eval(_weights: number[], _inputs: readonly number[]): void;
        }
        export class _cocos_animation_marionette_motion_animation_blend_direct__AnimationBlendDirectItem extends _cocos_animation_marionette_motion_animation_blend__AnimationBlendItem {
            weight: BindableNumber;
            clone(): _cocos_animation_marionette_motion_animation_blend_direct__AnimationBlendDirectItem;
            protected _copyTo(that: _cocos_animation_marionette_motion_animation_blend_direct__AnimationBlendDirectItem): _cocos_animation_marionette_motion_animation_blend_direct__AnimationBlendDirectItem;
        }
        export class _cocos_animation_marionette_motion_animation_blend_direct__AnimationBlendDirectEval extends _cocos_animation_marionette_motion_animation_blend__AnimationBlendEval {
            constructor(...args: ConstructorParameters<typeof _cocos_animation_marionette_motion_animation_blend__AnimationBlendEval>);
            protected eval(weights: number[], inputs: readonly number[]): void;
        }
    }
    import { math, animation, Node, __private as ___private, AnimationClip, Asset, Constructor } from "cc";
    import { VariableDescription as _VariableDescription, Motion as _Motion, __private as ____private, poseGraphOp as _poseGraphOp, PoseGraph as _PoseGraph } from "cc/editor/new-gen-anim";
    export {};
}
declare module "cc/editor/offline-mappings" {
    export const effectStructure: {
        $techniques: {
            $passes: {
                depthStencilState: {};
                rasterizerState: {};
                blendState: {
                    targets: {}[];
                };
                properties: {
                    any: {
                        sampler: {};
                        editor: {};
                    };
                };
                migrations: {
                    properties: {
                        any: {};
                    };
                    macros: {
                        any: {};
                    };
                };
                embeddedMacros: {};
            }[];
        }[];
    };
    export const isSampler: (type: any) => boolean;
    export const typeMap: Record<string, gfx.Type | string>;
    export const formatMap: {
        bool: gfx.Format;
        bvec2: gfx.Format;
        bvec3: gfx.Format;
        bvec4: gfx.Format;
        int: gfx.Format;
        ivec2: gfx.Format;
        ivec3: gfx.Format;
        ivec4: gfx.Format;
        uint: gfx.Format;
        uvec2: gfx.Format;
        uvec3: gfx.Format;
        uvec4: gfx.Format;
        float: gfx.Format;
        vec2: gfx.Format;
        vec3: gfx.Format;
        vec4: gfx.Format;
        int8_t: gfx.Format;
        i8vec2: gfx.Format;
        i8vec3: gfx.Format;
        i8vec4: gfx.Format;
        uint8_t: gfx.Format;
        u8vec2: gfx.Format;
        u8vec3: gfx.Format;
        u8vec4: gfx.Format;
        int16_t: gfx.Format;
        i16vec2: gfx.Format;
        i16vec3: gfx.Format;
        i16vec4: gfx.Format;
        uint16_t: gfx.Format;
        u16vec2: gfx.Format;
        u16vec3: gfx.Format;
        u16vec4: gfx.Format;
        float16_t: gfx.Format;
        f16vec2: gfx.Format;
        f16vec3: gfx.Format;
        f16vec4: gfx.Format;
        mat2: gfx.Format;
        mat3: gfx.Format;
        mat4: gfx.Format;
        mat2x2: gfx.Format;
        mat3x3: gfx.Format;
        mat4x4: gfx.Format;
        mat2x3: gfx.Format;
        mat2x4: gfx.Format;
        mat3x2: gfx.Format;
        mat3x4: gfx.Format;
        mat4x2: gfx.Format;
        mat4x3: gfx.Format;
    };
    export const getFormat: (name: string) => any;
    export const getShaderStage: (name: string) => any;
    export const getDescriptorType: (name: string) => any;
    export const isNormalized: (format: string) => boolean;
    export const isPaddedMatrix: (type: any) => boolean;
    export const getMemoryAccessFlag: (access: string) => gfx.MemoryAccessBit;
    export const passParams: {
        NONE: gfx.ColorMask;
        R: gfx.ColorMask;
        G: gfx.ColorMask;
        B: gfx.ColorMask;
        A: gfx.ColorMask;
        RG: number;
        RB: number;
        RA: number;
        GB: number;
        GA: number;
        BA: number;
        RGB: number;
        RGA: number;
        RBA: number;
        GBA: number;
        ALL: gfx.ColorMask;
        ADD: gfx.BlendOp;
        SUB: gfx.BlendOp;
        REV_SUB: gfx.BlendOp;
        MIN: gfx.BlendOp;
        MAX: gfx.BlendOp;
        ZERO: gfx.BlendFactor;
        ONE: gfx.BlendFactor;
        SRC_ALPHA: gfx.BlendFactor;
        DST_ALPHA: gfx.BlendFactor;
        ONE_MINUS_SRC_ALPHA: gfx.BlendFactor;
        ONE_MINUS_DST_ALPHA: gfx.BlendFactor;
        SRC_COLOR: gfx.BlendFactor;
        DST_COLOR: gfx.BlendFactor;
        ONE_MINUS_SRC_COLOR: gfx.BlendFactor;
        ONE_MINUS_DST_COLOR: gfx.BlendFactor;
        SRC_ALPHA_SATURATE: gfx.BlendFactor;
        CONSTANT_COLOR: gfx.BlendFactor;
        ONE_MINUS_CONSTANT_COLOR: gfx.BlendFactor;
        CONSTANT_ALPHA: gfx.BlendFactor;
        ONE_MINUS_CONSTANT_ALPHA: gfx.BlendFactor;
        KEEP: gfx.StencilOp;
        REPLACE: gfx.StencilOp;
        INCR: gfx.StencilOp;
        DECR: gfx.StencilOp;
        INVERT: gfx.StencilOp;
        INCR_WRAP: gfx.StencilOp;
        DECR_WRAP: gfx.StencilOp;
        NEVER: gfx.ComparisonFunc;
        LESS: gfx.ComparisonFunc;
        EQUAL: gfx.ComparisonFunc;
        LESS_EQUAL: gfx.ComparisonFunc;
        GREATER: gfx.ComparisonFunc;
        NOT_EQUAL: gfx.ComparisonFunc;
        GREATER_EQUAL: gfx.ComparisonFunc;
        ALWAYS: gfx.ComparisonFunc;
        FRONT: gfx.CullMode;
        BACK: gfx.CullMode;
        GOURAND: gfx.ShadeModel;
        FLAT: gfx.ShadeModel;
        FILL: gfx.PolygonMode;
        LINE: gfx.PolygonMode;
        POINT: gfx.PolygonMode;
        POINT_LIST: gfx.PrimitiveMode;
        LINE_LIST: gfx.PrimitiveMode;
        LINE_STRIP: gfx.PrimitiveMode;
        LINE_LOOP: gfx.PrimitiveMode;
        TRIANGLE_LIST: gfx.PrimitiveMode;
        TRIANGLE_STRIP: gfx.PrimitiveMode;
        TRIANGLE_FAN: gfx.PrimitiveMode;
        LINE_LIST_ADJACENCY: gfx.PrimitiveMode;
        LINE_STRIP_ADJACENCY: gfx.PrimitiveMode;
        TRIANGLE_LIST_ADJACENCY: gfx.PrimitiveMode;
        TRIANGLE_STRIP_ADJACENCY: gfx.PrimitiveMode;
        TRIANGLE_PATCH_ADJACENCY: gfx.PrimitiveMode;
        QUAD_PATCH_LIST: gfx.PrimitiveMode;
        ISO_LINE_LIST: gfx.PrimitiveMode;
        LINEAR: gfx.Filter;
        ANISOTROPIC: gfx.Filter;
        WRAP: gfx.Address;
        MIRROR: gfx.Address;
        CLAMP: gfx.Address;
        BORDER: gfx.Address;
        LINE_WIDTH: gfx.DynamicStateFlagBit;
        DEPTH_BIAS: gfx.DynamicStateFlagBit;
        BLEND_CONSTANTS: gfx.DynamicStateFlagBit;
        DEPTH_BOUNDS: gfx.DynamicStateFlagBit;
        STENCIL_WRITE_MASK: gfx.DynamicStateFlagBit;
        STENCIL_COMPARE_MASK: gfx.DynamicStateFlagBit;
        TRUE: boolean;
        FALSE: boolean;
    };
    export import Sampler = gfx.Sampler;
    export import SamplerInfo = gfx.SamplerInfo;
    export import SetIndex = pipeline.SetIndex;
    export import RenderPriority = pipeline.RenderPriority;
    export import GetTypeSize = gfx.GetTypeSize;
    export { murmurhash2_32_gc } from "cc";
    import { gfx, pipeline } from "cc";
    export {};
}
declare module "cc/editor/particle-system-2d-utils" {
    /**
     * A png file reader
     * @name PNGReader
     */
    export class PNGReader {
        constructor(data: any);
        read(bytes: any): any[];
        readUInt32(): number;
        readUInt16(): number;
        decodePixels(data: any): Uint8Array;
        copyToImageData(imageData: any, pixels: any): void;
        decodePalette(): Uint8Array;
        render(canvas: any): any;
    }
    /**
     * cc.tiffReader is a singleton object, it's a tiff file reader, it can parse byte array to draw into a canvas
     * @class
     * @name tiffReader
     */
    export class TiffReader {
        constructor();
        getUint8(offset: any): any;
        getUint16(offset: any): number;
        getUint32(offset: any): number;
        checkLittleEndian(): boolean;
        hasTowel(): boolean;
        getFieldTypeName(fieldType: any): any;
        getFieldTagName(fieldTag: any): any;
        getFieldTypeLength(fieldTypeName: any): number;
        getFieldValues(fieldTagName: any, fieldTypeName: any, typeCount: any, valueOffset: any): any[];
        getBytes(numBytes: any, offset: any): any;
        getBits(numBits: any, byteOffset: any, bitOffset: any): {
            bits: number;
            byteOffset: any;
            bitOffset: number;
        };
        parseFileDirectory(offset: any): void;
        clampColorSample(colorSample: any, bitsPerSample: any): number;
        /**
         * @function
         * @param {Array} tiffData
         * @param {HTMLCanvasElement} canvas
         * @returns {*}
         */
        parseTIFF(tiffData: any, canvas: any): any;
    }
    export function getImageFormatByData(imgData: any): ImageFormat;
    /**
     * Image formats
     * @enum macro.ImageFormat
     */
    export enum ImageFormat {
        /**
         * @en Image Format:JPG
         * @zh 图片格式:JPG
         */
        JPG = 0,
        /**
         * @en Image Format:PNG
         * @zh 图片格式:PNG
         */
        PNG = 1,
        /**
         * @en Image Format:TIFF
         * @zh 图片格式:TIFF
         */
        TIFF = 2,
        /**
         * @en Image Format:WEBP
         * @zh 图片格式:WEBP
         */
        WEBP = 3,
        /**
         * @en Image Format:PVR
         * @zh 图片格式:PVR
         */
        PVR = 4,
        /**
         * @en Image Format:ETC
         * @zh 图片格式:ETC
         */
        ETC = 5,
        /**
         * @en Image Format:S3TC
         * @zh 图片格式:S3TC
         */
        S3TC = 6,
        /**
         * @en Image Format:ATITC
         * @zh 图片格式:ATITC
         */
        ATITC = 7,
        /**
         * @en Image Format:TGA
         * @zh 图片格式:TGA
         */
        TGA = 8,
        /**
         * @en Image Format:RAWDATA
         * @zh 图片格式:RAWDATA
         */
        RAWDATA = 9,
        /**
         * @en Image Format:UNKNOWN
         * @zh 图片格式:UNKNOWN
         */
        UNKNOWN = 10
    }
    export {};
}
declare module "cc/editor/populate-internal-constants" {
    /**
     * Running in Web platform
     */
    export const HTML5: boolean;
    /**
     * Running in native platform (mobile app, desktop app, or simulator).
     */
    export const NATIVE: boolean;
    /**
     * Running in ANDROID platform
     */
    export const ANDROID: boolean;
    /**
     * Running in IOS platform
     */
    export const IOS: boolean;
    /**
     * Running in MAC platform
     */
    export const MAC: boolean;
    /**
     * Running in WINDOWS platform
     */
    export const WINDOWS: boolean;
    /**
     * Running in LINUX platform
     */
    export const LINUX: boolean;
    /**
     * Running in OHOS platform
     */
    export const OHOS: boolean;
    /**
     * Running in OPEN_HARMONY platform
     */
    export const OPEN_HARMONY: boolean;
    /**
     * Running in the Wechat's mini game.
     */
    export const WECHAT: boolean;
    /**
     * Running in the Wechat's mini program.
     */
    export const WECHAT_MINI_PROGRAM: boolean;
    /**
     * Running in the baidu's mini game.
     */
    export const BAIDU: boolean;
    /**
     * Running in the xiaomi's quick game.
     */
    export const XIAOMI: boolean;
    /**
     * Running in the alipay's mini game.
     */
    export const ALIPAY: boolean;
    /**
     * Running in the taobao creative app.
     */
    export const TAOBAO: boolean;
    /**
     * Running in the taobao mini game.
     */
    export const TAOBAO_MINIGAME: boolean;
    /**
     * Running in the ByteDance's mini game.
     */
    export const BYTEDANCE: boolean;
    /**
     * Running in the oppo's quick game.
     */
    export const OPPO: boolean;
    /**
     * Running in the vivo's quick game.
     */
    export const VIVO: boolean;
    /**
     * Running in the huawei's quick game.
     */
    export const HUAWEI: boolean;
    /**
     * Running in the cocosplay.
     */
    export const COCOSPLAY: boolean;
    /**
     * Running in the qtt's quick game.
     */
    export const QTT: boolean;
    /**
     * Running in the linksure's quick game.
     */
    export const LINKSURE: boolean;
    /**
     * Running in the editor.
     */
    export const EDITOR: boolean;
    /**
     * Run in editor but not in editor preview.
     */
    export const EDITOR_NOT_IN_PREVIEW: boolean;
    /**
     * Preview in browser or simulator.
     */
    export const PREVIEW: boolean;
    /**
     * Running in published project.
     */
    export const BUILD: boolean;
    /**
     * Running in the engine's unit test.
     */
    export const TEST: boolean;
    /**
     * Running debug mode.
     */
    export const DEBUG: boolean;
    /**
     * Running in the server mode.
     */
    export const SERVER_MODE: boolean;
    /**
     * Running in the editor or preview.
     */
    export const DEV: boolean;
    /**
     * Running in mini game.
     */
    export const MINIGAME: boolean;
    /**
     * Running in runtime based environment.
     */
    export const RUNTIME_BASED: boolean;
    /**
     * Support JIT.
     */
    export const SUPPORT_JIT: boolean;
    /**
     * Running in environment where using JSB as the JavaScript interface binding scheme.
     */
    export const JSB: boolean;
    /**
     * This is an internal constant to determine whether pack physx libs.
     */
    export const NOT_PACK_PHYSX_LIBS: boolean;
    /**
     * The network access mode.
     * - 0 Client
     * - 1 ListenServer
     * - 2 HostServer
     */
    export const NET_MODE: number;
    /**
     * Running with webgpu rendering backend.
     */
    export const WEBGPU: boolean;
    /**
     * Whether support wasm, here we provide 3 options:
     * 0: The platform doesn't support WASM
     * 1: The platform supports WASM
     * 2: The platform may support WASM, especially on Web platform
     */
    export const WASM_SUPPORT_MODE: number;
    /**
     * Whether force banning using bullet wasm and use asmjs instead.
     * This is an internal constant to be compatible with the editor's physical build option.
     */
    export const FORCE_BANNING_BULLET_WASM: boolean;
    /**
     * Whether cull the asm js module.
     * The external modules ending with '.asm.js'. or '.js.mem' is culled if this constant is true.
     */
    export const CULL_ASM_JS_MODULE: boolean;
    /**
     * An internal constant to indicate whether need a fallback of wasm.
     * If true, we build a wasm fallback module for the compatibility of wasm files compiled by different version of emscripten.
     * This is useful when we use wasm on different version of Safari browsers.
     */
    export const WASM_FALLBACK: boolean;
    /**
     * An internal constant to indicate whether we use wasm assets as minigame subpackage.
     * This is useful when we need to reduce code size.
     */
    export const WASM_SUBPACKAGE: boolean;
    /**
     * An internal constant to indicate whether we cull the meshopt wasm module and asm.js module.
     */
    export const CULL_MESHOPT: boolean;
    export {};
}
declare module "cc/editor/reflection-probe" {
    export { ReflectionProbeManager } from "cc";
    export {};
}
declare module "cc/editor/serialization" {
    export class CCON {
        constructor(document: unknown, chunks: Uint8Array[]);
        get document(): unknown;
        get chunks(): Uint8Array[];
    }
    export function encodeCCONJson(ccon: CCON, chunkURLs: string[]): unknown;
    export function encodeCCONBinary(ccon: CCON): Uint8Array;
    export class BufferBuilder {
        get byteLength(): number;
        alignAs(align: number): number;
        append(view: ArrayBufferView): number;
        get(): Uint8Array;
    }
    export function decodeCCONBinary(bytes: Uint8Array): CCON;
    export function parseCCONJson(json: unknown): {
        chunks: string[];
        document: unknown;
    };
    export function serializeBuiltinValueType(obj: ValueType): ___private._cocos_serialization_compiled_builtin_value_type__ValueTypeData | null;
    import { ValueType, __private as ___private } from "cc";
    export {};
}
