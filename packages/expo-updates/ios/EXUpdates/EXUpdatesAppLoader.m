//  Copyright © 2018 650 Industries. All rights reserved.

#import <CommonCrypto/CommonDigest.h>

#import <EXUpdates/EXUpdatesAppController.h>
#import <EXUpdates/EXUpdatesAppLoader.h>
#import <EXUpdates/EXUpdatesDatabase.h>
#import <EXUpdates/EXUpdatesFileDownloader.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesAppLoader ()

@property (nonatomic, strong) EXUpdatesFileDownloader *downloader;

@property (nonatomic, strong) NSDictionary *manifest;
@property (nonatomic, strong) NSMutableArray <NSDictionary *>* assetQueue;
@property (nonatomic, assign) BOOL isBundleLoaded;

@end

@implementation EXUpdatesAppLoader

- (instancetype)init
{
  if (self = [super init]) {
    _downloader = [[EXUpdatesFileDownloader alloc] init];
    _isBundleLoaded = NO;
  }
  return self;
}

/**
 * we expect the server to respond with a JSON object with the following fields:
 * id (UUID string)
 * commitTime (timestamp number)
 * binaryVersions (comma separated list - string)
 * bundleUrl (string)
 * metadata (arbitrary object)
 * assets (array of asset objects with `url` and `type` keys)
 */

- (void)loadUpdateFromUrl:(NSURL *)url
{
  [_downloader downloadDataFromURL:url successBlock:^(NSData * data, NSURLResponse * response) {
    NSError *err;
    id manifest = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&err];
    NSAssert(!err && manifest && [manifest isKindOfClass:[NSDictionary class]], @"manifest should be a valid JSON object");

    self->_manifest = (NSDictionary *)manifest;
    [self _writeManifestToDatabase];
    [self _loadBundle];
    [self _addAllAssetTasksToQueues];
  } errorBlock:^(NSError * error, NSURLResponse * response) {
    // TODO: handle error
  }];
}

- (NSUUID *)_updateId
{
  id updateId = _manifest[@"id"];
  NSAssert([updateId isKindOfClass:[NSString class]], @"update ID should be a string");

  NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:(NSString *)updateId];
  NSAssert(uuid, @"update ID should be a valid UUID");

  return uuid;
}

- (void)_writeManifestToDatabase
{
  id commitTime = _manifest[@"commitTime"];
  id binaryVersions = _manifest[@"binaryVersions"];
  id metadata = _manifest[@"metadata"];

  NSAssert([commitTime isKindOfClass:[NSNumber class]], @"commitTime should be a number");
  NSAssert([binaryVersions isKindOfClass:[NSString class]], @"binaryVersions should be a string");
  NSAssert(!metadata || [metadata isKindOfClass:[NSDictionary class]], @"metadata should be null or an object");

  EXUpdatesDatabase *database = [EXUpdatesAppController sharedInstance].database;
  [database addUpdateWithId:[self _updateId]
                 commitTime:(NSNumber *)commitTime
             binaryVersions:(NSString *)binaryVersions
                   metadata:(NSDictionary *)metadata];
}

- (void)_loadBundle
{
  id updateId = _manifest[@"id"];
  id bundleUrlString = _manifest[@"bundleUrl"];
  NSAssert(updateId && [updateId isKindOfClass:[NSString class]], @"update ID should be a nonnull string");
  NSAssert(bundleUrlString && [bundleUrlString isKindOfClass:[NSString class]], @"bundleUrl should be a nonnull string");
  // TODO: check database to make sure we don't already have this downloaded
  NSURL *bundleUrl = [NSURL URLWithString:(NSString *)bundleUrlString];

  NSString *bundleFilename = [NSString stringWithFormat:@"%@-bundle.js", (NSString *)updateId];
  NSURL *bundlePath = [[EXUpdatesAppController updatesDirectory] URLByAppendingPathComponent:bundleFilename];
  [_downloader downloadFileFromURL:bundleUrl toPath:[bundlePath path] successBlock:^(NSData * data, NSURLResponse * response) {
    self->_isBundleLoaded = YES;
    [self _handleAssetDownloadWithData:data
                              response:response
                                 asset:@{
                                         @"url": bundleUrlString,
                                         @"type": @"js"
                                         }
                              filename:bundleFilename
                         isLaunchAsset:YES];
    if (![self->_assetQueue count]) {
      // call some delegate method ready to launch!
    }
  } errorBlock:^(NSError * error, NSURLResponse * response) {
    // TODO: retry. for now log an error
    NSLog(@"error downloading file: %@: %@", bundleUrlString, [error localizedDescription]);
  }];
}

