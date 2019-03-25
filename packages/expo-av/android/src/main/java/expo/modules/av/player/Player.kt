package expo.modules.av.player

import android.net.Uri
import android.os.Bundle
import android.util.Pair
import android.view.Surface
import java.net.HttpCookie

interface Player {

    fun setSurface(surface: Surface, shouldPlay: Boolean)

    fun play(mute: Boolean, rate: Float, shouldCorrectPitch: Boolean)
    fun pauseImmediately()
    fun load(status: Bundle, uri: Uri, cookies: List<HttpCookie>, loadCompletionListener: PlayerData.LoadCompletionListener)
    fun release()

    fun getImplementationName(): String
    fun getAudioSessionId(): Int

    var looping: Boolean

    fun isPlaying(): Boolean
    fun isLoaded(): Boolean
    fun isBuffering(): Boolean
    fun getDuration(): Int
    fun getPlayableDuration(): Int
    fun getCurrentPosition(): Int
    fun shouldContinueUpdatingProgress(): Boolean
    fun getVideoWidthHeight(): Pair<Int, Int>

    fun setVolume(value: Float)
    fun seekTo(newPositionMillis: Int)

    fun setPlayerStateListener(listener: PlayerStateListener)

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

    interface ProgressUpdateStatusListener {
        fun startUpdating()
        fun stopUpdating()
    }

}
