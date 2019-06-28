// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXBattery/EXBatteryModule.h>

@interface EXBatteryModule ()

@property (nonatomic, weak) EXModuleRegistry *moduleRegistry;

@end

@implementation EXBatteryModule

EX_EXPORT_MODULE(ExpoBattery);

- (void)setModuleRegistry:(EXModuleRegistry *)moduleRegistry
{
  _moduleRegistry = moduleRegistry;
}

EX_EXPORT_METHOD_AS(someGreatMethodAsync,
                    options:(NSDictionary *)options
                    resolve:(EXPromiseResolveBlock)resolve
                    reject:(EXPromiseRejectBlock)reject)
{
}

@end