- (void)_addAllAssetTasksToQueues
{
  id assets = _manifest[@"assets"];
  NSAssert(assets && [assets isKindOfClass:[NSArray class]], @"assets should be a nonnull array");

  for (NSDictionary *asset in (NSArray *)assets) {
    NSAssert([asset isKindOfClass:[NSDictionary class]], @"assets must be objects");
    id url = asset[@"url"];
    id type = asset[@"type"];
    NSAssert(url && [url isKindOfClass:[NSString class]], @"asset url should be a nonnull string");
    NSAssert(type && [type isKindOfClass:[NSString class]], @"asset type should be a nonnull string");

    [_assetQueue addObject:asset];
  }

  [self _startAssetDownloads];
}

- (void)_startAssetDownloads
{
  NSURL *directory = [EXUpdatesAppController updatesDirectory];
  for (NSDictionary *asset in _assetQueue) {
    // TODO: check database to make sure we don't already have this downloaded
    NSString *url = asset[@"url"];
    NSAssert(url && [url isKindOfClass:[NSString class]], @"task url should be a string");
    NSString *filename = [self sha1WithData:[url dataUsingEncoding:NSUTF8StringEncoding]];
    [_downloader downloadFileFromURL:[NSURL URLWithString:url] toPath:[[directory URLByAppendingPathComponent:filename] path] successBlock:^(NSData * data, NSURLResponse * response) {
      [self _handleAssetDownloadWithData:data response:response asset:asset filename:filename isLaunchAsset:NO];
    } errorBlock:^(NSError * error, NSURLResponse * response) {
      // TODO: retry. for now log an error
      NSLog(@"error downloading file: %@: %@", url, [error localizedDescription]);
    }];
  }
}

- (void)_handleAssetDownloadWithData:(NSData *)data response:(NSURLResponse *)response asset:(NSDictionary *)asset filename:(NSString *)filename isLaunchAsset:(BOOL)isLaunchAsset
{
  [self->_assetQueue removeObject:asset];
  NSString *contentHash = [self sha1WithData:data];

  NSDictionary *metadata = asset[@"metadata"];
  NSAssert(!metadata || [metadata isKindOfClass:[NSDictionary class]], @"if asset metadata is nonnull, it should be an object");

  NSError *err;
  NSData *metadataJson = [NSJSONSerialization dataWithJSONObject:metadata options:kNilOptions error:&err];
  NSAssert (!err, @"asset metadata should be a valid object");
  NSString *atomicHashString = [NSString stringWithFormat:@"%@-%@-%@",
                                (NSString *)asset[@"type"], [[NSString alloc] initWithData:metadataJson encoding:NSUTF8StringEncoding], contentHash];
  NSString *atomicHash = [self sha1WithData:[atomicHashString dataUsingEncoding:NSUTF8StringEncoding]];

  NSDictionary *headers;
  if ([response isKindOfClass:[NSHTTPURLResponse class]]) {
    headers = [(NSHTTPURLResponse *)response allHeaderFields];
  }

  [[EXUpdatesAppController sharedInstance].database addAssetWithUrl:asset[@"url"]
                                                            headers:headers
                                                               type:asset[@"type"]
                                                           metadata:metadata
                                                       downloadTime:[NSDate date]
                                                       relativePath:filename
                                                         hashAtomic:atomicHash
                                                        hashContent:contentHash
                                                           hashType:0
                                                           updateId:[self _updateId]
                                                      isLaunchAsset:isLaunchAsset];

  if (![self->_assetQueue count]) {
    if (self->_isBundleLoaded) {
      // call some delegate method ready to launch!
    }
  }
}

- (NSString *)sha1WithData:(NSData *)data
{
  uint8_t digest[CC_SHA1_DIGEST_LENGTH];
  CC_SHA1(data.bytes, (CC_LONG)data.length, digest);

  NSMutableString *output = [NSMutableString stringWithCapacity:CC_SHA1_DIGEST_LENGTH * 2];
  for (int i = 0; i < CC_SHA1_DIGEST_LENGTH; i++)
  {
    [output appendFormat:@"%02x", digest[i]];
  }

  return output;
}

@end

NS_ASSUME_NONNULL_END
