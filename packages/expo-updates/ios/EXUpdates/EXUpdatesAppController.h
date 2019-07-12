//  Copyright © 2018 650 Industries. All rights reserved.

#import <EXUpdates/EXUpdatesAppLauncher.h>
#import <EXUpdates/EXUpdatesDatabase.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesAppController : NSObject

@property (nonatomic, readonly) EXUpdatesAppLauncher *launcher;
@property (nonatomic, readonly) EXUpdatesDatabase *database;

+ (instancetype)sharedInstance;

- (void)start;

- (NSURL *)launchAssetUrl;
+ (NSURL *)updatesDirectory;

- (void)handleErrorWithDomain:(NSString *)errorDomain
                  description:(NSString *)description
                         info:(NSDictionary * _Nullable)info
                      isFatal:(BOOL)isFatal;

@end

NS_ASSUME_NONNULL_END
