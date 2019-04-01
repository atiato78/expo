@file:Suppress("DEPRECATION")

package expo.modules.av.player.exoplayer

import android.content.Context
import android.net.Uri
import android.os.Handler
import android.text.TextUtils
import android.util.Pair
import android.view.Surface
import com.google.android.exoplayer2.*
import com.google.android.exoplayer2.extractor.DefaultExtractorsFactory
import com.google.android.exoplayer2.source.AdaptiveMediaSourceEventListener
import com.google.android.exoplayer2.source.ExtractorMediaSource
import com.google.android.exoplayer2.source.MediaSource
import com.google.android.exoplayer2.source.MediaSourceEventListener
import com.google.android.exoplayer2.source.dash.DashMediaSource
import com.google.android.exoplayer2.source.dash.DefaultDashChunkSource
import com.google.android.exoplayer2.source.hls.HlsMediaSource
import com.google.android.exoplayer2.source.smoothstreaming.DefaultSsChunkSource
import com.google.android.exoplayer2.source.smoothstreaming.SsMediaSource
import com.google.android.exoplayer2.trackselection.AdaptiveTrackSelection
import com.google.android.exoplayer2.trackselection.DefaultTrackSelector
import com.google.android.exoplayer2.upstream.DataSource
import com.google.android.exoplayer2.util.Util
import expo.modules.av.PlayerStatus
import expo.modules.av.player.ExpoPlayer
import expo.modules.av.player.PlayerManager
import java.io.IOException
import java.net.HttpCookie

