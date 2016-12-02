var core_1 = require('@angular/core');
var page_1 = require('ui/page');
var detached_loader_1 = require('../common/detached-loader');
var platform_providers_1 = require('../platform-providers');
var ModalDialogParams = (function () {
    function ModalDialogParams(context, closeCallback) {
        if (context === void 0) { context = {}; }
        this.context = context;
        this.closeCallback = closeCallback;
    }
    return ModalDialogParams;
}());
exports.ModalDialogParams = ModalDialogParams;
var ModalDialogService = (function () {
    function ModalDialogService() {
    }
    ModalDialogService.prototype.registerViewContainerRef = function (ref) {
        this.containerRef = ref;
    };
    ModalDialogService.prototype.showModal = function (type, options) {
        var viewContainerRef = options.viewContainerRef || this.containerRef;
        if (!viewContainerRef) {
            throw new Error("No viewContainerRef: Make sure you pass viewContainerRef in ModalDialogOptions.");
        }
        var parentPage = viewContainerRef.injector.get(page_1.Page);
        var resolver = viewContainerRef.injector.get(core_1.ComponentFactoryResolver);
        var pageFactory = viewContainerRef.injector.get(platform_providers_1.PAGE_FACTORY);
        return new Promise(function (resolve, reject) {
            setTimeout(function () { return ModalDialogService.showDialog(type, options, resolve, viewContainerRef, resolver, parentPage, pageFactory); }, 10);
        });
    };
    ModalDialogService.showDialog = function (type, options, doneCallback, containerRef, resolver, parentPage, pageFactory) {
        var page = pageFactory({ isModal: true, componentType: type });
        var detachedLoaderRef;
        var closeCallback = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            doneCallback.apply(undefined, args);
            page.closeModal();
            detachedLoaderRef.destroy();
        };
        var modalParams = new ModalDialogParams(options.context, closeCallback);
        var providers = core_1.ReflectiveInjector.resolve([
            { provide: page_1.Page, useValue: page },
            { provide: ModalDialogParams, useValue: modalParams },
        ]);
        var childInjector = core_1.ReflectiveInjector.fromResolvedProviders(providers, containerRef.parentInjector);
        var detachedFactory = resolver.resolveComponentFactory(detached_loader_1.DetachedLoader);
        detachedLoaderRef = containerRef.createComponent(detachedFactory, -1, childInjector, null);
        detachedLoaderRef.instance.loadComponent(type).then(function (compRef) {
            var componentView = compRef.location.nativeElement;
            if (componentView.parent) {
                componentView.parent.removeChild(componentView);
            }
            page.content = componentView;
            parentPage.showModal(page, options.context, closeCallback, options.fullscreen);
        });
    };
    ModalDialogService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ModalDialogService);
    return ModalDialogService;
}());
exports.ModalDialogService = ModalDialogService;
var ModalDialogHost = (function () {
    function ModalDialogHost(containerRef, modalService) {
        console.log("ModalDialogHost is deprecated. Call ModalDialogService.showModal() by passing ViewContainerRef in the options instead.");
        modalService.registerViewContainerRef(containerRef);
    }
    ModalDialogHost = __decorate([
        core_1.Directive({
            selector: "[modal-dialog-host]"
        }), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, ModalDialogService])
    ], ModalDialogHost);
    return ModalDialogHost;
}());
exports.ModalDialogHost = ModalDialogHost;
//# sourceMappingURL=dialogs.js.map