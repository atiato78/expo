import { Asset } from 'expo-asset';
export declare enum PitchCorrectionQuality {
    Low,
    Medium,
    High
}
export declare type PlaybackSource = number | {
    uri: string;
    overrideFileExtensionAndroid?: string;
    headers?: {
        [fieldName: string]: string;
    };
} | Asset;
export declare type PlaybackNativeSource = {
    uri: string;
    overridingExtension?: string | null;
    headers?: {
        [fieldName: string]: string;
    };
};
export declare type PlaybackParams = {
    uri?: string;
    initialPosition?: number;
    androidImplementation?: string;
    progressUpdateIntervalMillis?: number;
    rate?: number;
    shouldCorrectPitch?: boolean;
    volume?: number;
    isMuted?: boolean;
    isLooping?: boolean;
    shouldPlay?: boolean;
    seekMillisToleranceBefore?: number;
    seekMillisToleranceAfter?: number;
    pitchCorrectionQuality?: PitchCorrectionQuality;
};
export declare type PlaybackStatus = {
    isLoaded: boolean;
    error?: string;
    durationMillis?: number;
    positionMillis?: number;
    playableDurationMillis?: number;
    isPlaying: boolean;
    isLoading: boolean;
    isBuffering: boolean;
    didJustFinish: boolean;
};
export declare const _DEFAULT_PROGRESS_UPDATE_INTERVAL_MILLIS: number;
export declare const _DEFAULT_INITIAL_PLAYBACK_PARAMS: PlaybackParams;
export declare function getNativeSourceFromSource(source: PlaybackSource | null): PlaybackNativeSource | null;
export declare function assertStatusValuesInBounds(status: PlaybackParams): void;
export declare function getNativeSourceAndFullInitialStatusForLoadAsync(source: PlaybackSource | null, initialParams: PlaybackParams | null, downloadFirst: boolean): Promise<{
    nativeSource: PlaybackNativeSource;
    fullParams: PlaybackParams;
}>;
export declare function getUnloadedStatus(error?: string | null): PlaybackStatus;
export interface AV {
    setParamsAsync(status: PlaybackParams): Promise<PlaybackStatus>;
}
export interface Playback extends AV {
    playAsync(): Promise<PlaybackStatus>;
    playFromPositionAsync(positionMillis: number, tolerances?: {
        toleranceMillisBefore?: number;
        toleranceMillisAfter?: number;
    }): Promise<PlaybackStatus>;
    pauseAsync(): Promise<PlaybackStatus>;
    stopAsync(): Promise<PlaybackStatus>;
    setPositionAsync(positionMillis: number, tolerances?: {
        toleranceMillisBefore?: number;
        toleranceMillisAfter?: number;
    }): Promise<PlaybackStatus>;
    setRateAsync(rate: number, shouldCorrectPitch: boolean, pitchCorrectionQuality?: PitchCorrectionQuality): Promise<PlaybackStatus>;
    setVolumeAsync(volume: number): Promise<PlaybackStatus>;
    setIsMutedAsync(isMuted: boolean): Promise<PlaybackStatus>;
    setIsLoopingAsync(isLooping: boolean): Promise<PlaybackStatus>;
    setProgressUpdateIntervalAsync(progressUpdateIntervalMillis: number): Promise<PlaybackStatus>;
}
/**
 * A mixin that defines common playback methods for A/V classes so they implement the `Playback`
 * interface
 */
export declare const PlaybackMixin: {
    playAsync(): Promise<PlaybackStatus>;
    playFromPositionAsync(positionMillis: number, tolerances?: {
        toleranceMillisBefore?: number | undefined;
        toleranceMillisAfter?: number | undefined;
    }): Promise<PlaybackStatus>;
    pauseAsync(): Promise<PlaybackStatus>;
    stopAsync(): Promise<PlaybackStatus>;
    setPositionAsync(positionMillis: number, tolerances?: {
        toleranceMillisBefore?: number | undefined;
        toleranceMillisAfter?: number | undefined;
    }): Promise<PlaybackStatus>;
    setRateAsync(rate: number, shouldCorrectPitch?: boolean, pitchCorrectionQuality?: PitchCorrectionQuality): Promise<PlaybackStatus>;
    setVolumeAsync(volume: number): Promise<PlaybackStatus>;
    setIsMutedAsync(isMuted: boolean): Promise<PlaybackStatus>;
    setIsLoopingAsync(isLooping: boolean): Promise<PlaybackStatus>;
    setProgressUpdateIntervalAsync(progressUpdateIntervalMillis: number): Promise<PlaybackStatus>;
};
