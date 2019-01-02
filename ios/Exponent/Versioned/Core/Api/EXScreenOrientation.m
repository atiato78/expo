// Copyright 2015-present 650 Industries. All rights reserved.

#import "EXScreenOrientation.h"
#import "EXScopedModuleRegistry.h"

#import <UIKit/UIKit.h>
#import <sys/utsname.h>
#import "React/RCTAccessibilityManager.h"

@interface EXScreenOrientation ()

@property (nonatomic, weak) id<EXScreenOrientationScopedModuleDelegate> kernelOrientationServiceDelegate;

@end

static int INVALID_MASK = 0;

@implementation EXScreenOrientation

EX_EXPORT_SCOPED_MODULE(ExpoScreenOrientation, ScreenOrientationManager);

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (instancetype)initWithExperienceId:(NSString *)experienceId
               kernelServiceDelegate:(id)kernelServiceInstance
                              params:(NSDictionary *)params
{
  if (self = [super initWithExperienceId:experienceId kernelServiceDelegate:kernelServiceInstance params:params]) {
    _kernelOrientationServiceDelegate = kernelServiceInstance;
  }
  return self;
}

RCT_EXPORT_METHOD(lockAsync:(NSString *)orientationLock
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  UIInterfaceOrientationMask orientationMask = [self orientationMaskFromOrientationLock:orientationLock];
  if (orientationMask == INVALID_MASK) {
    return reject(@"E_INVALID_ORIENTATION", [NSString stringWithFormat:@"Invalid screen orientation lock %@", orientationLock], nil);
  }
  if (![self doesSupportOrientationMask:orientationMask]) {
    return reject(@"E_UNSUPPORTED_ORIENTATION", [NSString stringWithFormat:@"This device does not support this orientation %@", orientationLock], nil);
  }
  [_kernelOrientationServiceDelegate screenOrientationModule:self
                     didChangeSupportedInterfaceOrientations:orientationMask];
  resolve(nil);
}

RCT_REMAP_METHOD(unlockAsync,
                  unlockAsyncWithResolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [self lockAsync:@"DEFAULT" resolver:resolve rejecter:reject];
}

RCT_REMAP_METHOD(getOrientationLockAsync,
                 getOrientationLockAsyncWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  UIInterfaceOrientationMask orientationMask = [_kernelOrientationServiceDelegate supportedInterfaceOrientationsForVisibleApp];
  resolve([self orientationLockFromOrientationMask:orientationMask]);
}

RCT_EXPORT_METHOD(lockPlatformAsync:(NSArray *)allowedOrientations
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  // combine all the allowedOrientations into one bitmask
  UIInterfaceOrientationMask allowedOrientationsMask = 0;
  for (NSString *allowedOrientation in allowedOrientations ){
    UIInterfaceOrientationMask orientationMask = [self orientationMaskFromOrientationLock: allowedOrientation];
    allowedOrientationsMask = allowedOrientationsMask | orientationMask;
  }
  
  [_kernelOrientationServiceDelegate screenOrientationModule:self
                     didChangeSupportedInterfaceOrientations:allowedOrientationsMask];
  resolve(nil);
}

