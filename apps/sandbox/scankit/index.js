// @flow
import { NativeModules } from 'react-native';
// import { platformUnsupported } from '../utils/platform';
const platformUnsupported = () => {
  console.warn('Platform unsupported');
  return false;
}

export { default as ScanningView } from './ScanningView';
export type {
  ScannerResultEvent,
  TorchMode,
  CodeType,
  ScanningViewCallBacks,
  ScanningViewModes,
  ScanningViewProps,
} from './ScanningView';

let NativeScanKit: Object;

if ('NewStoreSDKScanKit' in NativeModules) {
  NativeScanKit = NativeModules.NewStoreSDKScanKit;
}

/**
 * To ask for iOS camera access permission in order to scan the codes
 */
export default async function requestCameraAuthorization(): Promise<?boolean> {
  if (!NativeScanKit) {
    return platformUnsupported('NativeScanKit.requestCameraAuthorization');
  }

  return NativeScanKit.requestCameraAuthorization();
}
