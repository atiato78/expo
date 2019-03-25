package expo.modules.av.player

import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.text.TextUtils
import android.util.Pair
import android.view.Surface

import com.google.android.exoplayer2.C
import com.google.android.exoplayer2.ExoPlaybackException
import com.google.android.exoplayer2.ExoPlayerFactory
import com.google.android.exoplayer2.PlaybackParameters
import com.google.android.exoplayer2.Player
import com.google.android.exoplayer2.extractor.DefaultExtractorsFactory
import com.google.android.exoplayer2.source.AdaptiveMediaSourceEventListener
import com.google.android.exoplayer2.source.ExtractorMediaSource
import com.google.android.exoplayer2.source.MediaSource
import com.google.android.exoplayer2.source.dash.DashMediaSource
import com.google.android.exoplayer2.source.dash.DefaultDashChunkSource
import com.google.android.exoplayer2.source.hls.HlsMediaSource
import com.google.android.exoplayer2.source.smoothstreaming.DefaultSsChunkSource
import com.google.android.exoplayer2.source.smoothstreaming.SsMediaSource
import com.google.android.exoplayer2.trackselection.AdaptiveTrackSelection
import com.google.android.exoplayer2.trackselection.DefaultTrackSelector
import com.google.android.exoplayer2.trackselection.TrackSelection
import com.google.android.exoplayer2.trackselection.TrackSelector
import com.google.android.exoplayer2.upstream.DataSource
import com.google.android.exoplayer2.util.Util

import java.io.IOException
import java.net.HttpCookie

