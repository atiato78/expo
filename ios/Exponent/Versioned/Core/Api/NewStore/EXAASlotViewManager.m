//
//  EXAASlotViewManager.m
//  Exponent
//
//  Created by Stanisław Chmiela on 15/05/2019.
//  Copyright © 2019 650 Industries. All rights reserved.
//

#import "EXAASlotViewManager.h"
#import "EXAASlotView.h"
#import <React/RCTRootView.h>

@implementation EXAASlotViewManager

RCT_EXPORT_MODULE(AASlotViewManager)

- (UIView *)view
{
  EXAASlotView *view = [[EXAASlotView alloc] init];
  view.backgroundColor = [UIColor blueColor];
  view.bridge = self.bridge;
  return view;
}

RCT_EXPORT_VIEW_PROPERTY(moduleName, NSString)
RCT_EXPORT_VIEW_PROPERTY(initalProperties, NSDictionary)

@end
