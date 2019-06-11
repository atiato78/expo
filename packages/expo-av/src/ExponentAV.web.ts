import { SyntheticPlatformEmitter } from '@unimodules/core';

import { PlaybackNativeSource, PlaybackStatus, PlaybackParams, getUnloadedStatus } from './AV';

function getStatusFromMedia(media?: HTMLMediaElement): PlaybackStatus {
  if (!media) {
    return getUnloadedStatus();
  }

  const isPlaying = !!(
    media.currentTime > 0 &&
    !media.paused &&
    !media.ended &&
    media.readyState > 2
  );

  // TODO: Distinguish status and params, merging it makes no sense.
  const status: PlaybackStatus = {
    isLoaded: true, //TODO: Bacon: Add interval between calls
    durationMillis: media.duration * 1000,
    positionMillis: media.currentTime * 1000,
    // playableDurationMillis: media.buffered * 1000,
    // seekMillisToleranceBefore?: number
    // seekMillisToleranceAfter?: number
    isPlaying,
    isLoading: false,
    isBuffering: false, //media.waiting,
    // TODO: Bacon: This seems too complicated right now: https://webaudio.github.io/web-audio-api/#dom-biquadfilternode-frequency
    // didJustFinish: media.ended,
    // TODO: Make seperate event from that.
  };

  return status;
}

function setStatusForMedia(media: HTMLMediaElement, params: PlaybackParams): PlaybackStatus {
  if (params.initialPosition !== undefined) {
    media.currentTime = params.initialPosition / 1000;
  }
  // if (status.progressUpdateIntervalMillis !== undefined) {
  //   media.progressUpdateIntervalMillis = status.progressUpdateIntervalMillis;
  // }
  // if (status.seekMillisToleranceBefore !== undefined) {
  //   media.seekMillisToleranceBefore = status.seekMillisToleranceBefore;
  // }
  // if (status.seekMillisToleranceAfter !== undefined) {
  //   media.seekMillisToleranceAfter = status.seekMillisToleranceAfter;
  // }
  // if (status.shouldCorrectPitch !== undefined) {
  //   media.shouldCorrectPitch = status.shouldCorrectPitch;
  // }
  if (params.shouldPlay !== undefined) {
    if (params.shouldPlay) {
      media.play();
    } else {
      media.pause();
    }
  }
  if (params.rate !== undefined) {
    media.playbackRate = params.rate;
  }
  if (params.volume !== undefined) {
    media.volume = params.volume;
  }
  if (params.isMuted !== undefined) {
    media.muted = params.isMuted;
  }
  if (params.isLooping !== undefined) {
    media.loop = params.isLooping;
  }

  return getStatusFromMedia(media);
}

export default {
  get name(): string {
    return 'ExponentAV';
  },
  async getStatusForVideo(element: HTMLMediaElement): Promise<PlaybackStatus> {
    return getStatusFromMedia(element);
  },
  async loadForVideo(
    element: HTMLMediaElement,
    nativeSource: PlaybackNativeSource,
    fullParams: PlaybackParams
  ): Promise<PlaybackStatus> {
    return getStatusFromMedia(element);
  },
  async unloadForVideo(element: HTMLMediaElement): Promise<PlaybackStatus> {
    return getStatusFromMedia(element);
  },
  async setStatusForVideo(
    element: HTMLMediaElement,
    params: PlaybackParams
  ): Promise<PlaybackStatus> {
    return setStatusForMedia(element, params);
  },
  async replayVideo(element: HTMLMediaElement, params: PlaybackParams): Promise<PlaybackStatus> {
    return setStatusForMedia(element, params);
  },
  /* Audio */
  async setAudioMode() {},
  async setAudioIsEnabled() {},
  async getStatusForSound(element: HTMLMediaElement) {
    return getStatusFromMedia(element);
  },
  async loadForSound(
    nativeSource: string | { uri: string; [key: string]: any },
    fullInitialStatus: PlaybackParams
  ): Promise<[HTMLMediaElement, PlaybackStatus]> {
    const source = typeof nativeSource === 'string' ? nativeSource : nativeSource.uri;
    const media = new Audio(source);

    media.ontimeupdate = () => {
      SyntheticPlatformEmitter.emit('didUpdatePlaybackStatus', {
        key: media,
        status: getStatusFromMedia(media),
      });
    };

    media.onerror = () => {
      SyntheticPlatformEmitter.emit('ExponentAV.onError', {
        key: media,
        error: media.error!.message,
      });
    };

    const status = setStatusForMedia(media, fullInitialStatus);

    return [media, status];
  },
  async unloadForSound(element: HTMLMediaElement) {},
  async setStatusForSound(
    element: HTMLMediaElement,
    status: PlaybackParams
  ): Promise<PlaybackStatus> {
    return setStatusForMedia(element, status);
  },
  async replaySound(element: HTMLMediaElement, status: PlaybackParams): Promise<PlaybackStatus> {
    return setStatusForMedia(element, status);
  },

  /* Recording */
  //   async setUnloadedCallbackForAndroidRecording() {},
  async getAudioRecordingStatus() {},
  async prepareAudioRecorder() {},
  async startAudioRecording() {},
  async pauseAudioRecording() {},
  async stopAudioRecording() {},
  async unloadAudioRecorder() {},
};
