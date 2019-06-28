// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXBattery/EXBattery.h>
#import <UMCore/UMUtilities.h>

@interface EXBattery ()

@property (nonatomic, weak) UMModuleRegistry *moduleRegistry;

@end

@implementation EXBattery

UM_EXPORT_MODULE(ExpoBattery);

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  _moduleRegistry = moduleRegistry;
}

UM_EXPORT_METHOD_AS(someGreatMethodAsync,
                    options:(NSDictionary *)options
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
}

- (NSDictionary *)constantsToExport
{
  return @{};
}


@end
