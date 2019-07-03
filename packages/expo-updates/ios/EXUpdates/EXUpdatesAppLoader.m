//  Copyright © 2018 650 Industries. All rights reserved.

#import <EXUpdates/EXUpdatesAppLoader.h>
#import <EXUpdates/EXUpdatesFileDownloader.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesAppLoader ()

@property (nonatomic, strong) EXUpdatesFileDownloader *downloader;

@end

@implementation EXUpdatesAppLoader

- (instancetype)init
{
  if (self = [super init]) {
    _downloader = [[EXUpdatesFileDownloader alloc] init];
  }
  return self;
}

- (void)loadUpdateFromUrl:(NSURL *)url
{
  [_downloader downloadDataFromURL:url successBlock:^(NSData * _Nonnull data, NSURLResponse * _Nonnull response) {
    <#code#>
  } errorBlock:^(NSError * _Nonnull error, NSURLResponse * _Nonnull response) {
    <#code#>
  }];
}

@end

NS_ASSUME_NONNULL_END
