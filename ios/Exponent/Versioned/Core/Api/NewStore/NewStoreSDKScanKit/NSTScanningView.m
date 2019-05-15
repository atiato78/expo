//
//  ScanningView.m
//  NewStoreSDKScanKit
//
//  Created by Zongkun Dou on 9/22/17.
//  Copyright © 2017 NewStore. All rights reserved.
//

@import Foundation;
#import "NSTScanningView.h"
#import "NSTScanKit.h"

@interface NSTScanningView ()
@property (nonatomic) NSCScanViewController *scanViewController;
@property (nonatomic) UIView *scanView;
@end

@implementation NSTScanningView

- (instancetype)init
{
    self = [super init];
    if(self)
    {
        self.isScanning = NO;
        self.torchMode = NSCTorchModeAuto;
        self.debugModeEnabled = NO;
        self.codeTypes = NSCCodeTypeNone;
        self.crosshairEnabled = NO;
        self.torchToggleHidden = YES;
    }
    return self;
}

- (void)setCodeTypes:(NSCCodeTypes)codeTypes
{
    if(!self.scanViewController && codeTypes == self.scanViewController.codeTypes)
    {
        return;
    }

    [self willChangeValueForKey:@"codeTypes"];
    _codeTypes = codeTypes;
    [self didChangeValueForKey:@"codeTypes"];
    
    [self initializeScanner];
}

- (void)setIsScanning:(BOOL)scanning
{
    [self willChangeValueForKey:@"isScanning"];
    _isScanning = scanning;
    [self didChangeValueForKey:@"isScanning"];
    
    if(self.scanViewController)
    {
        if(scanning == YES)
        {
            [self startScanning];
        }
        else
        {
            [self.scanViewController stopScanning];
        }
    }
}

- (void)setTorchMode:(NSCTorchMode)torchMode
{
    [self willChangeValueForKey:@"torchMode"];
    _torchMode = torchMode;
    [self didChangeValueForKey:@"torchMode"];
    
    if(self.scanViewController)
    {
        self.scanViewController.torchMode = torchMode;
    }
}

- (void)setDebugModeEnabled:(BOOL)debugModeEnabled
{
    [self willChangeValueForKey:@"debugModeEnabled"];
    _debugModeEnabled = debugModeEnabled;
    [self didChangeValueForKey:@"debugModeEnabled"];
    
    if(self.scanViewController)
    {
        self.scanViewController.debugModeEnabled = debugModeEnabled;
    }
}

- (void)setCrosshairEnabled:(BOOL)crosshairEnabled
{
    [self willChangeValueForKey:@"crosshairEnabled"];
    _crosshairEnabled = crosshairEnabled;
    [self didChangeValueForKey:@"crosshairEnabled"];
    
    if(self.scanViewController)
    {
        self.scanViewController.crosshairEnabled = crosshairEnabled;
    }
}

- (void)setTorchToggleHidden:(BOOL)torchToggleHidden
{
    [self willChangeValueForKey:@"torchToggleHidden"];
    _torchToggleHidden = torchToggleHidden;
    [self didChangeValueForKey:@"torchToggleHidden"];

    if(self.scanViewController)
    {
        self.scanViewController.torchToggleHidden = torchToggleHidden;
    }
}

#pragma mark - Private Methods

- (void)initializeScanner
{
    [self resetView];

    self.scanViewController = [[NSCScanViewController alloc] initWithCodeTypes:self.codeTypes];
    self.scanViewController.delegate = self;
    self.scanView = self.scanViewController.view;
    self.scanView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.scanView.frame = self.bounds;
    [self addSubview:self.scanView];

    // Configure scanner
    self.scanViewController.torchMode = self.torchMode;
    self.scanViewController.debugModeEnabled = self.debugModeEnabled;
    self.scanViewController.crosshairEnabled = self.crosshairEnabled;
    self.scanViewController.torchToggleHidden = self.torchToggleHidden;

    if([self isScanning])
    {
        [self startScanning];
    }
}

- (void)startScanning
{
    [NSTScanKit handleCameraAccessAuthorization:^(BOOL granted) {
        if(granted)
        {
            [self.scanViewController startScanning];
        }
    }];
}

- (void)resetView
{
    self.scanViewController.delegate = nil;
    [self.scanView removeFromSuperview];
}

#pragma mark - NSCScanViewControllerDelegate

- (void)scanViewController:(id<NSCScanViewController>)scanViewController
          didRecognizeCode:(NSString *)code
                  codeType:(NSCCodeTypes)codeType
{
    if(!self.onScannerDidRecognizeCode)
    {
        return;
    }

    self.onScannerDidRecognizeCode(@{
        @"code": code,
        @"codeType": @(codeType)
    });
}

- (void)scanViewControllerDidStartScanning:(id<NSCScanViewController>)scanViewController
{
    if (![self isScanning])
    {
        [self.scanViewController stopScanning];
    }
    if(!self.onScannerStartedScanning)
    {
        return;
    }

    self.onScannerStartedScanning(@{
        @"isScanning": @(YES)
    });
}

- (void)scanViewControllerDidStopScanning:(id<NSCScanViewController>)scanViewController
{
    if(!self.onScannerStoppedScanning)
    {
        return;
    }

    self.onScannerStoppedScanning(@{
        @"isScanning": @(NO)
    });
}

@end
