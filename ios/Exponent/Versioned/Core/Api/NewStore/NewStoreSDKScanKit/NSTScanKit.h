//
//  NSTScanKit.h
//  NewStoreSDKScanKit
//
//  Created by Radwa Ibrahim on 19.09.17.
//  Copyright © 2017 NewStore. All rights reserved.
//

@import Foundation;
#import <React/RCTBridgeModule.h>
@import NewStoreScanKit;

NS_ASSUME_NONNULL_BEGIN

@interface NSTScanKit : NSObject <RCTBridgeModule>

+ (void)handleCameraAccessAuthorization:(void (^)(BOOL))completion;

@end

NS_ASSUME_NONNULL_END
