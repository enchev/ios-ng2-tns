var core_1 = require('@angular/core');
var lang_facade_1 = require("../lang-facade");
var router_1 = require('@angular/router');
var ns_location_strategy_1 = require("./ns-location-strategy");
var platform_providers_1 = require("../platform-providers");
var trace_1 = require("../trace");
var detached_loader_1 = require("../common/detached-loader");
var view_util_1 = require("../view-util");
var frame_1 = require("ui/frame");
var page_1 = require("ui/page");
var rxjs_1 = require("rxjs");
var PageRoute = (function () {
    function PageRoute(startRoute) {
        this.activatedRoute = new rxjs_1.BehaviorSubject(startRoute);
    }
    return PageRoute;
}());
exports.PageRoute = PageRoute;
/**
 * Reference Cache
 */
var RefCache = (function () {
    function RefCache() {
        this.cache = new Array();
    }
    RefCache.prototype.push = function (componentRef, reusedRoute, outletMap, loaderRef) {
        this.cache.push({ componentRef: componentRef, reusedRoute: reusedRoute, outletMap: outletMap, loaderRef: loaderRef });
    };
    RefCache.prototype.pop = function () {
        return this.cache.pop();
    };
    RefCache.prototype.peek = function () {
        return this.cache[this.cache.length - 1];
    };
    Object.defineProperty(RefCache.prototype, "length", {
        get: function () {
            return this.cache.length;
        },
        enumerable: true,
        configurable: true
    });
    return RefCache;
}());
var PageRouterOutlet = (function () {
    function PageRouterOutlet(parentOutletMap, containerRef, name, locationStrategy, componentFactoryResolver, resolver, frame, device, pageFactory) {
        this.containerRef = containerRef;
        this.locationStrategy = locationStrategy;
        this.componentFactoryResolver = componentFactoryResolver;
        this.frame = frame;
        this.pageFactory = pageFactory;
        this.refCache = new RefCache();
        this.isInitalPage = true;
        parentOutletMap.registerOutlet(name ? name : router_1.PRIMARY_OUTLET, this);
        this.viewUtil = new view_util_1.ViewUtil(device);
        this.detachedLoaderFactory = resolver.resolveComponentFactory(detached_loader_1.DetachedLoader);
        log("DetachedLoaderFactory loaded");
    }
    Object.defineProperty(PageRouterOutlet.prototype, "isActivated", {
        get: function () {
            return !!this.currentActivatedComp;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageRouterOutlet.prototype, "component", {
        get: function () {
            if (!this.currentActivatedComp) {
                throw new Error('Outlet is not activated');
            }
            return this.currentActivatedComp.instance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageRouterOutlet.prototype, "activatedRoute", {
        get: function () {
            if (!this.currentActivatedComp) {
                throw new Error('Outlet is not activated');
            }
            return this.currentActivatedRoute;
        },
        enumerable: true,
        configurable: true
    });
    PageRouterOutlet.prototype.deactivate = function () {
        if (this.locationStrategy._isPageNavigatingBack()) {
            log("PageRouterOutlet.deactivate() while going back - should destroy");
            var popedItem = this.refCache.pop();
            var popedRef = popedItem.componentRef;
            if (this.currentActivatedComp !== popedRef) {
                throw new Error("Current componentRef is different for cached componentRef");
            }
            this.destroyCacheItem(popedItem);
            this.currentActivatedComp = null;
        }
        else {
            log("PageRouterOutlet.deactivate() while going foward - do nothing");
        }
    };
    PageRouterOutlet.prototype.clearRefCache = function () {
        while (this.refCache.length > 0) {
            this.destroyCacheItem(this.refCache.pop());
        }
    };
    PageRouterOutlet.prototype.destroyCacheItem = function (popedItem) {
        if (lang_facade_1.isPresent(popedItem.componentRef)) {
            popedItem.componentRef.destroy();
        }
        if (lang_facade_1.isPresent(popedItem.loaderRef)) {
            popedItem.loaderRef.destroy();
        }
    };
    /**
     * Called by the Router to instantiate a new component during the commit phase of a navigation.
     * This method in turn is responsible for calling the `routerOnActivate` hook of its child.
     */
    PageRouterOutlet.prototype.activate = function (activatedRoute, loadedResolver, loadedInjector, providers, outletMap) {
        this.outletMap = outletMap;
        this.currentActivatedRoute = activatedRoute;
        if (this.locationStrategy._isPageNavigatingBack()) {
            this.activateOnGoBack(activatedRoute, providers, outletMap);
        }
        else {
            this.activateOnGoForward(activatedRoute, providers, outletMap);
        }
    };
    PageRouterOutlet.prototype.activateOnGoForward = function (activatedRoute, providers, outletMap) {
        var factory = this.getComponentFactory(activatedRoute);
        var pageRoute = new PageRoute(activatedRoute);
        providers = providers.concat(core_1.ReflectiveInjector.resolve([{ provide: PageRoute, useValue: pageRoute }]));
        if (this.isInitalPage) {
            log("PageRouterOutlet.activate() inital page - just load component");
            this.isInitalPage = false;
            var inj = core_1.ReflectiveInjector.fromResolvedProviders(providers, this.containerRef.parentInjector);
            this.currentActivatedComp = this.containerRef.createComponent(factory, this.containerRef.length, inj, []);
            this.refCache.push(this.currentActivatedComp, pageRoute, outletMap, null);
        }
        else {
            log("PageRouterOutlet.activate() forward navigation - create detached loader in the loader container");
            var page = this.pageFactory({ isNavigation: true, componentType: factory.componentType });
            var pageResolvedProvider = core_1.ReflectiveInjector.resolve([
                { provide: page_1.Page, useValue: page }
            ]);
            var childInjector = core_1.ReflectiveInjector.fromResolvedProviders(providers.concat(pageResolvedProvider), this.containerRef.parentInjector);
            var loaderRef = this.containerRef.createComponent(this.detachedLoaderFactory, this.containerRef.length, childInjector, []);
            this.currentActivatedComp = loaderRef.instance.loadWithFactory(factory);
            this.loadComponentInPage(page, this.currentActivatedComp);
            this.refCache.push(this.currentActivatedComp, pageRoute, outletMap, loaderRef);
        }
    };
    PageRouterOutlet.prototype.activateOnGoBack = function (activatedRoute, providers, outletMap) {
        log("PageRouterOutlet.activate() - Back naviation, so load from cache");
        this.locationStrategy._finishBackPageNavigation();
        var cacheItem = this.refCache.peek();
        cacheItem.reusedRoute.activatedRoute.next(activatedRoute);
        this.outletMap = cacheItem.outletMap;
        // HACK: Fill the outlet map provided by the router, with the outlets that we have cached.
        // This is needed beacuse the component is taken form the cache and not created - so it will not register
        // its child router-outlets to the newly created outlet map.
        Object.assign(outletMap, cacheItem.outletMap);
        this.currentActivatedComp = cacheItem.componentRef;
    };
    PageRouterOutlet.prototype.loadComponentInPage = function (page, componentRef) {
        var _this = this;
        //Component loaded. Find its root native view.
        var componentView = componentRef.location.nativeElement;
        //Remove it from original native parent.
        this.viewUtil.removeChild(componentView.parent, componentView);
        //Add it to the new page
        page.content = componentView;
        page.on('navigatedFrom', global.Zone.current.wrap(function (args) {
            // console.log("page.navigatedFrom: " + page + " args.isBackNavigation:" + args.isBackNavigation);
            if (args.isBackNavigation) {
                _this.locationStrategy._beginBackPageNavigation();
                _this.locationStrategy.back();
            }
        }));
        var navOptions = this.locationStrategy._beginPageNavigation();
        this.frame.navigate({
            create: function () { return page; },
            clearHistory: navOptions.clearHistory,
            animated: navOptions.animated,
            transition: navOptions.transition
        });
        // Clear refCache if navigation with clearHistory
        if (navOptions.clearHistory) {
            this.clearRefCache();
        }
    };
    // NOTE: Using private APIs - potential break point!
    PageRouterOutlet.prototype.getComponentFactory = function (activatedRoute) {
        var snapshot = activatedRoute._futureSnapshot;
        var component = snapshot._routeConfig.component;
        var factory;
        try {
            factory = typeof component === 'string' ?
                snapshot._resolvedComponentFactory :
                this.componentFactoryResolver.resolveComponentFactory(component);
        }
        catch (e) {
            if (!(e.constructor.name === "NoComponentFactoryError")) {
                throw e;
            }
            // TODO: vsavkin uncomment this once ComponentResolver is deprecated
            // const componentName = component ? component.name : null;
            // console.warn(
            //     `'${componentName}' not found in precompile array.  To ensure all components referred
            //     to by the RouterConfig are compiled, you must add '${componentName}' to the
            //     'precompile' array of your application component. This will be required in a future
            //     release of the router.`);
            factory = snapshot._resolvedComponentFactory;
        }
        return factory;
    };
    PageRouterOutlet = __decorate([
        core_1.Directive({ selector: 'page-router-outlet' }),
        __param(2, core_1.Attribute('name')),
        __param(7, core_1.Inject(platform_providers_1.DEVICE)),
        __param(8, core_1.Inject(platform_providers_1.PAGE_FACTORY)), 
        __metadata('design:paramtypes', [router_1.RouterOutletMap, core_1.ViewContainerRef, String, ns_location_strategy_1.NSLocationStrategy, core_1.ComponentFactoryResolver, core_1.ComponentFactoryResolver, frame_1.Frame, Object, Function])
    ], PageRouterOutlet);
    return PageRouterOutlet;
}());
exports.PageRouterOutlet = PageRouterOutlet;
function log(msg) {
    trace_1.routerLog(msg);
}
//# sourceMappingURL=page-router-outlet.js.map