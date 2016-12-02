import { ResolvedReflectiveProvider, ViewContainerRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { RouterOutletMap, ActivatedRoute } from '@angular/router';
import { NSLocationStrategy } from "./ns-location-strategy";
import { PageFactory } from "../platform-providers";
import { Device } from "platform";
import { Frame } from "ui/frame";
import { BehaviorSubject } from "rxjs";
export declare class PageRoute {
    activatedRoute: BehaviorSubject<ActivatedRoute>;
    constructor(startRoute: ActivatedRoute);
}
export declare class PageRouterOutlet {
    private containerRef;
    private locationStrategy;
    private componentFactoryResolver;
    private frame;
    private pageFactory;
    private viewUtil;
    private refCache;
    private isInitalPage;
    private detachedLoaderFactory;
    private currentActivatedComp;
    private currentActivatedRoute;
    outletMap: RouterOutletMap;
    readonly isActivated: boolean;
    readonly component: Object;
    readonly activatedRoute: ActivatedRoute;
    constructor(parentOutletMap: RouterOutletMap, containerRef: ViewContainerRef, name: string, locationStrategy: NSLocationStrategy, componentFactoryResolver: ComponentFactoryResolver, resolver: ComponentFactoryResolver, frame: Frame, device: Device, pageFactory: PageFactory);
    deactivate(): void;
    private clearRefCache();
    private destroyCacheItem(popedItem);
    /**
     * Called by the Router to instantiate a new component during the commit phase of a navigation.
     * This method in turn is responsible for calling the `routerOnActivate` hook of its child.
     */
    activate(activatedRoute: ActivatedRoute, loadedResolver: ComponentFactoryResolver, loadedInjector: Injector, providers: ResolvedReflectiveProvider[], outletMap: RouterOutletMap): void;
    private activateOnGoForward(activatedRoute, providers, outletMap);
    private activateOnGoBack(activatedRoute, providers, outletMap);
    private loadComponentInPage(page, componentRef);
    private getComponentFactory(activatedRoute);
}
