//
//  ViewController.m
//  MyExistingApp
//
//  Created by Vladimir Enchev on 10/10/16.
//  Copyright © 2016 Telerik. All rights reserved.
//

#import "ViewController.h"
#import <NativeScript/NativeScript.h>
#import <JavaScriptCore/JavaScript.h>
#import <JavaScriptCore/JSStringRefCF.h>

@interface ViewController ()

@end

@implementation ViewController {
    TNSRuntime *_runtime;
 }

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // The linker-embedded NativeScript metadata.
    extern char startOfMetadataSection __asm("section$start$__DATA$__TNSMetadata");
    
    // You need to call this method only once in your app.
    [TNSRuntime initializeMetadata:&startOfMetadataSection];
    
    NSString *path = [[NSBundle mainBundle] bundlePath];
    
    // Tell NativeScript where to look for the app folder. Its existence is optional, though.
    _runtime = [[TNSRuntime alloc] initWithApplicationPath:path];
    
    // Schedule the runtime on the runloop of the thread you'd like promises and other microtasks to run on.
    [_runtime scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSRunLoopCommonModes];
    [TNSRuntimeInspector setLogsToSystemConsole:YES];
    
    UIButton *button = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    [button addTarget:self
               action:@selector(buttonTap:)
     forControlEvents:UIControlEventTouchUpInside];
    [button setTitle:@"Show NativeScript View" forState:UIControlStateNormal];
    button.frame = CGRectMake(80.0, 210.0, 200.0, 40.0);
    [self.view addSubview:button];
}

-(void) buttonTap:(UIButton*)sender {
    [self presentNativeScriptViewController];
}

- (void)presentNativeScriptViewController {
    NSString *source = @"var platform_1 = require('nativescript-angular/platform');"
    "var app_module_1 = require('./app.module');"
    "var platform = platform_1.platformNativeScriptDynamic();"
    "platform.bootstrapModule(app_module_1.AppModule);";
    
    JSStringRef script = JSStringCreateWithCFString((__bridge CFStringRef)(source));
    
    JSValueRef error = NULL;
    JSEvaluateScript(_runtime.globalContext, script, NULL, NULL, 0, &error);
    
    if (error) {
        JSStringRef stringifiedError = JSValueToStringCopy(_runtime.globalContext, error, NULL);
        NSLog(@"%@", JSStringCopyCFString(kCFAllocatorDefault, stringifiedError));
        JSStringRelease(stringifiedError);
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
