//
//  NSCScanViewController.h
//  NewStoreScanKit
//
//  Created by Marcel Dierkes on 28.07.17.
//  Copyright © 2017 NewStore. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "NSCScanViewControllerDelegate.h"
#import "NSCCodeTypes.h"
#import "NSCTorchMode.h"

NS_ASSUME_NONNULL_BEGIN

/**
 Describes a scan view controller with various properties that control
 camera behavior, pause/resume handling and delegation.
 */
@protocol NSCScanViewController <NSObject>

/**
 The code types that will be recognized by the scan view controller.
 */
@property (nonatomic, readonly) NSCCodeTypes codeTypes;

/**
 The torch mode of the camera, defaults to .auto
 */
@property (nonatomic) NSCTorchMode torchMode;

/**
 If this property is set to YES, the `delegate` won't be notified about
 detected codes. Defaults to NO.
 */
@property (nonatomic, getter=isPaused) BOOL paused;

/**
 Returns the current scan status. If this returns false, use `startScanning` to
 begin the scanning process.
 */
@property (nonatomic, readonly, getter=isScanning) BOOL scanning;

/**
 If this is set to YES, continuously discovered codes won't be reported to the delegate.
 
 @note This value can only be altered when the scanner view controller hasn't been presented yet.
 
 This property is set to YES by default.
 */
@property (nonatomic, getter=isResultCacheEnabled) BOOL resultCacheEnabled;

/**
 Enables various debug features, depending on the underlying scanning framework, don't
 enable this in production code.
 */
@property (nonatomic, getter=isDebugModeEnabled) BOOL debugModeEnabled;

/**
 A delegate that will receive scanned codes and change events when the scanning
 process starts or stops.
 */
@property (weak, nonatomic, nullable) id<NSCScanViewControllerDelegate> delegate;

/**
 Starts the scanning process, detected codes will be delivered to the `delegate`.
 */
- (void)startScanning;

/**
 Stops the scanning process.
 */
- (void)stopScanning;

@end

/**
 A general purpose scan view controller for barcodes, QR codes, etc.
 */
@interface NSCScanViewController : UIViewController <NSCScanViewController>

/**
 The code types that will be recognized by the scan view controller.
 */
@property (nonatomic, readonly) NSCCodeTypes codeTypes;

/**
 The torch mode of the camera, defaults to .auto
 */
@property (nonatomic) NSCTorchMode torchMode;

/**
 If this property is set to YES, the `delegate` won't be notified about
 detected codes. Defaults to NO.
 */
@property (nonatomic, getter=isPaused) BOOL paused;

/**
 Returns the current scan status. If this returns false, use `startScanning` to
 begin the scanning process.
 */
@property (nonatomic, readonly, getter=isScanning) BOOL scanning;

/**
 When set to YES, the torchMode will be set to NSCTorchModeOn.
 In case it is set to NO, the torchMode will get the default value NSCTorchModeAuto.
 */
@property (nonatomic, getter=isTorchToggleHidden) BOOL torchToggleHidden;

/**
 If this is set to YES, continuously-discovered codes won't be reported to the delegate.
 
 @note This value can only be altered when the scanner view controller hasn't been presented yet.
 
 This property is set to YES by default.
 */
@property (nonatomic, getter=isResultCacheEnabled) BOOL resultCacheEnabled;

/**
 Shows a unintrusive crosshair above the camera layer while scanning.
 */
@property (nonatomic, getter=isCrosshairEnabled) BOOL crosshairEnabled;

/**
 Enables various debug features, depending on the underlying scanning framework, don't
 enable this in production code.
 */
@property (nonatomic, getter=isDebugModeEnabled) BOOL debugModeEnabled;

/**
 A delegate that will receive scanned codes and change events when the scanning
 process starts or stops.
 */
@property (weak, nonatomic, nullable) id<NSCScanViewControllerDelegate> delegate;

- (instancetype)init NS_UNAVAILABLE;

/**
 Initializes the view controller with a set of code types that can be recognized.

 @param codeTypes Code types used while scanning for detecting codes.
 @return A new instance.
 */
- (instancetype)initWithCodeTypes:(NSCCodeTypes)codeTypes NS_DESIGNATED_INITIALIZER;

/**
 Starts the scanning process, detected codes will be delivered to the `delegate`.
 
 Calling this method will reset `paused` to NO.
 
 @note Subclasses should override this method and call super.
 */
- (void)startScanning NS_REQUIRES_SUPER;

/**
 Stops the scanning process.
 
 @note Subclasses should override this method without calling super.
 */
- (void)stopScanning;

/**
 Animates the crosshair (if visible) for an invalid scan result.
 Optionally, this can vibrate the taptic engine of the device.

 @param vibrate Vibrate the device.
 @param completion An optional animation completion handler
 */
- (void)flashCrosshairForInvalidResultWithVibration:(BOOL)vibrate
                                         completion:(void (^_Nullable)(void))completion;

@end

NS_ASSUME_NONNULL_END