RCT_EXPORT_METHOD(doesSupportAsync:(NSString *)orientationLock
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [self supportsOrientationLockAsync:orientationLock resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(supportsOrientationLockAsync:(NSString *)orientationLock
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  UIInterfaceOrientationMask orientationMask = [self orientationMaskFromOrientationLock:orientationLock];
  if (orientationMask == INVALID_MASK) {
    resolve(@NO);
  } else if ([self doesSupportOrientationMask:orientationMask]) {
    resolve(@YES);
  } else {
    resolve(@NO);
  }
}

RCT_REMAP_METHOD(addOrientationChangeListener,
                  addOrientationChangeListenerResolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [_kernelOrientationServiceDelegate addOrientationChangeListener:self.experienceId subscriberModule:self];
  resolve(nil);
}

RCT_REMAP_METHOD(removeOrientationChangeListener,
                 removeOrientationChangeListenerResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  [_kernelOrientationServiceDelegate removeOrientationChangeListener:self.experienceId];
  resolve(nil);
}

RCT_REMAP_METHOD(getOrientationAsync,
                 getUIOrientationAsyncResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  UITraitCollection * traitCollection = [_kernelOrientationServiceDelegate getTraitCollection];
  resolve([self getOrientationInformation:traitCollection]);
}

- (void) handleScreenOrientationChange: (UITraitCollection *)traitCollection {
  
  UIInterfaceOrientationMask orientationMask = [_kernelOrientationServiceDelegate supportedInterfaceOrientationsForVisibleApp];
  
  [self sendEventWithName:@"expoDidUpdateDimensions" body:@{
                                                        @"orientationInfo": [self getOrientationInformation:traitCollection],
                                                        @"orientationLock": [self orientationLockFromOrientationMask:orientationMask]
                                                        }];
}

- (NSDictionary *) getOrientationInformation: (UITraitCollection *)traitCollection {
  NSString * orientation = [self orientationFromTraitCollection:traitCollection];
  return @{
            @"orientation": orientation,
            @"verticalSizeClass": [self sizeClassToString: traitCollection.verticalSizeClass],
            @"horizontalSizeClass": [self sizeClassToString: traitCollection.horizontalSizeClass]
            };
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"expoDidUpdateDimensions", @"expoDidUpdatePhysicalDimensions"];
}

- (BOOL)doesSupportOrientationMask:(UIInterfaceOrientationMask)orientationMask
{
  if ((UIInterfaceOrientationMaskPortraitUpsideDown & orientationMask) // UIInterfaceOrientationMaskPortraitUpsideDown is part of orientationMask
      && ![self doesDeviceSupportOrientationPortraitUpsideDown])
  {
    // device does not support UIInterfaceOrientationMaskPortraitUpsideDown and it was requested via orientationMask
    return FALSE;
  }
  
  return TRUE;
}

- (BOOL)doesDeviceSupportOrientationPortraitUpsideDown
{
  struct utsname systemInfo;
  uname(&systemInfo);
  NSString *deviceIdentifier = [NSString stringWithCString:systemInfo.machine
                                                  encoding:NSUTF8StringEncoding];
  return ![self doesDeviceHaveNotch:deviceIdentifier];
}
- (BOOL)doesDeviceHaveNotch:(NSString *)deviceIdentifier
{
  NSArray<NSString *> *devicesWithNotchIdentifiers = @[
                                                       @"iPhone10,3", // iPhoneX
                                                       @"iPhone10,6", // iPhoneX
                                                       @"iPhone11,2", // iPhoneXs
                                                       @"iPhone11,6", // iPhoneXsMax
                                                       @"iPhone11,4", // iPhoneXsMax
                                                       @"iPhone11,8", // iPhoneXr
                                                       ];
  NSArray<NSString *> *simulatorsIdentifiers = @[
                                                 @"i386",
                                                 @"x86_64",
                                                 ];
  
  if ([devicesWithNotchIdentifiers containsObject:deviceIdentifier]) {
    return YES;
  }
  
  if ([simulatorsIdentifiers containsObject:deviceIdentifier]) {
    return [self doesDeviceHaveNotch:[[[NSProcessInfo processInfo] environment] objectForKey:@"SIMULATOR_MODEL_IDENTIFIER"]];
  }
  return NO;
}

- (NSString *) sizeClassToString: (UIUserInterfaceSizeClass) sizeClass
{
  if (sizeClass == UIUserInterfaceSizeClassCompact){
    return @"COMPACT";
  } else if (sizeClass == UIUserInterfaceSizeClassRegular){
    return @"REGULAR";
  } else {
    return @"UNSPECIFIED";
  }
}

- (NSString *) orientationFromTraitCollection: (UITraitCollection *) traitCollection
{
  UIUserInterfaceSizeClass verticalSizeClass = traitCollection.verticalSizeClass;
  UIUserInterfaceSizeClass horizontalSizeClass = traitCollection.horizontalSizeClass;
  
  if (verticalSizeClass == UIUserInterfaceSizeClassRegular && horizontalSizeClass == UIUserInterfaceSizeClassCompact){
    return @"PORTRAIT";
  } else if (verticalSizeClass == UIUserInterfaceSizeClassCompact && horizontalSizeClass == UIUserInterfaceSizeClassCompact){
    return @"LANDSCAPE";
  } else if (verticalSizeClass == UIUserInterfaceSizeClassCompact && horizontalSizeClass == UIUserInterfaceSizeClassRegular) {
    return @"LANDSCAPE"; // iPhone 7 plus
  } else {
    return @"UNKNOWN";
  }
}

- (NSString *) orientationFromUIDeviceOrientation: (UIDeviceOrientation) uiDeviceOrientation
{
  if (uiDeviceOrientation == UIDeviceOrientationLandscapeLeft) {
    return @"LANDSCAPE_LEFT";
  } else if (uiDeviceOrientation == UIDeviceOrientationLandscapeRight) {
    return @"LANDSCAPE_RIGHT";
  } else if (uiDeviceOrientation == UIDeviceOrientationPortrait) {
    return @"PORTRAIT_UP";
  } else if (uiDeviceOrientation == UIDeviceOrientationPortraitUpsideDown) {
    return @"PORTRAIT_DOWN";
  } else {
    return @"UNKNOWN";
  }
}

- (NSString *) orientationLockFromOrientationMask:(UIInterfaceOrientationMask) orientationMask
{
  if (orientationMask == UIInterfaceOrientationMaskAllButUpsideDown){
    return @"DEFAULT";
  } else if (orientationMask == UIInterfaceOrientationMaskAll) {
    return @"ALL";
  } else if (orientationMask == (UIInterfaceOrientationMaskPortrait | UIInterfaceOrientationMaskPortraitUpsideDown)) {
    return @"PORTRAIT";
  } else if (orientationMask == UIInterfaceOrientationMaskPortrait) {
    return @"PORTRAIT_UP";
  } else if (orientationMask == UIInterfaceOrientationMaskPortraitUpsideDown) {
    return @"PORTRAIT_DOWN";
  } else if (orientationMask == UIInterfaceOrientationMaskLandscape) {
    return @"LANDSCAPE";
  } else if (orientationMask == UIInterfaceOrientationMaskLandscapeLeft) {
    return @"LANDSCAPE_LEFT";
  } else if (orientationMask == UIInterfaceOrientationMaskLandscapeRight) {
    return @"LANDSCAPE_RIGHT";
  } else {
    return @"OTHER";
  }
}

- (UIInterfaceOrientationMask) orientationMaskFromOrientationLock:(NSString *)orientationLock
{
  if ([orientationLock isEqualToString:@"DEFAULT"]) {
    return UIInterfaceOrientationMaskAllButUpsideDown; // Should be all but upside down?
  } else if ([orientationLock isEqualToString:@"ALL"]) {
    return UIInterfaceOrientationMaskAll;
  } else if ([orientationLock isEqualToString:@"PORTRAIT"]) {
    return UIInterfaceOrientationMaskPortrait | UIInterfaceOrientationMaskPortraitUpsideDown;
  } else if ([orientationLock isEqualToString:@"PORTRAIT_UP"]) {
    return UIInterfaceOrientationMaskPortrait;
  } else if ([orientationLock isEqualToString:@"PORTRAIT_DOWN"]) {
    return UIInterfaceOrientationMaskPortraitUpsideDown;
  } else if ([orientationLock isEqualToString:@"LANDSCAPE"]) {
    return UIInterfaceOrientationMaskLandscape;
  } else if ([orientationLock isEqualToString:@"LANDSCAPE_LEFT"]) {
    return UIInterfaceOrientationMaskLandscapeLeft;
  } else if ([orientationLock isEqualToString:@"LANDSCAPE_RIGHT"]) {
    return UIInterfaceOrientationMaskLandscapeRight;
  } else if ([orientationLock isEqualToString:@"ALL_BUT_UPSIDE_DOWN"]) { // legacy
    return UIInterfaceOrientationMaskAllButUpsideDown;
  }else {
    return INVALID_MASK;
  }
}

@end
