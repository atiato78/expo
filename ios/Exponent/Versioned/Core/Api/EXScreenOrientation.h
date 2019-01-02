// Copyright 2015-present 650 Industries. All rights reserved.

#import <React/RCTBridgeModule.h>

#import "EXScopedEventEmitter.h"

@protocol EXScreenOrientationScopedModuleDelegate

- (void)screenOrientationModule:(id)scopedOrientationModule
didChangeSupportedInterfaceOrientations:(UIInterfaceOrientationMask)supportedInterfaceOrientations;

- (UIInterfaceOrientationMask)supportedInterfaceOrientationsForVisibleApp;

- (void)removeOrientationChangeListener:(NSString *) experienceId;

- (void)addOrientationChangeListener:(NSString *) experienceId subscriberModule:(id) subscriberModule;

- (UITraitCollection *) getTraitCollection;

@end

@interface EXScreenOrientation : EXScopedEventEmitter <RCTBridgeModule>

- (void) handleScreenOrientationChange:(nullable UITraitCollection *) traitCollection;

@property (nonatomic, strong) NSMutableSet<NSString *> *activeModules;

@end
