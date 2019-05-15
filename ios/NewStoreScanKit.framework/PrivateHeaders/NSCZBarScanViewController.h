//
//  NSCZBarScanViewController.h
//  NewStoreScanKit
//
//  Created by Marcel Dierkes on 28.07.17.
//  Copyright © 2017 NewStore. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "NSCScanViewController.h"

NS_ASSUME_NONNULL_BEGIN

/**
 A scan view controller using the [ZBar SDK](https://github.com/zbar/zbar) to scan
 barcodes, QR codes, etc.
 
 This scan view controller is specialized on Databar codes.
 */
@interface NSCZBarScanViewController : NSCScanViewController
@end

NS_ASSUME_NONNULL_END
