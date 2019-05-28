package expo.modules.av.player

import android.widget.MediaController

class PlayerControl(private val mPlayerManager: PlayerManager) :
    MediaController.MediaPlayerControl {

  val isFullscreen: Boolean
    get() = mPlayerManager.isPresentedFullscreen

  override fun start() {
    mPlayerManager.play()
  }

  override fun pause() {
    mPlayerManager.pause()
  }

  override fun seekTo(positionMillis: Int) {
    mPlayerManager.seekTo(positionMillis)
  }

  override fun getDuration(): Int {
    return mPlayerManager.status.durationInMillis
  }

  override fun getCurrentPosition(): Int {
    return mPlayerManager.status.positionMillis
  }

  override fun isPlaying(): Boolean {
    return mPlayerManager.isPlaying
  }

  override fun getBufferPercentage(): Int {
    val status = mPlayerManager.status
    return if (status.isLoaded && status.durationInMillis > 0 && status.playableDurationMillis > 0) {
      (status.playableDurationMillis / status.durationInMillis * 100.0).toInt()
    } else {
      0
    }
  }

  override fun canPause(): Boolean {
    return true
  }

  override fun canSeekBackward(): Boolean {
    return true
  }

  override fun canSeekForward(): Boolean {
    return true
  }

  override fun getAudioSessionId(): Int {
    return mPlayerManager.audioSessionId
  }

  fun toggleFullscreen() {
    mPlayerManager.toggleFullscreen()
  }
}
