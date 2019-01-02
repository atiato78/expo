// Copyright 2015-present 650 Industries. All rights reserved.

#import "EXScreenOrientation.h"

@interface EXScreenOrientationManager : NSObject <EXScreenOrientationScopedModuleDelegate>

- (void)setSupportInterfaceOrientations:(UIInterfaceOrientationMask)supportedInterfaceOrientations
                         forExperienceId:(NSString *)experienceId;

- (void) handleScreenOrientationChange: (nullable UITraitCollection *) traitCollection;

- (UITraitCollection *) getTraitCollection;

// should this be weak?
@property (nonatomic, strong) NSMapTable<NSString *, id> *subscribedModules;

- (UIInterfaceOrientationMask) supportedInterfaceOrientationsForVisibleApp;

@end
