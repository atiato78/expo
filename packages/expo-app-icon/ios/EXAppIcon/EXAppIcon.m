// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXAppIcon/EXAppIcon.h>
#import <UMCore/UMUtilities.h>
#import <UMCore/UMModuleRegistry.h>

@interface EXAppIcon ()

@property (nonatomic, weak) UMModuleRegistry *moduleRegistry;

@end

@implementation EXAppIcon

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  _moduleRegistry = moduleRegistry;
}

- (NSDictionary *)_getAppIcons
{
  // TODO: Bacon: Finish
  // TODO: Bacon: Add support for iPad object (CFBundleIcons~ipad) somehow.
  // TODO: Bacon: Add default icon
  // CFBundleAlternateIcons

  /**
    {
      [name: string]: {
        prerendered: boolean,
        name: string,
        sources: string[]
      }
    }
  */
  NSDictionary *CFBundleIcons = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleIcons"];
  __block NSArray *urlSchemes;
  // [urlTypes enumerateObjectsUsingBlock:^(id _Nonnull urlType, NSUInteger idx,  BOOL * _Nonnull stop) {
  //   if ([[urlType objectForKey:@"CFBundleURLName"] isEqualToString:@"OAuthRedirect"]) {
  //     urlSchemes = [(NSDictionary *)urlType objectForKey:@"CFBundleURLSchemes"];
  //     *stop = YES;
  //   }
  // }];
  // return urlSchemes;
  return @{};
}

UM_EXPORT_MODULE(ExpoAppIcon);

# pragma mark - UMModuleRegistryConsumer

- (NSDictionary *)constantsToExport
{
  if (@available(iOS 10.3, *)) {
    return @{
          // TODO: Bacon: Maybe wrap for iOS 10.3
           @"isSupported": UIApplication.sharedApplication.supportsAlternateIcons,
           @"icons": [self _getAppIcons]
          };
  }
  return @{ 
    @"isSupported": @NO,
    @"icons": @{}
  };
}

- (nullable NSDictionary *)_getIconWithName:(_Nullable NSString *)name
{
  return @{};
}

UM_EXPORT_METHOD_AS(getIconAsync, 
                    getIconAsync:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  if (@available(iOS 10.3, *)) {
    [UMUtilities performSynchronouslyOnMainThread:^{
      resolve([self _getIconWithName:UIApplication.sharedApplication.alternateIconName]);
    }];
  } else {
    reject(@"ERR_APP_ICON", @"getIconAsync: This device's OS doesn't support the native API UIApplication.sharedApplication.alternateIconName, which is first available on iOS 10.3.");
  }
}

UM_EXPORT_METHOD_AS(setIconAsync, setIconAsync:(NSString *)name
                    resolve:(UMPromiseResolveBlock)resolve
                    reject:(UMPromiseRejectBlock)reject)
{
  if (@available(iOS 10.3, *)) {
    [UMUtilities performSynchronouslyOnMainThread:^{
      [UIApplication.sharedApplication setAlternateIconName:name completionHandler:^(NSError * _Nullable error) {
        if (error) {
          reject(@"ERR_APP_ICON", @"setIconAsync", error);
        } else {
          resolve(nil);
        }
      }];
    }];
   } else {
    reject(@"ERR_APP_ICON", @"setIconAsync: This device's OS doesn't support the native API [UIApplication.sharedApplication setAlternateIconName:completionHandler:], which is first available on iOS 10.3.");
  }
}

@end
