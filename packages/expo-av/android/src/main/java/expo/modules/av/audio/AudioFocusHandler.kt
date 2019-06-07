package expo.modules.av.audio

import android.annotation.TargetApi
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.support.annotation.RequiresApi

class AudioFocusHandler(private val audioManager: AudioManager) {

  enum class FocusGain(val value: Int) {
    GAIN(AudioManager.AUDIOFOCUS_GAIN),
    GAIN_TRANSIENT(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT),
    GAIN_TRANSIENT_MAY_DUCK(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK),
    GAIN_TRANSIENT_EXCLUSIVE(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE)
  }

  enum class FocusState {
    GAINED,
    LOST_MAY_DUCK,
    TEMPORARILY_LOST,
    LOST,
    ERROR
  }

  @TargetApi(Build.VERSION_CODES.O)
  enum class AudioContentType(val value: Int) {
    TYPE_MOVIE(AudioAttributes.CONTENT_TYPE_MOVIE),
    TYPE_MUSIC(AudioAttributes.CONTENT_TYPE_MUSIC),
    TYPE_SONIFICATION(AudioAttributes.CONTENT_TYPE_SONIFICATION),
    TYPE_SPEECH(AudioAttributes.CONTENT_TYPE_SPEECH),
    TYPE_UNKNOWN(AudioAttributes.CONTENT_TYPE_UNKNOWN),
  }

  @TargetApi(Build.VERSION_CODES.O)
  enum class AudioUsage(val value: Int) {
    UNKNOWN(AudioAttributes.USAGE_UNKNOWN),
    MEDIA(AudioAttributes.USAGE_MEDIA),
    VOICE_COMMUNICATION(AudioAttributes.USAGE_VOICE_COMMUNICATION),
    VOICE_COMMUNICATION_SIGNALLING(AudioAttributes.USAGE_VOICE_COMMUNICATION_SIGNALLING),
    ALARM(AudioAttributes.USAGE_ALARM),
    NOTIFICATION(AudioAttributes.USAGE_NOTIFICATION),
    NOTIFICATION_RINGTONE(AudioAttributes.USAGE_NOTIFICATION_RINGTONE),
    NOTIFICATION_COMMUNICATION_REQUEST(AudioAttributes.USAGE_NOTIFICATION_COMMUNICATION_REQUEST),
    NOTIFICATION_COMMUNICATION_INSTANT(AudioAttributes.USAGE_NOTIFICATION_COMMUNICATION_INSTANT),
    NOTIFICATION_COMMUNICATION_DELAYED(AudioAttributes.USAGE_NOTIFICATION_COMMUNICATION_DELAYED),
    NOTIFICATION_EVENT(AudioAttributes.USAGE_NOTIFICATION_EVENT),
    ASSISTANT(AudioAttributes.USAGE_ASSISTANT),
    ASSISTANCE_ACCESSIBILITY(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY),
    ASSISTANCE_NAVIGATION_GUIDANCE(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE),
    ASSISTANCE_SONIFICATION(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION),
    GAME(AudioAttributes.USAGE_GAME),
  }

  enum class StreamType(val value: Int) {
    ALARM(AudioManager.STREAM_ALARM),
    DTMF(AudioManager.STREAM_DTMF),
    MUSIC(AudioManager.STREAM_MUSIC),
    NOTIFICATION(AudioManager.STREAM_NOTIFICATION),
    RING(AudioManager.STREAM_RING),
    SYSTEM(AudioManager.STREAM_SYSTEM),
    VOICE_CALL(AudioManager.STREAM_VOICE_CALL),
  }

  data class PreOreoFocusParams(val streamType: StreamType, val durationHint: FocusGain)

  data class FocusParams(val focusGain: FocusGain,
                         val usage: AudioUsage,
                         val contentType: AudioContentType,
                         val pauseWhenDucked: Boolean = true,
                         val acceptDelayedFocus: Boolean = true)

  @RequiresApi(Build.VERSION_CODES.O)
  fun requestFocus(params: FocusParams, focusListener: AudioFocusChangeListener) {
    val (focusGain, usage, contentType, pauseWhenDucked, acceptDelayedFocus) = params
    val audioAttributes =
        AudioAttributes.Builder()
            .setContentType(contentType.value)
            .setUsage(usage.value)
            .build()
    val focusRequest =
        AudioFocusRequest.Builder(focusGain.value)
            .setWillPauseWhenDucked(pauseWhenDucked)
            .setAcceptsDelayedFocusGain(acceptDelayedFocus)
            .setAudioAttributes(audioAttributes)
            .setOnAudioFocusChangeListener(audioFocusListener(focusListener))
            .build()
    val result = this.audioManager.requestAudioFocus(focusRequest)
    handleAudioRequestResult(result, focusListener)
  }

  fun requestFocus(params: PreOreoFocusParams, focusListener: AudioFocusChangeListener) {
    val (streamType, durationHint) = params
    @Suppress("deprecation")
    val result = this.audioManager.requestAudioFocus(audioFocusListener(focusListener), streamType.value, durationHint.value)
    handleAudioRequestResult(result, focusListener)
  }

  fun releaseAudioFocus(focusListener: AudioFocusChangeListener) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      @Suppress("deprecation")
      audioManager.abandonAudioFocus(audioFocusListener(focusListener))
    }
  }

  fun audioFocusListener(focusListener: AudioFocusChangeListener): (focusChange: Int) -> Unit =
      { focusChange ->
        when (focusChange) {
          AudioManager.AUDIOFOCUS_GAIN ->
            focusListener.focusStateChanged(FocusState.GAINED)
          AudioManager.AUDIOFOCUS_LOSS ->
            focusListener.focusStateChanged(FocusState.LOST)
          AudioManager.AUDIOFOCUS_LOSS_TRANSIENT ->
            focusListener.focusStateChanged(FocusState.TEMPORARILY_LOST)
          AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK ->
            focusListener.focusStateChanged(FocusState.LOST_MAY_DUCK)
        }
      }

  private fun handleAudioRequestResult(result: Int, focusListener: AudioFocusChangeListener) {
    when (result) {
      AudioManager.AUDIOFOCUS_REQUEST_GRANTED ->
        focusListener.focusStateChanged(FocusState.GAINED)
      AudioManager.AUDIOFOCUS_REQUEST_FAILED ->
        focusListener.focusStateChanged(FocusState.ERROR)
    }
  }

  interface AudioFocusChangeListener {
    fun focusStateChanged(state: FocusState)
  }

}