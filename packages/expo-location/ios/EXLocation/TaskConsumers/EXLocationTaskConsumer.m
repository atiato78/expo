// Copyright 2018-present 650 Industries. All rights reserved.

#import <CoreLocation/CLLocationManager.h>
#import <CoreLocation/CLErrorDomain.h>
#import <CoreLocation/CLCircularRegion.h>

#import <UMCore/UMUtilities.h>
#import <EXLocation/EXLocation.h>
#import <EXLocation/EXLocationTaskConsumer.h>
#import <UMTaskManagerInterface/UMTaskInterface.h>

NSString *const EXLocationAwakeningRegionIdentifier = @"<LocationAwakeningRegionIdentifier>";

@interface EXLocationTaskConsumer ()

@property (nonatomic, strong) CLLocationManager *locationManager;
@property (nonatomic, strong) NSMutableArray<CLLocation *> *deferredLocations;
@property (nonatomic, strong) CLLocation *lastReportedLocation;
@property (nonatomic, assign) CLLocationDistance deferredDistance;

@end

@implementation EXLocationTaskConsumer

- (instancetype)init
{
  if (self = [super init]) {
    _deferredLocations = [NSMutableArray new];
    _deferredDistance = 0.0;

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(applicationWillTerminate:)
                                                 name:UIApplicationWillTerminateNotification
                                               object:nil];
  }
  return self;
}

- (void)dealloc
{
  [self reset];
}

# pragma mark - UMTaskConsumerInterface

- (NSString *)taskType
{
  return @"location";
}

- (void)didRegisterTask:(id<UMTaskInterface>)task
{
  [UMUtilities performSynchronouslyOnMainThread:^{
    CLLocationManager *locationManager = [CLLocationManager new];

    self->_task = task;
    self->_locationManager = locationManager;

    locationManager.delegate = self;
    locationManager.allowsBackgroundLocationUpdates = YES;
    locationManager.pausesLocationUpdatesAutomatically = NO;

    // Stop monitoring a region that was intended to wake up the application.
    [self stopMonitoringAwakeningRegion];

    // Set options-specific things in location manager.
    [self setOptions:task.options];
  }];
}

- (void)didUnregister
{
  [self reset];
}

- (void)setOptions:(NSDictionary *)options
{
  [UMUtilities performSynchronouslyOnMainThread:^{
    CLLocationManager *locationManager = self->_locationManager;
    EXLocationAccuracy accuracy = [options[@"accuracy"] unsignedIntegerValue] ?: EXLocationAccuracyBalanced;

    locationManager.desiredAccuracy = [EXLocation CLLocationAccuracyFromOption:accuracy];
    locationManager.distanceFilter = [options[@"distanceInterval"] doubleValue] ?: kCLDistanceFilterNone;

    if (@available(iOS 11.0, *)) {
      locationManager.showsBackgroundLocationIndicator = [options[@"showsBackgroundLocationIndicator"] boolValue];
    }

    [locationManager startUpdatingLocation];
    [locationManager startMonitoringSignificantLocationChanges];
  }];
}

- (void)applicationWillTerminate:(NSNotification *)notification
{
  // Once the application is about to terminate, we set up as small as possible geofencing region around
  // the last known location to make the app be woken up faster than normally (when using significant location change).
  [self startMonitoringAwakeningRegion];
}

# pragma mark - CLLocationManagerDelegate

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations
{
  if (_task != nil && locations.count > 0) {
    [self deferLocations:locations];
    [self maybeReportDeferredLocations];
  }
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error
{
  if (error.domain == kCLErrorDomain) {
    // This error might happen when the device is not able to find out the location. Try to restart monitoring location.
    [manager stopUpdatingLocation];
    [manager stopMonitoringSignificantLocationChanges];
    [manager startUpdatingLocation];
    [manager startMonitoringSignificantLocationChanges];
  } else {
    [_task executeWithData:nil withError:error];
  }
}

# pragma mark - internal

- (void)reset
{
  [UMUtilities performSynchronouslyOnMainThread:^{
    [self->_locationManager stopUpdatingLocation];
    [self->_locationManager stopMonitoringSignificantLocationChanges];
    [self->_deferredLocations removeAllObjects];
    self->_lastReportedLocation = nil;
    self->_deferredDistance = 0.0;
    self->_locationManager = nil;
    self->_task = nil;

    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:UIApplicationWillTerminateNotification
                                                  object:nil];
  }];
}

