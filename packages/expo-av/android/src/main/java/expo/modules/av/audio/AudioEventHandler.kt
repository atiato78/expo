package expo.modules.av.audio

interface AudioEventHandler {

  fun pauseImmediately()

  fun requiresAudioFocus(): Boolean

  fun updateVolumeMuteAndDuck()

  fun handleAudioFocusInterruptionBegan()

  fun handleAudioFocusGained()

  fun onPause()

  fun onResume()
}
