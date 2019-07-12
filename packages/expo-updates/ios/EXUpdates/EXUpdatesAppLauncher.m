//  Copyright © 2018 650 Industries. All rights reserved.

#import <EXUpdates/EXUpdatesAppController.h>
#import <EXUpdates/EXUpdatesAppLauncher.h>
#import <EXUpdates/EXUpdatesDatabase.h>
#import <EXUpdates/EXUpdatesSelectionPolicy.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesAppLauncher ()

@property (nonatomic, strong) NSDictionary *launchedUpdate;

@end

static NSString* kEXUpdatesAppLauncherErrorDomain = @"AppLauncher";

@implementation EXUpdatesAppLauncher

- (NSDictionary *)launchUpdate
{
  if (!_launchedUpdate) {
    EXUpdatesDatabase *database = [EXUpdatesAppController sharedInstance].database;
    NSArray <NSDictionary *>* launchableUpdates = [database launchableUpdates];
    _launchedUpdate = [EXUpdatesSelectionPolicy runnableUpdateFromUpdates:launchableUpdates];
    if (!_launchedUpdate) {
      [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesAppLauncherErrorDomain description:@"No runnable update found" info:nil isFatal:YES];
    }
  }
  return _launchedUpdate;
}

- (NSUUID *)launchedUpdateId
{
  if (!_launchedUpdate) {
    [self launchedUpdate];
  }
  return _launchedUpdate[@"id"];
}

@end

NS_ASSUME_NONNULL_END
