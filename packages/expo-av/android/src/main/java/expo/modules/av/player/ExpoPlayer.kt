package expo.modules.av.player

import android.net.Uri
import android.util.Pair
import android.view.Surface
import java.net.HttpCookie

interface ExpoPlayer {

  fun setSurface(surface: Surface?, shouldPlay: Boolean)

  fun play(mute: Boolean, rate: Double, shouldCorrectPitch: Boolean)
  fun pauseImmediately()
  fun load(uri: Uri, cookies: List<HttpCookie>,
           loadCompletionListener: LoadListener)

  fun release()

  var looping: Boolean

  var volume: Float
  val playing: Boolean

  val loaded: Boolean
  val buffering: Boolean
  val duration: Int
  val playableDuration: Int? // TODO: Consider changing to non-nullable
  val currentPosition: Int
  val continueUpdatingProgress: Boolean
  val videoWidthHeight: Pair<Int, Int>
  val implementationName: String
  val audioSessionId: Int

  fun seekTo(newPositionMillis: Int)

  fun setPlayerStateListener(listener: PlayerStateListener)

  interface LoadListener {
    fun onLoaded()
    fun onLoadError(error: String)
  }

  interface PlayerStateListener {
    fun onCompleted() {}
    fun onError(message: String) {}
    fun onBufferingStart() {}
    fun onBuffering(bufferedDuration: Int) {}
    fun onBufferingStop() {}
    fun onSeekCompleted() {}
    fun videoSizeChanged(width: Int, height: Int) {}
    fun statusUpdated() {}
  }

}
