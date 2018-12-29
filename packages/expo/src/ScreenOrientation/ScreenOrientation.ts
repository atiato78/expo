import ExponentScreenOrientation from './ExponentScreenOrientation';
import { UnavailabilityError } from 'expo-errors';
import { EmitterSubscription, NativeEventEmitter, Platform } from 'react-native';

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
  ALL_BUT_UPSIDE_DOWN = 'ALL_BUT_UPSIDE_DOWN', // deprecated
}

type PlatformOptions = {
  screenOrientationConstantAndroid?: number;
  screenOrientationArrayIOS?: Orientation[];
};

type OrientationChangeListener = (event: OrientationChangeEvent) => void;

type OrientationChangeEvent = {
  orientationLock: OrientationLock;
  orientation: Orientation;
};

// todo: make this conditional
const _orientationChangeEmitter = new NativeEventEmitter(ExponentScreenOrientation);
let _orientationChangeSubscribers: EmitterSubscription[] = [];

export function allow(orientationLock: OrientationLock): void {
  console.warn("'ScreenOrientation.allow' is deprecated in favour of 'ScreenOrientation.lockAsync'");
  lockAsync(orientationLock);
}

export async function allowAsync(orientationLock: OrientationLock): Promise<void> {
  console.warn("'ScreenOrientation.allowAsync' is deprecated in favour of 'ScreenOrientation.lockAsync'");
  await lockAsync(orientationLock);
}

export async function lockAsync(orientationLock: OrientationLock): Promise<void> {
  if (!ExponentScreenOrientation.lockAsync) {
    throw new UnavailabilityError('ScreenOrientation', 'lockAsync');
  }

  if (typeof orientationLock !== 'string'){
    throw new TypeError(`lockAsync cannot be called with ${orientationLock}`);
  }
  
  await ExponentScreenOrientation.lockAsync(orientationLock);
}

export async function lockPlatformAsync(options: PlatformOptions): Promise<void> {
  const {screenOrientationConstantAndroid, screenOrientationArrayIOS} = options;
  let platformOrientationParam;
  if (Platform.OS === 'android' && screenOrientationConstantAndroid) {
    if (isNaN(screenOrientationConstantAndroid)){
      throw new TypeError(`lockPlatformAsync Android platform: screenOrientationConstantAndroid cannot be called with ${screenOrientationConstantAndroid}`);
    }
    platformOrientationParam = screenOrientationConstantAndroid;
  } else if (Platform.OS === 'ios' && screenOrientationArrayIOS){
    if (!Array.isArray(screenOrientationArrayIOS)){
      throw new TypeError(`lockPlatformAsync iOS platform: screenOrientationArrayIOS cannot be called with ${screenOrientationArrayIOS}`);
    }
    for (let orientation of screenOrientationArrayIOS){
      const orientations = Object.values(Orientation);
      if (!orientations.includes(orientation)) {
        throw new TypeError(`lockPlatformAsync iOS platform: ${orientation} is not a valid Orientation`);
      }
    }
    platformOrientationParam = screenOrientationArrayIOS;
  }
  await ExponentScreenOrientation.lockPlatformAsync(platformOrientationParam);
}

export async function unlockAsync(): Promise<void> {
  await ExponentScreenOrientation.unlockAsync();
}

export async function getOrientationAsync(): Promise<Orientation> {
  return await ExponentScreenOrientation.getOrientationAsync();
}

export async function getOrientationLockAsync(): Promise<OrientationLock> {
  return await ExponentScreenOrientation.getOrientationLockAsync();
}

// TODO: do we want to expose this?
export async function getPlatformOrientationLockAsync(): Promise<String> {
  const platformOrientationLock = await ExponentScreenOrientation.getPlatformOrientationLockAsync();
  return await platformOrientationLock.toString();
}

export async function supportsOrientationLockAsync(orientationLock: OrientationLock): Promise<boolean> {
  //TODO: make this native
  const orientationLocks = Object.values(OrientationLock);
  return await orientationLocks.includes(orientationLock);
}

export async function doesSupportAsync(orientationLock: OrientationLock): Promise<boolean> {
  return await supportsOrientationLockAsync(orientationLock);
}

// We rely on RN to emit `didUpdateDimensions`
// If this method no longer works, it's possible that the underlying RN implementation has changed
// see https://github.com/facebook/react-native/blob/c31f79fe478b882540d7fd31ee37b53ddbd60a17/ReactAndroid/src/main/java/com/facebook/react/modules/deviceinfo/DeviceInfoModule.java#L90
export async function addOrientationChangeListenerAsync(listener: OrientationChangeListener): Promise<EmitterSubscription> {
  if (typeof listener !== 'function'){
    throw new TypeError(`addOrientationChangeListener cannot be called with ${listener}`);
  }

  // TODO: consolidate this later
  const eventName = Platform.OS === 'ios' ? 'expoDidUpdateDimensions' : 'didUpdateDimensions';
  const subscription = _orientationChangeEmitter.addListener(eventName, async update => {
    let orientation, orientationLock;
    if (Platform.OS === 'ios'){
      // TODO: let the bridge carry this info in the Update instead of having to fetch it again
      // RN relies on a deprecated thing in ios so we make our own implementation
      //orientationLock = update.orientationLock;
      orientationLock = update.orientationLock;
      orientation = update.orientation;
    } else {
      // We rely on the RN `didUpdateDimensions` event on Android
      [orientationLock, orientation] = await Promise.all([ExponentScreenOrientation.getOrientationLockAsync(), ExponentScreenOrientation.getOrientationAsync()])
    }
    listener ({orientation, orientationLock});
  });
  _orientationChangeSubscribers.push(subscription);

  if (Platform.OS === 'ios'){
    await ExponentScreenOrientation.addOrientationChangeListener();
  }
  return subscription;
}

export async function removeOrientationChangeListenersAsync(): Promise<void> {
  // Remove listener by subscription instead of eventType to avoid clobbering Dimension module's subscription of didUpdateDimensions
  let i = _orientationChangeSubscribers.length;
  while (i--) {
    const subscriber = _orientationChangeSubscribers[i];
    subscriber.remove();

    // remove after a successful unsuscribe
    _orientationChangeSubscribers.pop(); 
  }
  if (Platform.OS === 'ios'){
    // remove module listener if we have no more subscribers
    // TODO: should this be better named
    await ExponentScreenOrientation.removeOrientationChangeListener();
  }
}

// TODO: should we introduce a remove-by-subscription?
export async function removeOrientationChangeListenerAsync(subscription: EmitterSubscription): Promise<void> {
  if (!subscription){
    throw new TypeError(`Must pass in a valid subscription`);
  }
  subscription.remove();
  _orientationChangeSubscribers = _orientationChangeSubscribers.filter(sub => sub !== subscription);

  if (Platform.OS === 'ios' && _orientationChangeSubscribers.length === 0) {
    await ExponentScreenOrientation.removeOrientationChangeListener();
  }
}
