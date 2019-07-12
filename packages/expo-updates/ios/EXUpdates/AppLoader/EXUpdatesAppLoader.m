//  Copyright © 2018 650 Industries. All rights reserved.

#import <CommonCrypto/CommonDigest.h>

#import <EXUpdates/EXUpdatesAppController.h>
#import <EXUpdates/EXUpdatesAppLoader+Private.h>
#import <EXUpdates/EXUpdatesDatabase.h>
#import <EXUpdates/EXUpdatesFileDownloader.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesAppLoader ()

@property (nonatomic, strong) NSMutableArray<EXUpdatesAsset *>* assetQueue;

@end

@implementation EXUpdatesAppLoader

/**
 * we expect the server to respond with a JSON object with the following fields:
 * id (UUID string)
 * commitTime (timestamp number)
 * binaryVersions (comma separated list - string)
 * bundleUrl (string)
 * metadata (arbitrary object)
 * assets (array of asset objects with `url` and `type` keys)
 */

# pragma mark - subclass methods

- (void)loadUpdateFromUrl:(NSURL *)url
{
  @throw [NSException exceptionWithName:NSInternalInconsistencyException reason:@"Should not call EXUpdatesAppLoader#loadUpdate -- use a subclass instead" userInfo:nil];
}

- (void)downloadAsset:(EXUpdatesAsset *)asset
{
  @throw [NSException exceptionWithName:NSInternalInconsistencyException reason:@"Should not call EXUpdatesAppLoader#loadUpdate -- use a subclass instead" userInfo:nil];
}

# pragma mark - loading and database logic

- (void)writeManifestToDatabase
{
  [self _lockDatabase];
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

- (void)startAssetDownloads
{
  [self _addBundleTaskToQueue];
  [self _addAllAssetTasksToQueues];

  for (EXUpdatesAsset *asset in _assetQueue) {
    // TODO: check database to make sure we don't already have this downloaded
    [self downloadAsset:asset];
  }
}

- (void)handleAssetDownloadWithError:(NSError *)error asset:(EXUpdatesAsset *)asset
{
  // TODO: retry. for now log an error
  NSLog(@"error downloading file: %@: %@", [asset.url absoluteString], [error localizedDescription]);
  [_assetQueue removeObject:asset];
  if (![self->_assetQueue count]) {
    // call error method
    [self _unlockDatabase];
  }
}

- (void)handleAssetDownloadWithData:(NSData *)data response:(NSURLResponse * _Nullable)response asset:(EXUpdatesAsset *)asset
{
  [self->_assetQueue removeObject:asset];
  NSString *contentHash = [self _sha1WithData:data];

  NSError *err;
  NSDictionary *metadata = asset.metadata;
  if (!metadata) {
    metadata = @{};
  }
  NSData *metadataJson = [NSJSONSerialization dataWithJSONObject:metadata options:kNilOptions error:&err];
  NSAssert (!err, @"asset metadata should be a valid object");
  NSString *atomicHashString = [NSString stringWithFormat:@"%@-%@-%@",
                                asset.type, [[NSString alloc] initWithData:metadataJson encoding:NSUTF8StringEncoding], contentHash];
  NSString *atomicHash = [self _sha1WithData:[atomicHashString dataUsingEncoding:NSUTF8StringEncoding]];

  NSDictionary *headers;
  if (response && [response isKindOfClass:[NSHTTPURLResponse class]]) {
    headers = [(NSHTTPURLResponse *)response allHeaderFields];
  }

  [[EXUpdatesAppController sharedInstance].database addAssetWithUrl:[asset.url absoluteString]
                                                            headers:headers
                                                               type:asset.type
                                                           metadata:asset.metadata
                                                       downloadTime:[NSDate date]
                                                       relativePath:asset.filename
                                                         hashAtomic:atomicHash
                                                        hashContent:contentHash
                                                           hashType:0
                                                           updateId:[self _updateId]
                                                      isLaunchAsset:asset.isLaunchAsset];

  if (![self->_assetQueue count]) {
    // call some delegate method ready to launch!
    [self _unlockDatabase];
  }
}

# pragma mark - internal

- (void)_addBundleTaskToQueue
{
  id bundleUrlString = _manifest[@"bundleUrl"];
  NSAssert(bundleUrlString && [bundleUrlString isKindOfClass:[NSString class]], @"bundleUrl should be a nonnull string");
  // TODO: check database to make sure we don't already have this downloaded
  
  EXUpdatesAsset *asset = [[EXUpdatesAsset alloc] init];
  asset.url = [NSURL URLWithString:bundleUrlString];
  asset.type = @"js";
  asset.isLaunchAsset = YES;

  NSString *filename = [self _sha1WithData:[bundleUrlString dataUsingEncoding:NSUTF8StringEncoding]];
  asset.filename = filename;
  
  [_assetQueue addObject:asset];
}

- (void)_addAllAssetTasksToQueues
{
  id assets = _manifest[@"assets"];
  NSAssert(assets && [assets isKindOfClass:[NSArray class]], @"assets should be a nonnull array");
  
  for (NSDictionary *asset in (NSArray *)assets) {
    NSAssert([asset isKindOfClass:[NSDictionary class]], @"assets must be objects");
    id url = asset[@"url"];
    id type = asset[@"type"];
    id metadata = asset[@"metadata"];
    id nsBundleFilename = asset[@"nsBundleFilename"];
    NSAssert(url && [url isKindOfClass:[NSString class]], @"asset url should be a nonnull string");
    NSAssert(type && [type isKindOfClass:[NSString class]], @"asset type should be a nonnull string");
    
    EXUpdatesAsset *asset = [[EXUpdatesAsset alloc] init];
    asset.url = [NSURL URLWithString:(NSString *)url];
    asset.type = (NSString *)type;

    if (metadata) {
      NSAssert([metadata isKindOfClass:[NSDictionary class]], @"asset metadata should be an object");
      asset.metadata = (NSDictionary *)metadata;
    }

    if (nsBundleFilename) {
      NSAssert([nsBundleFilename isKindOfClass:[NSString class]], @"asset localPath should be a string");
      asset.nsBundleFilename = (NSString *)nsBundleFilename;
    }

    NSString *filename = [self _sha1WithData:[(NSString *)url dataUsingEncoding:NSUTF8StringEncoding]];
    asset.filename = filename;

    [_assetQueue addObject:asset];
  }
}

# pragma mark - helpers

- (NSUUID *)_updateId
{
  id updateId = _manifest[@"id"];
  NSAssert([updateId isKindOfClass:[NSString class]], @"update ID should be a string");
  
  NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:(NSString *)updateId];
  NSAssert(uuid, @"update ID should be a valid UUID");
  
  return uuid;
}

- (NSString *)_sha1WithData:(NSData *)data
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

- (void)_lockDatabase
{
  [[EXUpdatesAppController sharedInstance].database.lock lock];
}

- (void)_unlockDatabase
{
  [[EXUpdatesAppController sharedInstance].database.lock unlock];
}

@end

NS_ASSUME_NONNULL_END
