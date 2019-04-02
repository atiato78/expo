package expo.modules.av.player.mediaPlayer

import android.content.Context
import android.media.PlaybackParams
import android.net.Uri
import android.os.Build
import android.support.annotation.RequiresApi
import android.util.Pair
import android.view.Surface
import expo.modules.av.player.ExpoPlayer
import java.net.HttpCookie
import java.util.*

internal class MediaPlayerWrapper(private val context: Context,
                                  private val requestHeaders: Map<String, Any>?) :
    ExpoPlayer, android.media.MediaPlayer.OnBufferingUpdateListener,
    android.media.MediaPlayer.OnCompletionListener, android.media.MediaPlayer.OnErrorListener,
    android.media.MediaPlayer.OnInfoListener, android.media.MediaPlayer.OnSeekCompleteListener,
    android.media.MediaPlayer.OnVideoSizeChangedListener {

  private var mediaPlayer: android.media.MediaPlayer? = null
  private var mediaPlayerHasEverStarted = false

  private var playerStateListener: ExpoPlayer.PlayerStateListener? = null

  override fun setPlayerStateListener(listener: ExpoPlayer.PlayerStateListener) {
    this.playerStateListener = listener
  }

  // Lifecycle

  override fun load(uri: Uri, cookies: List<HttpCookie>,
                    loadCompletionListener: ExpoPlayer.LoadListener) {
    if (mediaPlayer != null) {
      loadCompletionListener.onLoadError(
          "Load encountered an error: MediaPlayerWrapper cannot be loaded twice.")
      return
    }

    val unpreparedPlayer = android.media.MediaPlayer()

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        unpreparedPlayer.setDataSource(context, uri, null, cookies)
      } else {
        val headers = HashMap<String, String>(1)
        val cookieBuilder = StringBuilder()
        for (httpCookie in cookies) {
          cookieBuilder.append(httpCookie.name)
          cookieBuilder.append("=")
          cookieBuilder.append(httpCookie.value)
          cookieBuilder.append("; ")
        }
        cookieBuilder.append("\r\n")
        headers["Cookie"] = cookieBuilder.toString()
        if (requestHeaders != null) {
          for ((key, value) in requestHeaders) {
            if (value is String) {
              headers[key] = value
            }
          }
        }
        unpreparedPlayer.setDataSource(context, uri, headers)
      }
    } catch (throwable: Throwable) {
      loadCompletionListener.onLoadError(
          "Load encountered an error: setDataSource() threw an exception was thrown with message: $throwable")
      return
    }

    unpreparedPlayer.setOnErrorListener { _, what, extra ->
      loadCompletionListener.onLoadError(
          "Load encountered an error: the OnErrorListener was called with 'what' code $what and 'extra' code $extra.")
      true
    }

    unpreparedPlayer.setOnPreparedListener { mp ->
      mediaPlayer = mp
      mediaPlayer!!.setOnBufferingUpdateListener(this@MediaPlayerWrapper)
      mediaPlayer!!.setOnCompletionListener(this@MediaPlayerWrapper)
      mediaPlayer!!.setOnErrorListener(this@MediaPlayerWrapper)
      mediaPlayer!!.setOnInfoListener(this@MediaPlayerWrapper)

      loaded = true

      loadCompletionListener.onLoaded()
    }

    try {
      unpreparedPlayer.prepareAsync()
    } catch (throwable: Throwable) {
      loadCompletionListener.onLoadError(
          "Load encountered an error: an exception was thrown from prepareAsync() with message: $throwable")
    }

  }

  @Synchronized
  override fun release() {
    if (mediaPlayer != null) {
      mediaPlayer!!.setOnBufferingUpdateListener(null)
      mediaPlayer!!.setOnCompletionListener(null)
      mediaPlayer!!.setOnErrorListener(null)
      mediaPlayer!!.setOnInfoListener(null)
      mediaPlayer!!.stop()
      mediaPlayer!!.release()
      mediaPlayer = null
    }
  }

  // Video specific

  // TODO: We should be able to determine shouldPlay within this class. Passing it to this method does not look good.
  override fun setSurface(surface: Surface?, shouldPlay: Boolean) {
    if (mediaPlayer == null) {
      return // TODO: Throw an exception which will determine that load should be called before!
    }
    mediaPlayer!!.setSurface(surface)
    if (!mediaPlayerHasEverStarted && !shouldPlay) {
      // For some reason, the media player does not render to the screen until start() has been
      // called in some cases.
      mediaPlayer!!.start()
      mediaPlayer!!.pause()
      mediaPlayerHasEverStarted = true
    }
  }

  override val audioSessionId: Int
    get() = mediaPlayer?.audioSessionId ?: 0

  // Controls

  override fun play(mute: Boolean, rate: Double, shouldCorrectPitch: Boolean) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      if (!mediaPlayer!!.isPlaying) {
        mediaPlayer!!.start()
        mediaPlayerHasEverStarted = true
      }
    } else {
      val params = mediaPlayer!!.playbackParams
      val setRate = params.speed.toDouble()
      val setShouldCorrectPitch = params.pitch == 1.0f
      val rateAndPitchAreSetCorrectly =
          setRate == rate && setShouldCorrectPitch == shouldCorrectPitch

      if (rate >= 0f && (!mediaPlayer!!.isPlaying || !rateAndPitchAreSetCorrectly)) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
          playMediaPlayerWithRateMAndHigher(rate, shouldCorrectPitch)
        } else {
          // Bizarrely, I wasn't able to change rate while a sound was playing unless I had
          // changed the rate to something other than 1f before the sound started.
          // This workaround seems to fix this issue (which is said to only be fixed in N):
          // https://code.google.com/p/android/issues/detail?id=192135
          playMediaPlayerWithRateMAndHigher(2.0, shouldCorrectPitch)
          mediaPlayer!!.pause()
          playMediaPlayerWithRateMAndHigher(rate, shouldCorrectPitch)
        }
        mediaPlayerHasEverStarted = true
      }
    }
  }

  @RequiresApi(api = Build.VERSION_CODES.M)
  private fun playMediaPlayerWithRateMAndHigher(rate: Double, shouldCorrectPitch: Boolean) {
    val params = mediaPlayer!!.playbackParams
    params.pitch = if (shouldCorrectPitch) 1.0f else rate.toFloat()
    params.speed = rate.toFloat()
    params.audioFallbackMode = PlaybackParams.AUDIO_FALLBACK_MODE_DEFAULT
    mediaPlayer!!.playbackParams = params
    mediaPlayer!!.start()
  }

  override fun pauseImmediately() {
    if (mediaPlayerHasEverStarted) {
      mediaPlayer?.pause()
    }
  }

  override fun seekTo(newPositionMillis: Int) {
    mediaPlayer?.seekTo(newPositionMillis)
  }

