//
//  NSTScannerViewManager.m
//  NewStoreSDKScanKit
//
//  Created by Radwa Ibrahim on 21.09.17.
//  Copyright © 2017 NewStore. All rights reserved.
//
#import "NSTScannerViewManager.h"
#import "NSTScanningView.h"

@implementation NSTScannerViewManager

RCT_EXPORT_MODULE(NewStoreSDKScanKitView)
RCT_EXPORT_VIEW_PROPERTY(isScanning, BOOL)
RCT_EXPORT_VIEW_PROPERTY(debugModeEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(crosshairEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(torchToggleHidden, BOOL)
RCT_EXPORT_VIEW_PROPERTY(codeTypes, NSCCodeTypes)
RCT_EXPORT_VIEW_PROPERTY(torchMode, NSCTorchMode)
RCT_EXPORT_VIEW_PROPERTY(onScannerDidRecognizeCode, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onScannerStoppedScanning, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onScannerStartedScanning, RCTBubblingEventBlock)

- (NSDictionary *)constantsToExport
{
    return @{
        @"QR": @(NSCCodeTypeQR),
        @"Databar": @(NSCCodeTypeDatabar),
        @"DatabarExpanded": @(NSCCodeTypeDatabarExpanded),
        @"EAN8": @(NSCCodeTypeEAN8),
        @"EAN13": @(NSCCodeTypeEAN13),
        @"UPCA": @(NSCCodeTypeUPCA),
        @"UPCE": @(NSCCodeTypeUPCE),
        @"DataMatrix": @(NSCCodeTypeDataMatrix),
        @"Code39": @(NSCCodeTypeCode39),
        @"Code93": @(NSCCodeTypeCode93),
        @"Code128": @(NSCCodeTypeCode128),
        @"PDF417": @(NSCCodeTypePDF417),
        @"Interleaved2of5": @(NSCCodeTypeI25),
        @"CodeTypeAll": @(NSCCodeTypeAll),
        @"TorchModeOff": @(NSCTorchModeOff),
        @"TorchModeOn": @(NSCTorchModeOn),
        @"TorchModeAuto": @(NSCTorchModeAuto)
    };
}

- (UIView *)view
{
    NSTScanningView *scanningView = [[NSTScanningView alloc] init];
    return scanningView;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

@end

@implementation RCTConvert (NSTScannerViewManager)

RCT_MULTI_ENUM_CONVERTER(NSCCodeTypes,
    (@{
        @"QR": @(NSCCodeTypeQR),
        @"Databar": @(NSCCodeTypeDatabar),
        @"DatabarExpanded": @(NSCCodeTypeDatabarExpanded),
        @"EAN8": @(NSCCodeTypeEAN8),
        @"EAN13": @(NSCCodeTypeEAN13),
        @"UPCA": @(NSCCodeTypeUPCA),
        @"UPCE": @(NSCCodeTypeUPCE),
        @"DataMatrix": @(NSCCodeTypeDataMatrix),
        @"Code39": @(NSCCodeTypeCode39),
        @"Code93": @(NSCCodeTypeCode93),
        @"Code128": @(NSCCodeTypeCode128),
        @"PDF417": @(NSCCodeTypePDF417),
        @"Interleaved2of5": @(NSCCodeTypeI25),
        @"CodeTypeAll": @(NSCCodeTypeAll)
    }),
    NSCCodeTypeAll,
    integerValue)

RCT_ENUM_CONVERTER(NSCTorchMode,
    (@{
        @"TorchModeOff": @(NSCTorchModeOff),
        @"TorchModeOn": @(NSCTorchModeOn),
        @"TorchModeAuto": @(NSCTorchModeAuto)
    }),
    NSCTorchModeAuto,
    integerValue)

@end
