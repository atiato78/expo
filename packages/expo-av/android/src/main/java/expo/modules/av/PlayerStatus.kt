package expo.modules.av

import android.net.Uri
import android.os.Bundle

data class PlayerStatus(
    val uri: Uri,
    val isLoaded: Boolean,
    val durationInMillis: Int,
    val positionMillis: Int,
    val playableDurationMillis: Int,
    val isPlaying: Boolean,
    val isBuffering: Boolean,
    val implementation: String,
    val shouldPlay: Boolean,
    val rate: Double,
    val shouldCorrectPitch: Boolean,
    val isMuted: Boolean,
    val isLooping: Boolean,
    val didJustFinish: Boolean
) {
  companion object {
    private const val STATUS_ANDROID_IMPLEMENTATION_KEY_PATH = "androidImplementation"
    private const val STATUS_IS_LOADED_KEY_PATH = "isLoaded"
    private const val STATUS_URI_KEY_PATH = "uri"
    private const val STATUS_DURATION_MILLIS_KEY_PATH = "durationMillis"
    private const val STATUS_POSITION_MILLIS_KEY_PATH = "positionMillis"
    private const val STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH = "playableDurationMillis"
    private const val STATUS_SHOULD_PLAY_KEY_PATH = "shouldPlay"
    private const val STATUS_IS_PLAYING_KEY_PATH = "isPlaying"
    private const val STATUS_IS_BUFFERING_KEY_PATH = "isBuffering"
    private const val STATUS_RATE_KEY_PATH = "rate"
    private const val STATUS_SHOULD_CORRECT_PITCH_KEY_PATH = "shouldCorrectPitch"
    private const val STATUS_IS_MUTED_KEY_PATH = "isMuted"
    private const val STATUS_IS_LOOPING_KEY_PATH = "isLooping"
    private const val STATUS_DID_JUST_FINISH_KEY_PATH = "didJustFinish"

    @JvmStatic
    fun fromBundle(bundle: Bundle): PlayerStatus {
      val uri = Uri.parse(bundle.getString(STATUS_URI_KEY_PATH))
      val isLoaded = bundle.getBoolean(STATUS_IS_LOADED_KEY_PATH, false)
      val durationInMillis = bundle.getInt(STATUS_DURATION_MILLIS_KEY_PATH, 0)
      val positionMillis = bundle.getInt(STATUS_POSITION_MILLIS_KEY_PATH, 0)
      val playableDurationMillis = bundle.getInt(STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH, 0)
      val isPlaying = bundle.getBoolean(STATUS_IS_PLAYING_KEY_PATH, false)
      val isBuffering = bundle.getBoolean(STATUS_IS_BUFFERING_KEY_PATH, false)
      val implementation = bundle.getString(STATUS_ANDROID_IMPLEMENTATION_KEY_PATH, "")
      val shouldPlay = bundle.getBoolean(STATUS_SHOULD_PLAY_KEY_PATH, false)
      val rate = bundle.getDouble(STATUS_RATE_KEY_PATH, 1.0)
      val shouldCorrectPitch = bundle.getBoolean(STATUS_SHOULD_CORRECT_PITCH_KEY_PATH, false)
      val isMuted = bundle.getBoolean(STATUS_IS_MUTED_KEY_PATH, false)
      val isLooping = bundle.getBoolean(STATUS_IS_LOOPING_KEY_PATH, false)
      val didJustFinish = bundle.getBoolean(STATUS_DID_JUST_FINISH_KEY_PATH, false)
      return PlayerStatus(
          uri,
          isLoaded,
          durationInMillis,
          positionMillis,
          playableDurationMillis,
          isPlaying,
          isBuffering,
          implementation,
          shouldPlay,
          rate,
          shouldCorrectPitch,
          isMuted,
          isLooping,
          didJustFinish)
    }
  }

  fun toBundle(): Bundle {
    val result = Bundle()
    result.putString(STATUS_URI_KEY_PATH, uri.toString())
    result.putBoolean(STATUS_IS_LOADED_KEY_PATH, isLoaded)
    result.putInt(STATUS_DURATION_MILLIS_KEY_PATH, durationInMillis)
    result.putInt(STATUS_POSITION_MILLIS_KEY_PATH, positionMillis)
    result.putInt(STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH, playableDurationMillis)
    result.putBoolean(STATUS_IS_PLAYING_KEY_PATH, isPlaying)
    result.putBoolean(STATUS_IS_BUFFERING_KEY_PATH, isBuffering)
    result.putString(STATUS_ANDROID_IMPLEMENTATION_KEY_PATH, implementation)
    result.putBoolean(STATUS_SHOULD_PLAY_KEY_PATH, shouldPlay)
    result.putDouble(STATUS_RATE_KEY_PATH, rate)
    result.putBoolean(STATUS_SHOULD_CORRECT_PITCH_KEY_PATH, shouldCorrectPitch)
    result.putBoolean(STATUS_IS_MUTED_KEY_PATH, isMuted)
    result.putBoolean(STATUS_IS_LOOPING_KEY_PATH, isLooping)
    return result
  }

}
