// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXUpdates/EXUpdatesAppController.h>
#import <EXUpdates/EXUpdatesAppLauncher.h>
#import <EXUpdates/EXUpdatesDatabase.h>
#import <EXUpdates/EXUpdatesFileDownloader.h>
#import <EXUpdates/EXUpdatesModule.h>

#import <sqlite3.h>

@interface EXUpdatesModule ()

@property (nonatomic, weak) UMModuleRegistry *moduleRegistry;
@property (nonatomic, assign) sqlite3 *db;

@end

@implementation EXUpdatesModule

UM_EXPORT_MODULE(ExpoUpdates);

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  _moduleRegistry = moduleRegistry;
}

- (NSDictionary *)constantsToExport
{
  EXUpdatesAppController *controller = [EXUpdatesAppController sharedInstance];
  return @{
           @"assets": [controller.database assetsWithUpdateId:[controller.launcher launchedUpdateId]]
           };
}

UM_EXPORT_METHOD_AS(getAssetsAsync,
                    getAssetsAsync:(UMPromiseResolveBlock)resolve
                            reject:(UMPromiseRejectBlock)reject)
{
  EXUpdatesAppController *controller = [EXUpdatesAppController sharedInstance];
  resolve([controller.database assetsWithUpdateId:[controller.launcher launchedUpdateId]]);
}

UM_EXPORT_METHOD_AS(someGreatMethodAsync,
                    options:(NSDictionary *)options
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
}

UM_EXPORT_METHOD_AS(startTest,
                    startTest:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  EXUpdatesDatabase *db = [[EXUpdatesDatabase alloc] init];
  [db openDatabase];
  [db addUpdateWithId:[[NSUUID alloc] initWithUUIDString:@"04a72e51-5a37-4b5c-a1c7-0bd028173ef1"] commitTime:@(1558481270941) binaryVersions:@"1.0" metadata:@{}];
  EXUpdatesFileDownloader *downloader = [[EXUpdatesFileDownloader alloc] init];
  NSString *destinationPath = @"eric.jsbundle";
  NSURL *destinationUrl = [[[self class] applicationDocumentsDirectory] URLByAppendingPathComponent:destinationPath];
  [downloader downloadFileFromURL:[NSURL URLWithString:@"http://localhost:4747/bundle"] toPath:[destinationUrl path] successBlock:^(NSData * _Nonnull data, NSURLResponse * _Nonnull response) {
    [db addAssetWithUrl:@"http://localhost:4747/bundle" downloadTime:[NSDate date] relativePath:destinationPath hash:@"blah" updateId:[[NSUUID alloc] initWithUUIDString:@"04a72e51-5a37-4b5c-a1c7-0bd028173ef1"] isLaunchAsset:YES];
    [db closeDatabase];
  } errorBlock:^(NSError * _Nonnull error, NSURLResponse * _Nonnull response) {
    NSLog(@"Error downloading file");
    [db closeDatabase];
  }];
//  NSLog(@"path is %@", [[db launchAssetUrl] absoluteString]);
//  [db closeDatabase];
}

UM_EXPORT_METHOD_AS(openDatabase,
                    openDatabase:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  NSDate *methodStart = [NSDate date];
  sqlite3 *db;
  NSURL *path = [[NSBundle mainBundle] URLForResource:@"test" withExtension:@"sqlite"];
  if (sqlite3_open([[path absoluteString] UTF8String], &db) == SQLITE_OK) {
    _db = db;
  }
  NSDate *methodFinish = [NSDate date];
  NSTimeInterval executionTime = [methodFinish timeIntervalSinceDate:methodStart];
  NSLog(@"executionTime = %f ms", executionTime * 1000);
}

UM_EXPORT_METHOD_AS(closeDatabase,
                    closeDatabase:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  sqlite3_close(_db);
  _db = nil;
}


UM_EXPORT_METHOD_AS(testDatabase,
                    testDatabase:(NSString *)query
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  if (!_db) {
    NSLog(@"no database open!");
    return;
  }
  sqlite3_stmt *stmt;
  int count = 0;

  NSDate *methodStart = [NSDate date];
  if (sqlite3_prepare_v2(_db, [query UTF8String], -1, &stmt, NULL) == SQLITE_OK) {
    BOOL hasMore = YES;
    int result;
    while (hasMore) {
      result = sqlite3_step(stmt);
      switch (result) {
        case SQLITE_ROW:
          count++;
          break;
        case SQLITE_DONE:
          hasMore = NO;
          break;
        default:
          hasMore = NO;
          break;
      }
    }
  }
  NSDate *methodFinish = [NSDate date];
  NSTimeInterval executionTime = [methodFinish timeIntervalSinceDate:methodStart];
  NSLog(@"executionTime = %f ms; rows = %i", executionTime * 1000, count);
  
  sqlite3_finalize(stmt);
}

+ (NSURL *)applicationDocumentsDirectory
{
  return [[[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] lastObject];
}

@end
