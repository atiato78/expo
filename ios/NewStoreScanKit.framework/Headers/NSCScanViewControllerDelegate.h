//
//  NSCScanViewControllerDelegate.h
//  NewStoreScanKit
//
//  Created by Marcel Dierkes on 29.07.17.
//  Copyright © 2017 NewStore. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "NSCCodeTypes.h"

NS_ASSUME_NONNULL_BEGIN

@protocol NSCScanViewController;

/**
 A delegate that receives scanned codes and scan status change events
 from `NSCScanViewController`.
 */
@protocol NSCScanViewControllerDelegate <NSObject>

/**
 Delivers a scanned code to the delegate. Beware that this method
 might get called in close succession. Please use a queue to avoid
 overlapping calls.
 
 @param scanViewController A delegating scan view controller.
 @param code A scanned code string.
 @param codeType The type (e.g. .qr or .databar) of the scanned code.
 */
- (void)scanViewController:(id<NSCScanViewController>)scanViewController
          didRecognizeCode:(NSString *)code
                  codeType:(NSCCodeTypes)codeType;

@optional

/**
 Tells the delegate that scanning has started.

 @param scanViewController A delegating scan view controller.
 */
- (void)scanViewControllerDidStartScanning:(id<NSCScanViewController>)scanViewController;

/**
 Tells the delegate that scanning has stopped.
 
 @param scanViewController A delegating scan view controller.
 */
- (void)scanViewControllerDidStopScanning:(id<NSCScanViewController>)scanViewController;

@end

NS_ASSUME_NONNULL_END
