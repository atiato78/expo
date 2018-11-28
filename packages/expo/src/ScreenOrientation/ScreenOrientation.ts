import ExponentScreenOrientation from './ExponentScreenOrientation';
import { UnavailabilityError } from 'expo-errors';
import { Platform, NativeEventEmitter, EmitterSubscription } from 'react-native';

export enum Orientation {
  UNKNOWN = 'UNKNOWN',
  PORTRAIT_UP = 'PORTRAIT_UP',
  PORTRAIT_DOWN = 'PORTRAIT_DOWN',
  LANDSCAPE_LEFT = 'LANDSCAPE_LEFT',
  LANDSCAPE_RIGHT = 'LANDSCAPE_RIGHT',
}

export enum OrientationLock {
  DEFAULT = 'DEFAULT',
  ALL = 'ALL',
  PORTRAIT = 'PORTRAIT',
  PORTRAIT_UP = 'PORTRAIT_UP',
  PORTRAIT_DOWN = 'PORTRAIT_DOWN',
  LANDSCAPE = 'LANDSCAPE',
  LANDSCAPE_LEFT = 'LANDSCAPE_LEFT',
  LANDSCAPE_RIGHT = 'LANDSCAPE_RIGHT',
  OTHER = 'OTHER',
}

// TODO: should this be exported?
type PlatformOptions = {
  screenOrientationConstantAndroid?: number;
  screenOrientationArrayIOS?: Array<Orientation>;
};

const _orientationChangeEmitter = new NativeEventEmitter(); // TODO: docs 4 why We dont pass in a manager
let _orientationChangeSubscribers: Array<EmitterSubscription> = [];

export function allowAsync(orientationLock: OrientationLock): Promise<void> {
  return lockAsync(orientationLock);
}

export function lockAsync(orientationLock: OrientationLock): Promise<void> {
  if (!ExponentScreenOrientation.lockAsync) {
    throw new UnavailabilityError('ScreenOrientation', 'lockAsync');
  }

  if (typeof orientationLock !== 'string'){
    throw new TypeError(`lockAsync cannot be called with ${orientationLock}`);
  }
  
  return ExponentScreenOrientation.lockAsync(orientationLock);
}

export function lockPlatformAsync(options: PlatformOptions): Promise<void> {
  const {screenOrientationConstantAndroid, screenOrientationArrayIOS} = options;
  let platformOrientationParam;
  if (Platform.OS === 'android' && screenOrientationConstantAndroid) {
    if (isNaN(screenOrientationConstantAndroid)){
      throw new TypeError(`lockPlatformAsync Android platform: screenOrientationConstantAndroid cannot be called with ${screenOrientationConstantAndroid}`)
    }
    platformOrientationParam = screenOrientationConstantAndroid;
  } else if (Platform.OS === 'ios' && screenOrientationArrayIOS){
    // TODO: implement me
  }
  return ExponentScreenOrientation.lockPlatformAsync(platformOrientationParam);
}

export function allow(orientation: OrientationLock): void {
  console.warn(
    "'ScreenOrientation.allow' is deprecated in favour of 'ScreenOrientation.allowAsync'"
  );
  allowAsync(orientation);
}

export function unlockAsync(): Promise<void> {
  return ExponentScreenOrientation.unlockAsync();
}

export function getOrientationAsync(): Promise<Orientation> {
  return ExponentScreenOrientation.getOrientationAsync();
}

export function getOrientationLockAsync(): Promise<OrientationLock> {
  return ExponentScreenOrientation.getOrientationLockAsync();
}

// TODO: do we want to expose this?
export async function getOrientationLockPlatformAsync(): Promise<String> {
  const platformOrientationLock = await ExponentScreenOrientation.getOrientationLockPlatformAsync();
  return platformOrientationLock.toString();
}

export function supportsOrientationLock(orientationLock: OrientationLock): Boolean {
  const orientationLocks = Object.values(OrientationLock);
  return orientationLocks.includes(orientationLock);
}

export function doesSupportAsync(orientationLock: OrientationLock): Boolean {
  return supportsOrientationLock(orientationLock);
}

// We rely on RN to emit `didUpdateDimensions`
// If this method no longer works, it's possible that the underlying RN implementation has changed
// see https://github.com/facebook/react-native/blob/c31f79fe478b882540d7fd31ee37b53ddbd60a17/ReactAndroid/src/main/java/com/facebook/react/modules/deviceinfo/DeviceInfoModule.java#L90
export function addOrientationChangeListener(listener: Function): EmitterSubscription {
  if (typeof listener !== 'function'){
    throw new TypeError(`addOrientationChangeListener cannot be called with ${listener}`);
  }

  const subscription = _orientationChangeEmitter.addListener('didUpdateDimensions', async update => {
    const orientationLock = await ExponentScreenOrientation.getOrientationLockAsync();
    const orientation = await ExponentScreenOrientation.getOrientationAsync();
    listener({orientationLock, orientation});
  });
  _orientationChangeSubscribers.push(subscription);
  return subscription;
}

export function removeOrientationChangeListeners(): void {
  // Remove listener by subscription instead of eventType to avoid clobbering Dimension module's subscription of didUpdateDimensions
  let i = _orientationChangeSubscribers.length;
  while (i--) {
    const subscriber = _orientationChangeSubscribers[i];
    _orientationChangeEmitter.removeSubscription(subscriber);

    // remove after a successful unsuscribe
    _orientationChangeSubscribers.pop(); 
  }
}

// TODO: should we introduce a remove-by-subscription?
export function removeOrientationChangeListener(subscription: EmitterSubscription): void {
  _orientationChangeEmitter.removeSubscription(subscription);
  _orientationChangeSubscribers = _orientationChangeSubscribers.filter(sub => sub !== subscription);
}