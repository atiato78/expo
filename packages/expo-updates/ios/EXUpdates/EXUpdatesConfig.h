//  Copyright © 2018 650 Industries. All rights reserved.

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesConfig : NSObject

@property (nonatomic, strong) NSURL *remoteUrl;
@property (nonatomic, strong) NSString *releaseChannel;

+ (instancetype)sharedInstance;

@end

NS_ASSUME_NONNULL_END
