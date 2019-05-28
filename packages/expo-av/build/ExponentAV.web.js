import { SyntheticPlatformEmitter } from '@unimodules/core';
import { getUnloadedStatus } from './AV';
function getStatusFromMedia(media) {
    if (!media) {
        return getUnloadedStatus();
    }
    const isPlaying = !!(media.currentTime > 0 &&
        !media.paused &&
        !media.ended &&
        media.readyState > 2);
    // TODO: Distinguish status and params, merging it makes no sense.
    const status = {
        isLoaded: true,
        uri: media.src,
        progressUpdateIntervalMillis: 100,
        durationMillis: media.duration * 1000,
        positionMillis: media.currentTime * 1000,
        // playableDurationMillis: media.buffered * 1000,
        // seekMillisToleranceBefore?: number
        // seekMillisToleranceAfter?: number
        shouldPlay: media.autoplay,
        isPlaying,
        isBuffering: false,
        rate: media.playbackRate,
        // TODO: Bacon: This seems too complicated right now: https://webaudio.github.io/web-audio-api/#dom-biquadfilternode-frequency
        shouldCorrectPitch: false,
        volume: media.volume,
        isMuted: media.muted,
        isLooping: media.loop,
        didJustFinish: media.ended,
    };
    return status;
}
function setStatusForMedia(media, params) {
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
        }
        else {
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
    get name() {
        return 'ExponentAV';
    },
    async getStatusForVideo(element) {
        return getStatusFromMedia(element);
    },
    async loadForVideo(element, nativeSource, fullParams) {
        return getStatusFromMedia(element);
    },
    async unloadForVideo(element) {
        return getStatusFromMedia(element);
    },
    async setStatusForVideo(element, params) {
        return setStatusForMedia(element, params);
    },
    async replayVideo(element, params) {
        return setStatusForMedia(element, params);
    },
    /* Audio */
    async setAudioMode() { },
    async setAudioIsEnabled() { },
    async getStatusForSound(element) {
        return getStatusFromMedia(element);
    },
    async loadForSound(nativeSource, fullInitialStatus) {
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
                error: media.error.message,
            });
        };
        const status = setStatusForMedia(media, fullInitialStatus);
        return [media, status];
    },
    async unloadForSound(element) { },
    async setStatusForSound(element, status) {
        return setStatusForMedia(element, status);
    },
    async replaySound(element, status) {
        return setStatusForMedia(element, status);
    },
    /* Recording */
    //   async setUnloadedCallbackForAndroidRecording() {},
    async getAudioRecordingStatus() { },
    async prepareAudioRecorder() { },
    async startAudioRecording() { },
    async pauseAudioRecording() { },
    async stopAudioRecording() { },
    async unloadAudioRecorder() { },
};
//# sourceMappingURL=ExponentAV.web.js.map