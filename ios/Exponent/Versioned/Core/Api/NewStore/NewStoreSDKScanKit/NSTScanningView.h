//
//  NSTScanningView.h
//  NewStoreSDKScanKit
//
//  Created by Zongkun Dou on 9/22/17.
//  Copyright © 2017 NewStore. All rights reserved.
//

#import <React/RCTView.h>
@import NewStoreScanKit;

@interface NSTScanningView : RCTView <NSCScanViewControllerDelegate>

@property (nonatomic) BOOL isScanning;
@property (nonatomic) NSCCodeTypes codeTypes;
@property (nonatomic) NSCTorchMode torchMode;
@property (nonatomic) BOOL debugModeEnabled;
@property (nonatomic) BOOL crosshairEnabled;
@property (nonatomic) BOOL torchToggleHidden;

@property (copy, nonatomic) RCTBubblingEventBlock onScannerDidRecognizeCode;
@property (copy, nonatomic) RCTBubblingEventBlock onScannerStoppedScanning;
@property (copy, nonatomic) RCTBubblingEventBlock onScannerStartedScanning;

@end
