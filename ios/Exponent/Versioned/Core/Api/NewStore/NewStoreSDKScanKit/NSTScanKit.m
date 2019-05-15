//
//  NSTScanKit.m
//  NewStoreSDKScanKit
//
//  Created by Radwa Ibrahim on 19.09.17.
//  Copyright © 2017 NewStore. All rights reserved.
//

#import "NSTScanKit.h"
#import "NSTScannerViewManager.h"


@interface NSTScanKit ()
@property (nonatomic, strong) UIView *scanKitViewContainer;
@property (nonatomic) NSCCodeTypes scanningCodeTypes;
@end

@implementation NSTScanKit

RCT_EXPORT_MODULE(NewStoreSDKScanKit);

#pragma mark - Methods
RCT_REMAP_METHOD(requestCameraAuthorization,
                 requestCameraAuthorizationWithResolveBlock:(RCTPromiseResolveBlock)resolve
                 rejectBlock:(RCTPromiseRejectBlock)reject)
{
    [NSTScanKit handleCameraAccessAuthorization:^(BOOL granted) {
        resolve(@(granted));
    }];
}

/**
 Check if camera access has been granted, otherwise request authorization

 @param completion true if the access is granted
 */
+ (void)handleCameraAccessAuthorization:(void (^)(BOOL))completion
{
    if(NSCScanViewController.authorizationStatus != NSCScanViewControllerAuthorizationStatusAuthorized)
    {
        [NSCScanViewController requestAuthorizationWithCompletionHandler:^(BOOL granted) {
            completion(granted);
        }];
        return;
    }
    completion(true);
}
@end
