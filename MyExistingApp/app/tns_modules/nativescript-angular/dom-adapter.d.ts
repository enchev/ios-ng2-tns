import { ElementSchemaRegistry } from '@angular/compiler';
import { Sanitizer, SchemaMetadata } from '@angular/core';
import { Parse5DomAdapter } from "./parse5_adapter";
export declare enum SecurityContext {
    NONE = 0,
    HTML = 1,
    STYLE = 2,
    SCRIPT = 3,
    URL = 4,
    RESOURCE_URL = 5,
}
export declare class NativeScriptElementSchemaRegistry extends ElementSchemaRegistry {
    hasProperty(tagName: string, propName: string): boolean;
    hasElement(tagName: string, schemaMetas: SchemaMetadata[]): boolean;
    getMappedPropName(propName: string): string;
    getDefaultComponentElementName(): string;
    securityContext(tagName: string, propName: string): any;
    validateProperty(name: string): {
        error: boolean;
        msg?: string;
    };
    validateAttribute(name: string): {
        error: boolean;
        msg?: string;
    };
    allKnownElementNames(): string[];
}
export declare class NativeScriptSanitizer extends Sanitizer {
    sanitize(context: SecurityContext, value: string): string;
}
export declare class NativeScriptDomAdapter extends Parse5DomAdapter {
    static makeCurrent(): void;
    hasProperty(element: any, name: string): boolean;
    log(arg: any): void;
    logError(arg: any): void;
    logGroup(arg: any): void;
    logGroupEnd(): void;
}
