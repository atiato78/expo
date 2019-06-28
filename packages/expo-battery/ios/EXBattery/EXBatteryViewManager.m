// Copyright 2016-present 650 Industries. All rights reserved.

#import <EXBattery/EXBatteryView.h>
#import <EXBattery/EXBatteryViewManager.h>

@interface EXBatteryViewManager ()

@property (nonatomic, weak) EXModuleRegistry *moduleRegistry;

@end

@implementation EXBatteryViewManager

EX_EXPORT_MODULE(ExpoBatteryViewManager);

- (UIView *)view
{
  return [[EXBatteryView alloc] initWithModuleRegistry:_moduleRegistry];
}

- (NSString *)viewName
{
  return @"ExpoBatteryView";
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"onSomethingHappened"];
}

- (void)setModuleRegistry:(EXModuleRegistry *)moduleRegistry
{
  _moduleRegistry = moduleRegistry;
}

@end
