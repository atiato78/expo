//  Copyright © 2018 650 Industries. All rights reserved.

#import <React/RCTBridgeDelegate.h>
#import <EXUpdates/EXUpdatesAppLauncher.h>
#import <EXUpdates/EXUpdatesDatabase.h>

NS_ASSUME_NONNULL_BEGIN

@protocol EXUpdatesAppControllerDelegate <NSObject>

- (NSArray<id<RCTBridgeModule>> *)extraModulesForBridge:(RCTBridge *)bridge;

@end

@interface EXUpdatesAppController : NSObject <RCTBridgeDelegate>

@property (nonatomic, weak) id<EXUpdatesAppControllerDelegate> delegate;
@property (nonatomic, readonly) EXUpdatesAppLauncher *launcher;
@property (nonatomic, readonly) EXUpdatesDatabase *database;

+ (instancetype)sharedInstance;
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions;

- (void)handleErrorWithDomain:(NSString *)errorDomain
                  description:(NSString *)description
                         info:(NSDictionary * _Nullable)info
                      isFatal:(BOOL)isFatal;

@end

NS_ASSUME_NONNULL_END
