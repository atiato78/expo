//
//  NSCScanViewController+AuthorizationStatus.h
//  NewStoreScanKit
//
//  Created by Marcel Dierkes on 31.07.17.
//  Copyright © 2017 NewStore. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "NSCScanViewController.h"

NS_ASSUME_NONNULL_BEGIN

/**
 A camera authorization status.
 */
typedef NS_ENUM(NSUInteger, NSCScanViewControllerAuthorizationStatus) {
    /**
     The camera authorization status is undetermined.
     
     This means that the system never asked for camera access.
     */
    NSCScanViewControllerAuthorizationStatusNotDetermined = 0,

    /**
     Camera access is restricted.
     
     The user was restricted from accessing the camera.
     */
    NSCScanViewControllerAuthorizationStatusRestricted,

    /**
     Camera access is denied.
     
     The user denied camera access.
     */
    NSCScanViewControllerAuthorizationStatusDenied,

    /**
     Camera access is authorized.
     
     The user allowed camera access.
     */
    NSCScanViewControllerAuthorizationStatusAuthorized
};

@interface NSCScanViewController (AuthorizationStatus)

/**
 Returns the authorization status of the camera.
 
 Please check this value before presenting a `NSCScanViewController`.
 */
@property (class, nonatomic, readonly) NSCScanViewControllerAuthorizationStatus authorizationStatus;

/**
 Requests camera access from the system. The user will be prompted for access.
 
 If the completionHandler gets called with a denied status, the system will NOT prompt
 the user again for camera access. The app should guide the user to the Settings app instead.

 @param completionHandler A completion handler, returning on the main queue.
 */
+ (void)requestAuthorizationWithCompletionHandler:(void (^)(BOOL granted))completionHandler;

@end

NS_ASSUME_NONNULL_END
