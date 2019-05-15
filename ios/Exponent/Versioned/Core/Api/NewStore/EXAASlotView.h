//
//  EXAASlotView.h
//  Exponent
//
//  Created by Stanisław Chmiela on 15/05/2019.
//  Copyright © 2019 650 Industries. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTRootView.h>
#import <React/RCTView.h>
#import <React/RCTBridge.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXAASlotView : RCTView

@property (nonatomic, strong) RCTRootView *rootView;
@property (nonatomic, strong) RCTBridge *bridge;
@property (nonatomic, strong) NSString *moduleName;
@property (nonatomic, strong) NSDictionary *initialProperties;

@end

NS_ASSUME_NONNULL_END
