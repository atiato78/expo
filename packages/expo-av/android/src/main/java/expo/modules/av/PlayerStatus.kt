package expo.modules.av

import android.os.Bundle
import org.unimodules.core.arguments.ReadableArguments


// TODO: Builder! Let's take nullable Player status and expose methods for each field.
data class PlayerStatus(
    val uriPath: String = defaultUri,
    val isLoaded: Boolean = false,
    val durationInMillis: Int = defaultDurationMillis,
    val positionMillis: Int = defaultPositionMillis,
    val updateInterval: Int = defaultUpdateIntervalMillis,
    val playableDurationMillis: Int = defaultPlayableDurationMillis,
    val isPlaying: Boolean = defaultIsPlaying,
    val isBuffering: Boolean = defaultIsBuffering,
    val implementation: String? = defaultAndroidImplementation,
    val shouldPlay: Boolean = defaultShouldPlay,
    val rate: Double = defaultRate,
    val shouldCorrectPitch: Boolean = defaultShouldCorrectPitch,
    val volume: Float = defaultVolume,
    val isMuted: Boolean = defaultIsMuted,
    val isLooping: Boolean = defaultIsLooping,
    val didJustFinish: Boolean = defaultDidJustFinish
) {
  companion object {
    private const val STATUS_URI_KEY_PATH = "uri"
    private const val defaultUri = ""

    private const val STATUS_ANDROID_IMPLEMENTATION_KEY_PATH = "androidImplementation"
    private const val defaultAndroidImplementation = ""

    private const val STATUS_IS_LOADED_KEY_PATH = "isLoaded"
    private const val defaultIsLoaded = false

    private const val STATUS_DURATION_MILLIS_KEY_PATH = "durationMillis"
    private const val defaultDurationMillis = 0


    private const val STATUS_POSITION_MILLIS_KEY_PATH = "positionMillis"
    private const val defaultPositionMillis = 0


    private const val STATUS_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH =
        "progressUpdateIntervalMillis"
    private const val defaultUpdateIntervalMillis = 0


    private const val STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH = "playableDurationMillis"
    private const val defaultPlayableDurationMillis = 0


    private const val STATUS_SHOULD_PLAY_KEY_PATH = "shouldPlay"
    private const val defaultShouldPlay = false


    private const val STATUS_IS_PLAYING_KEY_PATH = "isPlaying"
    private const val defaultIsPlaying = false


    private const val STATUS_IS_BUFFERING_KEY_PATH = "isBuffering"
    private const val defaultIsBuffering = false


    private const val STATUS_RATE_KEY_PATH = "rate"
    private const val defaultRate = 1.0


    private const val STATUS_SHOULD_CORRECT_PITCH_KEY_PATH = "shouldCorrectPitch"
    private const val defaultShouldCorrectPitch = false

    private const val STATUS_VOLUME_KEY_PATH = "volume"
    private const val defaultVolume = 1.0f

    private const val STATUS_IS_MUTED_KEY_PATH = "isMuted"
    private const val defaultIsMuted = false

    private const val STATUS_IS_LOOPING_KEY_PATH = "isLooping"
    private const val defaultIsLooping = false

    private const val STATUS_DID_JUST_FINISH_KEY_PATH = "didJustFinish"
    private const val defaultDidJustFinish = false

    @JvmStatic
    fun unloadedPlayerStatus(): PlayerStatus {
      return PlayerStatus(isLoaded = false)
    }

    @JvmStatic
    fun fromReadableArguments(arguments: ReadableArguments): PlayerStatus {
      val uri = arguments.getString(STATUS_URI_KEY_PATH, defaultUri)
      val isLoaded = arguments.getBoolean(STATUS_IS_LOADED_KEY_PATH, defaultIsLoaded)
      val durationInMillis =
          arguments.getInt(STATUS_DURATION_MILLIS_KEY_PATH, defaultDurationMillis)
      val positionMillis =
          arguments.getDouble(STATUS_POSITION_MILLIS_KEY_PATH, defaultPositionMillis.toDouble())
              .toInt()
      val updateInterval = arguments.getInt(STATUS_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH,
          defaultUpdateIntervalMillis)
      val playableDurationMillis =
          arguments.getInt(STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH, defaultPlayableDurationMillis)
      val isPlaying = arguments.getBoolean(STATUS_IS_PLAYING_KEY_PATH, defaultIsPlaying)
      val isBuffering = arguments.getBoolean(STATUS_IS_BUFFERING_KEY_PATH, defaultIsBuffering)
      val androidImplementation =
          arguments.getString(STATUS_ANDROID_IMPLEMENTATION_KEY_PATH, defaultAndroidImplementation)
      val shouldPlay = arguments.getBoolean(STATUS_SHOULD_PLAY_KEY_PATH, defaultShouldPlay)
      val rate = arguments.getDouble(STATUS_RATE_KEY_PATH, defaultRate)
      val shouldCorrectPitch =
          arguments.getBoolean(STATUS_SHOULD_CORRECT_PITCH_KEY_PATH, defaultShouldCorrectPitch)
      val volume = arguments.getDouble(STATUS_VOLUME_KEY_PATH, defaultVolume.toDouble()).toFloat()
      val isMuted = arguments.getBoolean(STATUS_IS_MUTED_KEY_PATH, defaultIsMuted)
      val isLooping = arguments.getBoolean(STATUS_IS_LOOPING_KEY_PATH, defaultIsLooping)
      val didJustFinish =
          arguments.getBoolean(STATUS_DID_JUST_FINISH_KEY_PATH, defaultDidJustFinish)
      return PlayerStatus(
          uri,
          isLoaded,
          durationInMillis,
          positionMillis,
          updateInterval,
          playableDurationMillis,
          isPlaying,
          isBuffering,
          androidImplementation,
          shouldPlay,
          rate,
          shouldCorrectPitch,
          volume,
          isMuted,
          isLooping,
          didJustFinish)
    }

    @JvmStatic
    fun fromBundle(bundle: Bundle): PlayerStatus {
      val uri = bundle.getString(STATUS_URI_KEY_PATH, defaultUri)
      val isLoaded = bundle.getBoolean(STATUS_IS_LOADED_KEY_PATH, defaultIsLoaded)
      val durationInMillis =
          bundle.getInt(STATUS_DURATION_MILLIS_KEY_PATH, defaultDurationMillis)
      val positionMillis = bundle.getInt(STATUS_POSITION_MILLIS_KEY_PATH, defaultPositionMillis)
      val updateInterval = bundle.getInt(STATUS_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH,
          defaultUpdateIntervalMillis)
      val playableDurationMillis =
          bundle.getInt(STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH, defaultPlayableDurationMillis)
      val isPlaying = bundle.getBoolean(STATUS_IS_PLAYING_KEY_PATH, defaultIsPlaying)
      val isBuffering = bundle.getBoolean(STATUS_IS_BUFFERING_KEY_PATH, defaultIsBuffering)
      val androidImplementation =
          bundle.getString(STATUS_ANDROID_IMPLEMENTATION_KEY_PATH, defaultAndroidImplementation)
      val shouldPlay = bundle.getBoolean(STATUS_SHOULD_PLAY_KEY_PATH, defaultShouldPlay)
      val rate = bundle.getDouble(STATUS_RATE_KEY_PATH, defaultRate)
      val shouldCorrectPitch =
          bundle.getBoolean(STATUS_SHOULD_CORRECT_PITCH_KEY_PATH, defaultShouldCorrectPitch)
      val volume = bundle.getFloat(STATUS_VOLUME_KEY_PATH, defaultVolume)
      val isMuted = bundle.getBoolean(STATUS_IS_MUTED_KEY_PATH, defaultIsMuted)
      val isLooping = bundle.getBoolean(STATUS_IS_LOOPING_KEY_PATH, defaultIsLooping)
      val didJustFinish = bundle.getBoolean(STATUS_DID_JUST_FINISH_KEY_PATH, defaultDidJustFinish)
      return PlayerStatus(
          uri,
          isLoaded,
          durationInMillis,
          positionMillis,
          updateInterval,
          playableDurationMillis,
          isPlaying,
          isBuffering,
          androidImplementation,
          shouldPlay,
          rate,
          shouldCorrectPitch,
          volume,
          isMuted,
          isLooping,
          didJustFinish)
    }
  }

  fun toBundle(): Bundle {
    val result = Bundle()
    result.putString(STATUS_URI_KEY_PATH, uriPath)
    result.putBoolean(STATUS_IS_LOADED_KEY_PATH, isLoaded)
    result.putDouble(STATUS_DURATION_MILLIS_KEY_PATH, durationInMillis.toDouble())
    result.putInt(STATUS_POSITION_MILLIS_KEY_PATH, positionMillis)
    result.putInt(STATUS_PROGRESS_UPDATE_INTERVAL_MILLIS_KEY_PATH, updateInterval)
    result.putInt(STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH, playableDurationMillis)
    result.putBoolean(STATUS_IS_PLAYING_KEY_PATH, isPlaying)
    result.putBoolean(STATUS_IS_BUFFERING_KEY_PATH, isBuffering)
    result.putString(STATUS_ANDROID_IMPLEMENTATION_KEY_PATH, implementation)
    result.putBoolean(STATUS_SHOULD_PLAY_KEY_PATH, shouldPlay)
    result.putDouble(STATUS_RATE_KEY_PATH, rate)
    result.putBoolean(STATUS_SHOULD_CORRECT_PITCH_KEY_PATH, shouldCorrectPitch)
    result.putFloat(STATUS_VOLUME_KEY_PATH, volume)
    result.putBoolean(STATUS_IS_MUTED_KEY_PATH, isMuted)
    result.putBoolean(STATUS_IS_LOOPING_KEY_PATH, isLooping)
    return result
  }

}