internal class ExoPlayerWrapper(private val mContext: Context,
                                private val mOverridingExtension: String,
                                private val mDataSourceFactory: DataSource.Factory) :
    expo.modules.av.player.ExpoPlayer, Player.EventListener, ExtractorMediaSource.EventListener,
    com.google.android.exoplayer2.SimpleExoPlayer.VideoListener, AdaptiveMediaSourceEventListener {

  private var mSimpleExoPlayer: com.google.android.exoplayer2.SimpleExoPlayer? = null
  private var mLoadCompletionListener: PlayerManager.LoadCompletionListener? = null
  private var mFirstFrameRendered = false
  private var mVideoWidthHeight: Pair<Int, Int>? = null
  private var mLastPlaybackState: Int? = null
  override var looping = false
    set(b) {
      mSimpleExoPlayer!!.repeatMode = if (b) Player.REPEAT_MODE_ALL else Player.REPEAT_MODE_OFF
    }
  private var mIsLoading = true

  private var mPlayerStateListener = dummyPlayerStateListener()

  override val implementationName: String
    get() = IMPLEMENTATION_NAME

  override val continueUpdatingProgress: Boolean
    get() = mSimpleExoPlayer != null && mSimpleExoPlayer!!.playWhenReady

  // Get status

  override val loaded: Boolean
    get() = mSimpleExoPlayer != null

  // Video specific stuff

  override val videoWidthHeight: Pair<Int, Int>
    get() = if (mVideoWidthHeight != null) mVideoWidthHeight else Pair(0, 0)

  override val audioSessionId: Int
    get() = if (mSimpleExoPlayer != null) mSimpleExoPlayer!!.audioSessionId else 0

  override val playing: Boolean
    get() = mSimpleExoPlayer!!.playWhenReady

  override val buffering: Boolean
    get() = mIsLoading || mSimpleExoPlayer!!.playbackState == Player.STATE_BUFFERING

  override val duration: Int
    get() = mSimpleExoPlayer!!.duration.toInt()

  override val playableDuration: Int
    get() = mSimpleExoPlayer!!.bufferedPosition.toInt()

  override val currentPosition: Int
    get() = mSimpleExoPlayer!!.currentPosition.toInt()

  override var volume: Float
    get() = if (mSimpleExoPlayer != null) {
      mSimpleExoPlayer!!.volume
    } else {
      0.0f
    }
    set(value) {
      if (mSimpleExoPlayer != null) {
        mSimpleExoPlayer!!.volume = value
      }
    }

  // --------- PlayerManager implementation ---------

  // Lifecycle

  override fun load(status: Bundle, uri: Uri, cookies: List<HttpCookie>,
                    loadCompletionListener: PlayerManager.LoadCompletionListener) {
    mLoadCompletionListener = loadCompletionListener

    // Create a default TrackSelector
    val mainHandler = Handler()
    // Measures bandwidth during playback. Can be null if not required.
    val trackSelectionFactory = AdaptiveTrackSelection.Factory()
    val trackSelector = DefaultTrackSelector(trackSelectionFactory)

    // Create the player
    mSimpleExoPlayer = ExoPlayerFactory.newSimpleInstance(mContext, trackSelector)
    mSimpleExoPlayer!!.addListener(this)
    mSimpleExoPlayer!!.addVideoListener(this)

    // Produces DataSource instances through which media data is loaded.
    try {
      // This is the MediaSource representing the media to be played.
      val source = buildMediaSource(uri, mOverridingExtension, mainHandler, mDataSourceFactory)

      // Prepare the player with the source.
      mSimpleExoPlayer!!.prepare(source)
      loadCompletionListener.onLoadSuccess(status)
    } catch (e: IllegalStateException) {
      onFatalError(e)
    }

  }

  @Synchronized
  override fun release() {
    if (mSimpleExoPlayer != null) {
      mSimpleExoPlayer!!.release()
      mSimpleExoPlayer = null
    }
  }

  // Set status

  override fun play(isMuted: Boolean, rate: Float, shouldCorrectPitch: Boolean) {
    mSimpleExoPlayer!!.setPlaybackParameters(
        PlaybackParameters(rate, if (shouldCorrectPitch) 1.0f else rate))

    mSimpleExoPlayer!!.playWhenReady = true
  }

  override fun setSurface(surface: Surface, ignore: Boolean) {
    if (mSimpleExoPlayer != null) {
      mSimpleExoPlayer!!.setVideoSurface(surface)
    }
  }

  // --------- Interface implementation ---------

  // AudioEventHandler

  override fun pauseImmediately() {
    if (mSimpleExoPlayer != null) {
      mSimpleExoPlayer!!.playWhenReady = false
    }
  }

  // ExoPlayer.EventListener

  override fun onLoadingChanged(isLoading: Boolean) {
    mIsLoading = isLoading
    if (!isLoading) {
      mPlayerStateListener.onBufferingStop()
    } else {
      mPlayerStateListener.onBufferingStart()
    }
  }

  override fun onPlayerStateChanged(playWhenReady: Boolean, playbackState: Int) {
    if (playbackState == Player.STATE_READY && mLoadCompletionListener != null) {
      val listener = mLoadCompletionListener
      mLoadCompletionListener = null
      listener!!.onLoadSuccess(null)
    }

    if (mLastPlaybackState != null
        && playbackState != mLastPlaybackState
        && playbackState == Player.STATE_ENDED) {
      mPlayerStateListener.onCompleted()
    } else {
      mPlayerStateListener.statusUpdated()
    }
    mLastPlaybackState = playbackState
  }

  override fun onPlayerError(error: ExoPlaybackException?) {
    onFatalError(error!!.cause)
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
      mPlayerStateListener.onCompleted()
    }
  }


  // ExtractorMediaSource.EventListener

  override fun onLoadError(error: IOException) {
    onFatalError(error)
  }

  private fun onFatalError(error: Throwable) {
    if (mLoadCompletionListener != null) {
      val listener = mLoadCompletionListener
      mLoadCompletionListener = null
      listener!!.onLoadError(error.toString())
    } else {
      mPlayerStateListener.onError("ExpoPlayer error: " + error.message)
    }
    release()
  }

  // ExoPlayerWrapper.VideoListener

  override fun onVideoSizeChanged(width: Int, height: Int, unAppliedRotationDegrees: Int,
                                  pixelWidthHeightRatio: Float) {
    // TODO other params?
    mVideoWidthHeight = Pair(width, height)
    if (mFirstFrameRendered) {
      mPlayerStateListener.videoSizeChanged(width, height)
    }
  }

  override fun onRenderedFirstFrame() {
    if (!mFirstFrameRendered && mVideoWidthHeight != null) {
      mPlayerStateListener.videoSizeChanged(mVideoWidthHeight!!.first, mVideoWidthHeight!!.second)
    }
    mFirstFrameRendered = true
  }

  // https://github.com/google/ExoPlayer/blob/2b20780482a9c6b07416bcbf4de829532859d10a/demos/main/src/main/java/com/google/android/exoplayer2/demo/PlayerActivity.java#L365-L393
  private fun buildMediaSource(uri: Uri, overrideExtension: String, mainHandler: Handler,
                               factory: DataSource.Factory): MediaSource {
    @C.ContentType val type = if (TextUtils.isEmpty(overrideExtension)) Util.inferContentType(
        uri.toString()) else Util.inferContentType(".$overrideExtension")
    when (type) {
      C.TYPE_SS -> return SsMediaSource(uri, factory,
          DefaultSsChunkSource.Factory(factory), mainHandler, this)
      C.TYPE_DASH -> return DashMediaSource(uri, factory,
          DefaultDashChunkSource.Factory(factory), mainHandler, this)
      C.TYPE_HLS -> return HlsMediaSource(uri, factory, mainHandler, this)
      C.TYPE_OTHER -> return ExtractorMediaSource(uri, factory, DefaultExtractorsFactory(),
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

  override fun seekTo(newPositionMillis: Int) {
    mSimpleExoPlayer!!.seekTo(newPositionMillis.toLong())
  }

  override fun setPlayerStateListener(listener: ExpoPlayer.PlayerStateListener) {
    this.mPlayerStateListener = listener
  }

  private fun dummyPlayerStateListener(): ExpoPlayer.PlayerStateListener {
    return object : ExpoPlayer.PlayerStateListener {

      override fun onCompleted() {}

      override fun onError(message: String) {}

      override fun onBufferingStart() {}

      override fun onBuffering(bufferedDuration: Int) {}

      override fun onBufferingStop() {}

      override fun onSeekCompleted() {}

      override fun videoSizeChanged(width: Int, height: Int) {}

      override fun statusUpdated() {}
    }
  }

  companion object {

    private val IMPLEMENTATION_NAME = "ExoPlayerWrapper"
  }

}
