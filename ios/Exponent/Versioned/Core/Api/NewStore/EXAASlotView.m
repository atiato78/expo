//
//  EXAASlotView.m
//  Exponent
//
//  Created by Stanisław Chmiela on 15/05/2019.
//  Copyright © 2019 650 Industries. All rights reserved.
//

#import "EXAASlotView.h"
#import "EXKernel.h"
#import <React/RCTBridge.h>

@interface RCTRootView (EXMenuView)

- (void)javaScriptDidLoad:(NSNotification *)notification;
- (void)hideLoadingView;

@end

@implementation EXAASlotView

- (void)layoutSubviews
{
  [super layoutSubviews];
  if (!_rootView) {
    if (_moduleName && _bridge) {
      RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:[[EXKernel sharedInstance].appRegistry newestRecordWithExperienceId:@"@sjchmiela/sandbox"].appManager launchOptions:nil];
      _rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:_moduleName initialProperties:@{}];
//      NSNotification *notif = [[NSNotification alloc] initWithName:RCTJavaScriptDidLoadNotification
//                                                            object:nil
//                                                          userInfo:@{ @"bridge": bridge
//
      
//                                                                      }];
//      [_rootView javaScriptDidLoad:notif];
      [self addSubview:_rootView];
    }
  }
  [_rootView layoutSubviews];
  [_rootView setFrame:self.bounds];
}

@end
