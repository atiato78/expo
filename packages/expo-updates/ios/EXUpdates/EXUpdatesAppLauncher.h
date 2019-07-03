//  Copyright © 2018 650 Industries. All rights reserved.

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesAppLauncher : NSObject

- (NSDictionary *)launchedUpdate;
- (NSUUID *)launchedUpdateId;

@end

NS_ASSUME_NONNULL_END
