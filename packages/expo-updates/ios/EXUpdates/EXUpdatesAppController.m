//  Copyright © 2018 650 Industries. All rights reserved.

#import <UIKit/UIKit.h>

#import <EXUpdates/EXUpdatesConfig.h>
#import <EXUpdates/EXUpdatesAppController.h>
#import <EXUpdates/EXUpdatesAppLoaderEmbedded.h>
#import <EXUpdates/EXUpdatesAppLoaderRemote.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesAppController ()

@property (nonatomic, readwrite, strong) EXUpdatesAppLauncher *launcher;
@property (nonatomic, readwrite, strong) EXUpdatesDatabase *database;

@property (nonatomic, readonly, strong) EXUpdatesAppLoaderRemote *remoteAppLoader;

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

- (void)start
{
  [self _copyEmbeddedAssets];
  [_launcher launchUpdate];

  _remoteAppLoader = [[EXUpdatesAppLoaderRemote alloc] init];
  _remoteAppLoader.delegate = self;
  [_remoteAppLoader loadUpdateFromUrl:[EXUpdatesConfig sharedInstance].remoteUrl];
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

# pragma mark - internal

- (void)_copyEmbeddedAssets
{
  EXUpdatesAppLoaderEmbedded *embeddedAppLoader = [[EXUpdatesAppLoaderEmbedded alloc] init];
  [embeddedAppLoader loadUpdateFromEmbeddedManifest];
}

# pragma mark - EXUpdatesAppLoaderDelegate

- (void)appLoader:(EXUpdatesAppLoader *)appLoader didStartLoadingUpdateWithMetadata:(NSDictionary * _Nullable)metadata
{
  // maybe do something?
  NSLog(@"update started loading");
}

- (void)appLoader:(EXUpdatesAppLoader *)appLoader didFinishLoadingUpdateWithId:(NSUUID *)updateId
{
  // maybe do something?
  NSLog(@"update with UUID %@ finished loading", [updateId UUIDString]);
}

- (void)appLoader:(EXUpdatesAppLoader *)appLoader didFailWithError:(NSError *)error
{
  // probably do something
  NSLog(@"update failed to load: %@", [error localizedDescription]);
}

# pragma mark - utils

+ (NSURL *)updatesDirectory
{
  NSFileManager *fileManager = NSFileManager.defaultManager;
  NSURL *applicationDocumentsDirectory = [[fileManager URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] lastObject];
  NSURL *updatesDirectory = [applicationDocumentsDirectory URLByAppendingPathComponent:@".expo-updates"];
  NSString *updatesDirectoryPath = [updatesDirectory path];

  BOOL isDir;
  BOOL exists = [fileManager fileExistsAtPath:updatesDirectoryPath isDirectory:&isDir];
  if (!exists || !isDir) {
    if (!isDir) {
      NSError *err;
      BOOL wasRemoved = [fileManager removeItemAtPath:updatesDirectoryPath error:&err];
      if (!wasRemoved) {
        // TODO: handle error
      }
    }
    NSError *err;
    BOOL wasCreated = [fileManager createDirectoryAtPath:updatesDirectoryPath withIntermediateDirectories:YES attributes:nil error:&err];
    if (!wasCreated) {
      // TODO: handle error
    }
  }
  return updatesDirectory;
}

@end

NS_ASSUME_NONNULL_END
