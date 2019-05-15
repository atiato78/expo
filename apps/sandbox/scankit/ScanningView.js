import React from 'react';
import {
  requireNativeComponent,
  NativeModules,
  Dimensions,
} from 'react-native';
import type { StyleObj } from 'react-native';

const ScanViewManager = NativeModules.NewStoreSDKScanKitView;

export type ScannerResultEvent = {
  nativeEvent: {
    code: string,
    codeType: number,
  },
};

export type TorchMode = 'TorchModeAuto' | 'TorchModeOff' | 'TorchModeOn';

export type CodeType =
  | 'Code39'
  | 'Code93'
  | 'Code128'
  | 'CodeTypeAll'
  | 'DataMatrix'
  | 'Databar'
  | 'DatabarExpanded'
  | 'EAN8'
  | 'EAN13'
  | 'Interleaved2of5'
  | 'PDF417'
  | 'QR'
  | 'UPCA'
  | 'UPCE';

export type ScanningViewCallBacks = {
  /**
   * Required Event block which will be triggered when code is recognized
   */
  onScannerDidRecognizeCode: (event: ScannerResultEvent) => void,
  /**
   * Option Event block which will be triggered when scanning is stopped
   */
  onScannerStoppedScanning?: () => void,
  /**
   * Option Event block which will be triggered when scanning is started
   */
  onScannerStartedScanning?: () => void,
};

export type ScanningViewModes = {
  /**
   * The torch mode of scanning framework
   *   - TorchModeOff represents that torch is always off
   *   - TorchModeOn represents that torch is always on
   *   - TorchModeAuto represents that torch will be turned on automatically
   */
  torchMode?: TorchMode,
  /**
   * To trun on and off debug mode
   */
  debugModeEnabled?: boolean,
  /**
   * Determine if a crosshair overlay should be displayed
   */
  crosshairEnabled?: boolean,
  /**
   * Show/Hide the torch button
   */
  torchToggleHidden?: boolean,
  /**
   * Represents the code types which are supported to scan by the framework
   */
  codeTypes?: CodeType[],
};

export type ScanningViewProps = ScanningViewModes &
  ScanningViewCallBacks & {
    /**
     * The style of scanning view
     */
    style?: StyleObj,
    /**
     * To toggle whether the component is scanning code or not
     */
    isScanning: boolean,
  };

const { width, height } = Dimensions.get('window');

export default ({
  torchMode = 'TorchModeAuto',
  codeTypes = ['CodeTypeAll'],
  debugModeEnabled = false,
  crosshairEnabled = false,
  torchToggleHidden = false,
  style,
  isScanning,
  onScannerDidRecognizeCode,
  onScannerStartedScanning,
  onScannerStoppedScanning,
}: ScanningViewProps) => (
  <NSTScanner
    style={[defaultStyle, style]}
    isScanning={isScanning}
    torchMode={ScanViewManager[torchMode]}
    debugModeEnabled={debugModeEnabled}
    crosshairEnabled={crosshairEnabled}
    torchToggleHidden={torchToggleHidden}
    codeTypes={codeTypes.map(codeType => ScanViewManager[codeType])}
    onScannerDidRecognizeCode={onScannerDidRecognizeCode}
    onScannerStartedScanning={onScannerStartedScanning}
    onScannerStoppedScanning={onScannerStoppedScanning}
  />
);

const defaultStyle = {
  width,
  height,
};

const NSTScanner = requireNativeComponent('NewStoreSDKScanKitView', null);
