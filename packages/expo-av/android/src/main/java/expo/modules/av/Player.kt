package expo.modules.av

import android.os.Bundle
import org.unimodules.core.arguments.ReadableArguments

private const val PARAM_URI_KEY_PATH = "uri"
private const val defaultUri = ""

private const val PARAM_INITIAL_POSITION_PATH = "initialPosition"
private const val defaultInitialPosition = 0

private const val PARAM_ANDROID_IMPLEMENTATION_KEY_PATH = "androidImplementation"
private const val defaultAndroidImplementation = ""

private const val PARAM_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH =
    "progressUpdateIntervalMillis"
private const val defaultUpdateIntervalMillis = 0

private const val PARAM_SHOULD_PLAY_KEY_PATH = "shouldPlay"
private const val defaultShouldPlay = false

private const val PARAM_RATE_KEY_PATH = "rate"
private const val defaultRate = 1.0

private const val PARAM_SHOULD_CORRECT_PITCH_KEY_PATH = "shouldCorrectPitch"
private const val defaultShouldCorrectPitch = false

private const val PARAM_VOLUME_KEY_PATH = "volume"
private const val defaultVolume = 1.0f

private const val PARAM_IS_MUTED_KEY_PATH = "isMuted"
private const val defaultIsMuted = false

private const val PARAM_IS_LOOPING_KEY_PATH = "isLooping"
private const val defaultIsLooping = false

private const val STATUS_IS_LOADED_KEY_PATH = "isLoaded"
private const val defaultIsLoaded = false

private const val STATUS_DURATION_MILLIS_KEY_PATH = "durationMillis"
private const val defaultDurationMillis = 0
private const val STATUS_POSITION_MILLIS_KEY_PATH = "positionMillis"

private const val defaultPositionMillis = 0
private const val STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH = "playableDurationMillis"


private const val defaultPlayableDurationMillis = 0


private const val STATUS_IS_PLAYING_KEY_PATH = "isPlaying"
private const val defaultIsPlaying = false


private const val STATUS_IS_BUFFERING_KEY_PATH = "isBuffering"
private const val defaultIsBuffering = false

private const val STATUS_DID_JUST_FINISH_KEY_PATH = "didJustFinish"
private const val defaultDidJustFinish = false

data class Params(val uriPath: String = defaultUri,
                  val initialPosition: Int = defaultInitialPosition,
                  val shouldPlay: Boolean = defaultShouldPlay,
                  val updateInterval: Int = defaultUpdateIntervalMillis,
                  val implementation: String = defaultAndroidImplementation,
                  val rate: Double = defaultRate,
                  val shouldCorrectPitch: Boolean = defaultShouldCorrectPitch,
                  val volume: Float = defaultVolume,
                  val isMuted: Boolean = defaultIsMuted,
                  val isLooping: Boolean = defaultIsLooping) {

  fun update(arguments: ReadableArguments): Params {
    var result = this

    if (arguments.containsKey(PARAM_URI_KEY_PATH)) {
      result = result.copy(uriPath = arguments.getString(PARAM_URI_KEY_PATH, defaultUri))
    }
    if (arguments.containsKey(PARAM_INITIAL_POSITION_PATH)) {
      result = result.copy(
          initialPosition = arguments.getInt(PARAM_INITIAL_POSITION_PATH, defaultInitialPosition))
    }
    if (arguments.containsKey(PARAM_SHOULD_PLAY_KEY_PATH)) {
      result = result.copy(
          shouldPlay = arguments.getBoolean(PARAM_SHOULD_PLAY_KEY_PATH, defaultShouldPlay))
    }
    if (arguments.containsKey(PARAM_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH)) {
      result = result.copy(
          updateInterval = arguments.getInt(PARAM_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH,
              defaultUpdateIntervalMillis))
    }
    if (arguments.containsKey(PARAM_ANDROID_IMPLEMENTATION_KEY_PATH)) {
      result = result.copy(
          implementation = arguments.getString(PARAM_ANDROID_IMPLEMENTATION_KEY_PATH,
              defaultAndroidImplementation))
    }
    if (arguments.containsKey(PARAM_RATE_KEY_PATH)) {
      result = result.copy(rate = arguments.getDouble(PARAM_RATE_KEY_PATH, defaultRate))
    }
    if (arguments.containsKey(PARAM_SHOULD_CORRECT_PITCH_KEY_PATH)) {
      result = result.copy(
          shouldCorrectPitch = arguments.getBoolean(PARAM_SHOULD_CORRECT_PITCH_KEY_PATH,
              defaultShouldCorrectPitch))
    }
    if (arguments.containsKey(PARAM_VOLUME_KEY_PATH)) {
      result = result.copy(
          volume = arguments.getDouble(PARAM_VOLUME_KEY_PATH, defaultVolume.toDouble()).toFloat())
    }
    if (arguments.containsKey(PARAM_IS_MUTED_KEY_PATH)) {
      result = result.copy(isMuted = arguments.getBoolean(PARAM_IS_MUTED_KEY_PATH, defaultIsMuted))
    }
    if (arguments.containsKey(PARAM_IS_LOOPING_KEY_PATH)) {
      result =
          result.copy(isLooping = arguments.getBoolean(PARAM_IS_LOOPING_KEY_PATH, defaultIsLooping))
    }

    return result
  }

  fun toBundle(): Bundle {
    val bundle = Bundle()
    bundle.putString(PARAM_URI_KEY_PATH, uriPath)
    bundle.putBoolean(PARAM_SHOULD_PLAY_KEY_PATH, shouldPlay)
    bundle.putInt(PARAM_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH, updateInterval)
    bundle.putString(PARAM_ANDROID_IMPLEMENTATION_KEY_PATH, implementation)
    bundle.putDouble(PARAM_RATE_KEY_PATH, rate)
    bundle.putBoolean(PARAM_SHOULD_CORRECT_PITCH_KEY_PATH, shouldCorrectPitch)
    bundle.putDouble(PARAM_VOLUME_KEY_PATH, volume.toDouble())
    bundle.putBoolean(PARAM_IS_MUTED_KEY_PATH, isMuted)
    bundle.putBoolean(PARAM_IS_LOOPING_KEY_PATH, isLooping)
    return bundle
  }

}

data class Status(val isLoaded: Boolean = defaultIsLoaded,
                  val durationInMillis: Int = defaultDurationMillis,
                  val positionMillis: Int = defaultPositionMillis,
                  val playableDurationMillis: Int = defaultPlayableDurationMillis,
                  val isPlaying: Boolean = defaultIsPlaying,
                  val isBuffering: Boolean = defaultIsBuffering,
                  val didJustFinish: Boolean = defaultDidJustFinish) {

  fun toBundle(): Bundle {
    val result = Bundle()
    result.putBoolean(STATUS_IS_LOADED_KEY_PATH, isLoaded)
    result.putDouble(STATUS_DURATION_MILLIS_KEY_PATH, durationInMillis.toDouble())
    result.putInt(STATUS_POSITION_MILLIS_KEY_PATH, positionMillis)
    result.putInt(STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH, playableDurationMillis)
    result.putBoolean(STATUS_IS_PLAYING_KEY_PATH, isPlaying)
    result.putBoolean(STATUS_IS_BUFFERING_KEY_PATH, isBuffering)
    result.putBoolean(STATUS_DID_JUST_FINISH_KEY_PATH, didJustFinish)
    return result
  }

}