internal class ExoPlayerWrapper(private val context: Context,
                                private val overridingExtension: String?,
                                private val dataSourceFactory: DataSource.Factory) :
    ExpoPlayer, Player.EventListener, ExtractorMediaSource.EventListener,
    com.google.android.exoplayer2.SimpleExoPlayer.VideoListener, AdaptiveMediaSourceEventListener {

  private var simpleExoPlayer: com.google.android.exoplayer2.SimpleExoPlayer? = null
  private var loadCompletionListener: PlayerManager.LoadCompletionListener? = null
  private var firstFrameRendered = false
  private var lastPlaybackState: Int? = null
  private var loading = true
  private var playerStateListener: ExpoPlayer.PlayerStateListener? = null

  // --------- PlayerManager implementation ---------

  // Lifecycle

  override fun load(status: PlayerStatus, uri: Uri, cookies: List<HttpCookie>,
                    loadCompletionListener: PlayerManager.LoadCompletionListener) {
    // Create a default TrackSelector
    val mainHandler = Handler()
    // Measures bandwidth during playback. Can be null if not required.
    val trackSelectionFactory = AdaptiveTrackSelection.Factory()
    val trackSelector = DefaultTrackSelector(trackSelectionFactory)

    // Create the player
    simpleExoPlayer = ExoPlayerFactory.newSimpleInstance(context, trackSelector)
    simpleExoPlayer!!.addListener(this)
    simpleExoPlayer!!.addVideoListener(this)

    // Produces DataSource instances through which media data is loaded.
    try {
      // This is the MediaSource representing the media to be played.
      val source = buildMediaSource(uri, overridingExtension, mainHandler, dataSourceFactory)

      // Prepare the player with the source.
      simpleExoPlayer!!.prepare(source)
      loadCompletionListener.onLoadSuccess(status)
    } catch (e: IllegalStateException) {
      this.loadCompletionListener = loadCompletionListener
      onFatalError(e)
    }

  }

  @Synchronized
  override fun release() {
    simpleExoPlayer?.release()
    simpleExoPlayer = null
  }

  // Set status

  override fun setSurface(surface: Surface?, shouldPlay: Boolean) {
    simpleExoPlayer?.setVideoSurface(surface)
  }

  override fun play(mute: Boolean, rate: Double, shouldCorrectPitch: Boolean) {
    simpleExoPlayer?.playbackParameters =
        PlaybackParameters(rate.toFloat(), if (shouldCorrectPitch) 1.0f else rate.toFloat())
    simpleExoPlayer?.playWhenReady = true
  }

  override fun seekTo(newPositionMillis: Int) {
    simpleExoPlayer!!.seekTo(newPositionMillis.toLong())
  }

  override fun pauseImmediately() {
    if (simpleExoPlayer != null) {
      simpleExoPlayer!!.playWhenReady = false
    }
  }

  // public values and variables

  override var looping = false
    set(b) {
      simpleExoPlayer?.repeatMode = if (b) Player.REPEAT_MODE_ALL else Player.REPEAT_MODE_OFF
      field = b
    }

  override val implementationName: String
    get() = IMPLEMENTATION_NAME

  override val continueUpdatingProgress: Boolean
    get() = simpleExoPlayer != null && simpleExoPlayer!!.playWhenReady

  override val loaded: Boolean
    get() = simpleExoPlayer != null

  override var videoWidthHeight: Pair<Int, Int> = Pair(0, 0)
    private set

  override val audioSessionId: Int
    get() = simpleExoPlayer?.audioSessionId ?: 0

  override val playing: Boolean
    get() = simpleExoPlayer?.playWhenReady ?: false

  override val buffering: Boolean
    get() = loading || simpleExoPlayer?.playbackState == Player.STATE_BUFFERING

  override val duration: Int
    get() = (simpleExoPlayer?.duration ?: 0).toInt()

  override val playableDuration: Int
    get() = (simpleExoPlayer?.bufferedPosition ?: 0).toInt()

  override val currentPosition: Int
    get() = (simpleExoPlayer?.currentPosition ?: 0).toInt()

  override var volume: Float
    get() = simpleExoPlayer?.volume ?: 0.0f
    set(value) {
      simpleExoPlayer?.volume = value
    }

  // ExoPlayer.EventListener

  override fun onLoadingChanged(isLoading: Boolean) {
    loading = isLoading
    if (!isLoading) {
      playerStateListener?.onBufferingStop()
    } else {
      playerStateListener?.onBufferingStart()
    }
  }

  override fun onPlayerStateChanged(playWhenReady: Boolean, playbackState: Int) {
    if (playbackState == Player.STATE_READY && loadCompletionListener != null) {
      val listener = loadCompletionListener
      loadCompletionListener = null
      listener!!.onLoadSuccess(null)
    }

    if (lastPlaybackState != null
        && playbackState != lastPlaybackState
        && playbackState == Player.STATE_ENDED) {
      playerStateListener?.onCompleted()
    } else {
      playerStateListener?.statusUpdated()
    }
    lastPlaybackState = playbackState
  }

  override fun onPlayerError(error: ExoPlaybackException?) {
    onFatalError(error!!.cause!!)
  }

  override fun onPositionDiscontinuity(reason: Int) {
    // According to the documentation:
    // > A period defines a single logical piece of media, for example a media file.
    // > It may also define groups of ads inserted into the media,
    // > along with information about whether those ads have been loaded and played.
    // Source: https://google.github.io/ExoPlayer/doc/reference/com/google/android/exoplayer2/Timeline.Period.html
    // So I guess it's safe to say that when a period transition happens,
    // media file transition happens, so we just finished playing one.
    if (reason == Player.DISCONTINUITY_REASON_PERIOD_TRANSITION) {
      playerStateListener?.onCompleted()
    }
  }


  // ExtractorMediaSource.EventListener

  override fun onLoadError(error: IOException) {
    onFatalError(error)
  }

  private fun onFatalError(error: Throwable) {
    if (loadCompletionListener != null) {
      val listener = loadCompletionListener
      loadCompletionListener = null
      listener!!.onLoadError(error.toString())
    } else {
      playerStateListener?.onError("ExpoPlayer error: " + error.message)
    }
    release()
  }

  // ExoPlayerWrapper.VideoListener

  override fun onVideoSizeChanged(width: Int, height: Int, unAppliedRotationDegrees: Int,
                                  pixelWidthHeightRatio: Float) {
    this.videoWidthHeight = Pair(width, height)
    if (firstFrameRendered) {
      playerStateListener?.videoSizeChanged(width, height)
    }
  }

  override fun onRenderedFirstFrame() {
    if (!firstFrameRendered) {
      playerStateListener?.videoSizeChanged(
          this.videoWidthHeight.first, this.videoWidthHeight.second)
    }
    firstFrameRendered = true
  }

  // https://github.com/google/ExoPlayer/blob/2b20780482a9c6b07416bcbf4de829532859d10a/demos/main/src/main/java/com/google/android/exoplayer2/demo/PlayerActivity.java#L365-L393
  private fun buildMediaSource(uri: Uri, overrideExtension: String?, mainHandler: Handler,
                               factory: DataSource.Factory): MediaSource {
    @C.ContentType val type = if (TextUtils.isEmpty(overrideExtension)) Util.inferContentType(
        uri.toString()) else Util.inferContentType(".$overrideExtension")
    return when (type) {
      C.TYPE_SS -> SsMediaSource(uri, factory,
          DefaultSsChunkSource.Factory(factory), mainHandler, this)
      C.TYPE_DASH -> DashMediaSource(uri, factory,
          DefaultDashChunkSource.Factory(factory), mainHandler, this)
      C.TYPE_HLS -> HlsMediaSource(uri, factory, mainHandler, this)
      C.TYPE_OTHER -> ExtractorMediaSource(uri, factory, DefaultExtractorsFactory(),
          mainHandler, this)
      else -> {
        throw IllegalStateException(
            "Content of this type is unsupported at the moment. Unsupported type: $type")
      }
    }
  }

  // AdaptiveMediaSourceEventListener
  override fun onMediaPeriodCreated(windowIndex: Int, mediaPeriodId: MediaSource.MediaPeriodId) {

  }

  override fun onMediaPeriodReleased(windowIndex: Int, mediaPeriodId: MediaSource.MediaPeriodId) {

  }

  override fun onLoadStarted(windowIndex: Int, mediaPeriodId: MediaSource.MediaPeriodId?,
                             loadEventInfo: MediaSourceEventListener.LoadEventInfo,
                             mediaLoadData: MediaSourceEventListener.MediaLoadData) {
  }

  override fun onLoadCompleted(windowIndex: Int, mediaPeriodId: MediaSource.MediaPeriodId?,
                               loadEventInfo: MediaSourceEventListener.LoadEventInfo,
                               mediaLoadData: MediaSourceEventListener.MediaLoadData) {

  }

  override fun onLoadCanceled(windowIndex: Int, mediaPeriodId: MediaSource.MediaPeriodId?,
                              loadEventInfo: MediaSourceEventListener.LoadEventInfo,
                              mediaLoadData: MediaSourceEventListener.MediaLoadData) {

  }

  override fun onLoadError(windowIndex: Int, mediaPeriodId: MediaSource.MediaPeriodId?,
                           loadEventInfo: MediaSourceEventListener.LoadEventInfo,
                           mediaLoadData: MediaSourceEventListener.MediaLoadData,
                           error: IOException, wasCanceled: Boolean) {
    onLoadError(error)
  }

  override fun onReadingStarted(windowIndex: Int, mediaPeriodId: MediaSource.MediaPeriodId) {

  }

  override fun onUpstreamDiscarded(windowIndex: Int, mediaPeriodId: MediaSource.MediaPeriodId,
                                   mediaLoadData: MediaSourceEventListener.MediaLoadData) {

  }

  override fun onDownstreamFormatChanged(windowIndex: Int,
                                         mediaPeriodId: MediaSource.MediaPeriodId?,
                                         mediaLoadData: MediaSourceEventListener.MediaLoadData) {

  }

  override fun setPlayerStateListener(listener: ExpoPlayer.PlayerStateListener) {
    this.playerStateListener = listener
  }

  companion object {

    private const val IMPLEMENTATION_NAME = "ExoPlayerWrapper"
  }

}
