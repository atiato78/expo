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

@implementation RCTConvert (OrientationLock)
RCT_ENUM_CONVERTER(EXOrientationLock, (@{ @"DEFAULT" : @(DEFAULT),
                                          @"ALL" : @(ALL),
                                          @"PORTRAIT" : @(PORTRAIT),
                                          @"PORTRAIT_UP" : @(PORTRAIT_UP),
                                          @"PORTRAIT_DOWN" : @(PORTRAIT_DOWN),
                                          @"LANDSCAPE" : @(LANDSCAPE),
                                          @"LANDSCAPE_LEFT" : @(LANDSCAPE_LEFT),
                                          @"LANDSCAPE_RIGHT" : @(LANDSCAPE_RIGHT),
                                          @"OTHER" : @(OTHER)
                                          }),
                   DEFAULT, integerValue)
@end

@implementation EXScreenOrientation

bool hasListeners;

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
  UIInterfaceOrientationMask orientationMask = [self orientationLockJSToNative:orientationLock];
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
  resolve([self orientationLockNativeToJS:orientationMask]);
}

// TODO: this should map orientations, not locks
RCT_REMAP_METHOD(getPlatformOrientationLockAsync,
                 getPlatformOrientationLockAsyncResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  UIInterfaceOrientationMask orientationMask = [_kernelOrientationServiceDelegate supportedInterfaceOrientationsForVisibleApp];
  UIInterfaceOrientationMask orientations[] = {
    UIInterfaceOrientationMaskPortrait,
    UIInterfaceOrientationMaskPortraitUpsideDown,
    UIInterfaceOrientationMaskLandscapeLeft,
    UIInterfaceOrientationMaskLandscapeRight
  };
  
  // If the particular orientation is supported, we add it to the array of allowedOrientations
  NSMutableArray * allowedOrientations = [[NSMutableArray alloc] init];
  for (int i = 0; i < sizeof(orientations)/sizeof(orientations[0]); ++i) {
    UIInterfaceOrientationMask orientation = orientations[i];
    UIInterfaceOrientationMask supportedOrientation = orientationMask & orientation;
    if (supportedOrientation == orientation){
      [allowedOrientations addObject:[self orientationLockNativeToJS: (UIInterfaceOrientationMask) orientation]];
    }
  }
  resolve([allowedOrientations copy]);
}

RCT_EXPORT_METHOD(lockPlatformAsync:(NSArray *)allowedOrientations
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  // combine all the allowedOrientations into one bitmask
  UIInterfaceOrientationMask allowedOrientationsMask = 0;
  for (NSString *allowedOrientation in allowedOrientations ){
    UIInterfaceOrientationMask orientationMask = [self orientationLockJSToNative: allowedOrientation];
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
  UIInterfaceOrientationMask orientationMask = [self orientationLockJSToNative:orientationLock];
  if (orientationMask == INVALID_MASK) {
    resolve(@NO);
  } else if ([self doesSupportOrientationMask:orientationMask]) {
    resolve(@YES);
  } else {
    resolve(@NO);
  }
}

RCT_REMAP_METHOD(getOrientationAsync,
                 getOrientationAsyncResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  UITraitCollection * traitCollection = [_kernelOrientationServiceDelegate getTraitCollection];
  resolve([self getOrientationInformation:traitCollection]);
}

// Will be called when this module's first listener is added.
-(void)startObserving {
  hasListeners = YES;
  [_kernelOrientationServiceDelegate addOrientationChangeListener:self.experienceId subscriberModule:self];
}

// Will be called when this module's last listener is removed, or on dealloc.
-(void)stopObserving {
  hasListeners = NO;
  [_kernelOrientationServiceDelegate removeOrientationChangeListener:self.experienceId];
}

- (void) handleScreenOrientationChange: (UITraitCollection *)traitCollection {
  
  UIInterfaceOrientationMask orientationMask = [_kernelOrientationServiceDelegate supportedInterfaceOrientationsForVisibleApp];
  if (hasListeners) {
    [self sendEventWithName:@"expoDidUpdateDimensions" body:@{
                                                              @"orientationInfo": [self getOrientationInformation:traitCollection],
                                                              @"orientationLock": [self orientationLockNativeToJS:orientationMask]
                                                              }];
  }
}

- (NSDictionary *) getOrientationInformation: (UITraitCollection *)traitCollection {
  NSString * orientation = [self traitCollectionToOrientation:traitCollection];
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

- (NSString *) traitCollectionToOrientation: (UITraitCollection *) traitCollection
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

- (NSString *) orientationLockNativeToJS:(UIInterfaceOrientationMask) orientationMask
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

- (UIInterfaceOrientationMask) orientationLockJSToNative:(NSString *)orientationLock
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