// public values and variables

  override val implementationName = IMPLEMENTATION_NAME

  override val playing: Boolean
    get() = mediaPlayer != null && mediaPlayer!!.isPlaying

  override var loaded: Boolean = false
    get() = mediaPlayer != null && field
    private set

  override var buffering: Boolean = false
    private set

  override val duration: Int
    get() = mediaPlayer!!.duration

  override var playableDuration: Int? = 0
    private set

  override val currentPosition: Int
    get() = mediaPlayer!!.currentPosition

  override var looping: Boolean
    get() = mediaPlayer!!.isLooping
    set(looping) {
      mediaPlayer!!.isLooping = looping
    }

  override var volume: Float = 1.0f
    set(value) {
      mediaPlayer?.setVolume(value, value)
    }

  override val continueUpdatingProgress: Boolean
    get() = mediaPlayer != null && buffering

  override val videoWidthHeight: Pair<Int, Int>
    get() = mediaPlayer?.videoWidthHeight() ?: Pair(0, 0)

// Callbacks

  override fun onBufferingUpdate(mp: android.media.MediaPlayer, percent: Int) {
    fun durationInMillis(): Int {
      return (mp.duration * (percent.toDouble() / 100.0)).toInt()
    }

    playableDuration = if (mp.duration >= 0) durationInMillis() else null
    playerStateListener?.onBuffering(playableDuration!!)

  }

  override fun onCompletion(mp: android.media.MediaPlayer) {
    playerStateListener?.onCompleted()
  }

  override fun onError(mp: android.media.MediaPlayer, what: Int, extra: Int): Boolean {
    release()
    playerStateListener?.onError(
        "MediaPlayerWrapper failed with 'what' code $what and 'extra' code $extra.")
    return true
  }

  override fun onInfo(mp: android.media.MediaPlayer, what: Int, extra: Int): Boolean {
    // Writing out all of the possible values here for clarity
    // @jesseruder @nikki93 I think we should hold off on handling some of the more obscure values
    // until the ExoPlayer refactor.
    when (what) {
      android.media.MediaPlayer.MEDIA_INFO_BUFFERING_START -> {
        buffering = true
        playerStateListener?.onBufferingStart()
      }
      android.media.MediaPlayer.MEDIA_INFO_BUFFERING_END -> {
        buffering = false
        playerStateListener?.onBufferingStop()
      }
      android.media.MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START -> playerStateListener?.videoSizeChanged(
          mp.videoWidth, mp.videoHeight)
      android.media.MediaPlayer.MEDIA_INFO_UNKNOWN,
      android.media.MediaPlayer.MEDIA_INFO_BAD_INTERLEAVING,
      android.media.MediaPlayer.MEDIA_INFO_NOT_SEEKABLE,
      android.media.MediaPlayer.MEDIA_INFO_METADATA_UPDATE,
      android.media.MediaPlayer.MEDIA_INFO_UNSUPPORTED_SUBTITLE,
      android.media.MediaPlayer.MEDIA_INFO_SUBTITLE_TIMED_OUT,
      android.media.MediaPlayer.MEDIA_INFO_VIDEO_TRACK_LAGGING
      -> playerStateListener?.statusUpdated()
    }
    return true
  }

  override fun onSeekComplete(mp: android.media.MediaPlayer) {
    playerStateListener?.onSeekCompleted()
  }

  override fun onVideoSizeChanged(mp: android.media.MediaPlayer, width: Int, height: Int) {
    playerStateListener?.videoSizeChanged(width, height)
  }

  companion object {
    const val IMPLEMENTATION_NAME = "MediaPlayer"
  }

}
