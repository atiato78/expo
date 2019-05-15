//
//  EXAAEventProxy.m
//  Exponent
//
//  Created by Stanisław Chmiela on 15/05/2019.
//  Copyright © 2019 650 Industries. All rights reserved.
//

#import "EXAAEventProxy.h"
#import "EXKernel.h"
#import "EXAAEventEmitter.h"

@interface EXAAEventProxy ()

@property (nonatomic, strong) NSMutableArray *eventEmitters;

@end

@implementation EXAAEventProxy

- (instancetype)init
{
  if (self = [super init]) {
    _eventEmitters = [NSMutableArray new];
  }
  return self;
}

- (void)registerEventEmitter:(id)eventEmitter
{
  [_eventEmitters addObject:eventEmitter];
}

- (void)dispatchEventToAll:(NSDictionary *)event
{
  for (id eventEmitter in _eventEmitters) {
    [eventEmitter dispatchNewStoreEvent:event];
  }
//  EXReactAppManager *appManager = [EXKernel sharedInstance].appRegistry.homeAppRecord.appManager;
//  [appManager reactBridge];
}

@end