- (void)executeTaskWithDeferredLocations
{
  // Execute task with deferred locations.
  NSDictionary *data = @{ @"locations": [EXLocationTaskConsumer _exportLocations:_deferredLocations] };
  [_task executeWithData:data withError:nil];

  // Reset deferring state.
  _lastReportedLocation = _deferredLocations.lastObject;
  _deferredDistance = 0.0;
  [_deferredLocations removeAllObjects];
}

- (void)maybeReportDeferredLocations
{
  if ([self shouldReportDeferredLocations]) {
    [self executeTaskWithDeferredLocations];
  }
}

- (void)deferLocations:(NSArray<CLLocation *> *)locations
{
  CLLocation *lastLocation = _deferredLocations.lastObject ?: _lastReportedLocation;

  for (CLLocation *location in locations) {
    if (lastLocation) {
      _deferredDistance += [location distanceFromLocation:lastLocation];
    }
    lastLocation = location;
  }
  [_deferredLocations addObjectsFromArray:locations];
}

- (BOOL)shouldReportDeferredLocations
{
  if (_deferredLocations.count <= 0) {
    return NO;
  }
  UIApplicationState appState = [[UIApplication sharedApplication] applicationState];

  if (appState == UIApplicationStateActive) {
    // Don't defer location updates when app is in foreground state.
    return YES;
  }

  CLLocation *oldestLocation = _lastReportedLocation ?: _deferredLocations.firstObject;
  CLLocation *newestLocation = _deferredLocations.lastObject;
  NSDictionary *options = _task.options;
  CLLocationDistance distance = [self numberToDouble:options[@"deferredUpdatesDistance"] defaultValue:0];
  NSTimeInterval interval = [self numberToDouble:options[@"deferredUpdatesInterval"] defaultValue:0];

  return [newestLocation.timestamp timeIntervalSinceDate:oldestLocation.timestamp] >= interval / 1000.0 && _deferredDistance >= distance;
}

- (void)startMonitoringAwakeningRegion
{
  CLLocation *lastLocation = _locationManager.location;

  if (lastLocation != nil) {
    CLCircularRegion *region = [[CLCircularRegion alloc] initWithCenter:lastLocation.coordinate
                                                                 radius:100
                                                             identifier:EXLocationAwakeningRegionIdentifier];
    region.notifyOnEntry = YES;
    region.notifyOnExit = YES;
    [_locationManager startMonitoringForRegion:region];
  }
}

- (void)stopMonitoringAwakeningRegion
{
  [_locationManager.monitoredRegions enumerateObjectsUsingBlock:^(CLRegion * _Nonnull region, BOOL * _Nonnull stop) {
    if ([region.identifier isEqualToString:EXLocationAwakeningRegionIdentifier]) {
      [self->_locationManager stopMonitoringForRegion:region];
      *stop = YES;
    }
  }];
}

- (double)numberToDouble:(NSNumber *)number defaultValue:(double)defaultValue
{
  return number == nil ? defaultValue : [number doubleValue];
}

+ (NSArray<NSDictionary *> *)_exportLocations:(NSArray<CLLocation *> *)locations
{
  NSMutableArray<NSDictionary *> *result = [NSMutableArray new];

  for (CLLocation *location in locations) {
    [result addObject:[EXLocation exportLocation:location]];
  }
  return result;
}

@end
