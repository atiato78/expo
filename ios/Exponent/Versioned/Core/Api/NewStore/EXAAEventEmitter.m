//
//  EXNSEventEmitter.m
//  Exponent
//
//  Created by Stanisław Chmiela on 15/05/2019.
//  Copyright © 2019 650 Industries. All rights reserved.
//

#import "EXAAEventEmitter.h"
#import "EXScopedModuleRegistry.h"
#import "EXAAEventProxy.h"

@interface EXAAEventEmitter ()

@property (nonatomic, weak) EXAAEventProxy *eventProxy;

@end

@implementation EXAAEventEmitter

- (instancetype)initWithExperienceId:(NSString *)experienceId
               kernelServiceDelegate:(id)kernelServiceInstance
                              params:(NSDictionary *)params
{
  if (self = [super initWithExperienceId:experienceId kernelServiceDelegate:kernelServiceInstance params:params]) {
    _eventProxy = kernelServiceInstance;
    [_eventProxy registerEventEmitter:self];
  }
  return self;
}

EX_EXPORT_SCOPED_MODULE(AAEventEmitter, AAEventProxy);

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"newStoreEvent"];
}

RCT_EXPORT_METHOD(dispatchEvent:(NSDictionary *)event
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  [_eventProxy dispatchEventToAll:event];
  resolve(nil);
}

- (void)dispatchNewStoreEvent:(NSDictionary *)event
{
  [self sendEventWithName:@"newStoreEvent" body:event];
}

@end
