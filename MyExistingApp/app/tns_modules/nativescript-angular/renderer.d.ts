import { NgZone, Renderer, RootRenderer, RenderComponentType } from '@angular/core';
import { AnimationPlayer, AnimationStyles, AnimationKeyframe } from "./private_import_core";
import { View } from "ui/core/view";
import { Page } from 'ui/page';
import { ViewUtil, NgView } from "./view-util";
import { Device } from "platform";
import * as nsAnimationDriver from "./animation-driver";
export declare const COMPONENT_VARIABLE: string;
export declare const CONTENT_ATTR: string;
export declare class NativeScriptRootRenderer implements RootRenderer {
    private _rootView;
    private _zone;
    private _viewUtil;
    private _animationDriver;
    protected readonly animationDriver: nsAnimationDriver.NativeScriptAnimationDriver;
    constructor(_rootView: View, device: Device, _zone: NgZone);
    private _registeredComponents;
    readonly rootView: View;
    readonly page: Page;
    readonly viewUtil: ViewUtil;
    renderComponent(componentProto: RenderComponentType): Renderer;
}
export declare class NativeScriptRenderer extends Renderer {
    private rootRenderer;
    private componentProto;
    private animationDriver;
    private zone;
    private componentProtoId;
    private hasComponentStyles;
    private readonly viewUtil;
    constructor(rootRenderer: NativeScriptRootRenderer, componentProto: RenderComponentType, animationDriver: nsAnimationDriver.NativeScriptAnimationDriver, zone: NgZone);
    private attrReplacer;
    private attrSanitizer;
    private replaceNgAttribute(input, componentId);
    renderComponent(componentProto: RenderComponentType): Renderer;
    selectRootElement(selector: string): NgView;
    createViewRoot(hostElement: NgView): NgView;
    projectNodes(parentElement: NgView, nodes: NgView[]): void;
    attachViewAfter(anchorNode: NgView, viewRootNodes: NgView[]): void;
    detachView(viewRootNodes: NgView[]): void;
    destroyView(hostElement: NgView, viewAllNodes: NgView[]): void;
    setElementProperty(renderElement: NgView, propertyName: string, propertyValue: any): void;
    setElementAttribute(renderElement: NgView, attributeName: string, attributeValue: string): void;
    setElementClass(renderElement: NgView, className: string, isAdd: boolean): void;
    setElementStyle(renderElement: NgView, styleName: string, styleValue: string): void;
    /**
    * Used only in debug mode to serialize property changes to comment nodes,
    * such as <template> placeholders.
    */
    setBindingDebugInfo(renderElement: NgView, propertyName: string, propertyValue: string): void;
    setElementDebugInfo(renderElement: any, info: any): void;
    /**
    * Calls a method on an element.
    */
    invokeElementMethod(renderElement: NgView, methodName: string, args: Array<any>): void;
    setText(renderNode: any, text: string): void;
    createTemplateAnchor(parentElement: NgView): NgView;
    createElement(parentElement: NgView, name: string): NgView;
    createText(parentElement: NgView, value: string): NgView;
    listen(renderElement: NgView, eventName: string, callback: Function): Function;
    listenGlobal(target: string, eventName: string, callback: Function): Function;
    animate(element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[], duration: number, delay: number, easing: string): AnimationPlayer;
}
