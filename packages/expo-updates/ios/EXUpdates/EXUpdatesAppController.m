//  Copyright © 2018 650 Industries. All rights reserved.

#import <UIKit/UIKit.h>

#import <EXUpdates/EXUpdatesAppController.h>

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesAppController ()

@property (nonatomic, readwrite, strong) EXUpdatesAppLauncher *launcher;
@property (nonatomic, readwrite, strong) EXUpdatesDatabase *database;

@end

@implementation EXUpdatesAppController

+ (instancetype)sharedInstance
{
  static EXUpdatesAppController *theController;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    if (!theController) {
      theController = [[EXUpdatesAppController alloc] init];
    }
  });
  return theController;
}

- (instancetype)init
{
  if (self = [super init]) {
    _launcher = [[EXUpdatesAppLauncher alloc] init];
    _database = [[EXUpdatesDatabase alloc] init];
    [_database openDatabase];
  }
  return self;
}

- (NSURL *)launchAssetUrl
{
  return [_database launchAssetUrlWithUpdateId:[_launcher launchedUpdateId]];
}

- (void)handleErrorWithDomain:(NSString *)errorDomain
                  description:(NSString *)description
                         info:(NSDictionary * _Nullable)info
                      isFatal:(BOOL)isFatal
{
  // do something!!!!
}

@end

NS_ASSUME_NONNULL_END
