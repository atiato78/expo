package expo.modules.av.player

import android.net.Uri
import android.os.Build
import android.os.Handler
import android.util.Log
import android.util.Pair
import android.view.Surface
import expo.modules.av.audio.focus.AudioFocusAquiringError
import expo.modules.av.Params
import expo.modules.av.SeekToParams
import expo.modules.av.Status
import expo.modules.av.audio.AudioEventHandler
import expo.modules.av.audio.focus.AudioFocusChangeListener
import expo.modules.av.audio.focus.AudioFocusHandler
import org.unimodules.core.Promise
import org.unimodules.core.arguments.ReadableArguments
import java.io.IOException
import java.lang.ref.WeakReference
import java.net.CookieHandler
import java.net.HttpCookie
import java.net.URI
import java.util.*

class PlayerManager(private val player: ExpoPlayer, private val cookieHandler: CookieHandler?,
                    private val focusManager: AudioFocusHandler,
                    private val uri: Uri) : AudioEventHandler, ExpoPlayer.PlayerStateListener {

  private val mHandler = Handler()
  private val mProgressUpdater = ProgressUpdater(this)
  private val focusChangeListener = AudioFocusListener()

  private var mFullscreenPresenter: FullscreenPresenter? = null
  private var mParamsUpdatedListener: ParamsUpdatedListener? = null
  private var mStatusUpdateListener: StatusUpdateListener? = null
  private var mErrorListener: ErrorListener? = null
  private var mVideoSizeUpdateListener: VideoSizeUpdateListener? = null

//  private var mPlayerStatus: PlayerStatus = PlayerStatus.unloadedPlayerStatus()

  init {
    player.setPlayerStateListener(this)
  }

  val videoWidthHeight: Pair<Int, Int>
    get() = player.videoWidthHeight

  //TODO: Uncomment when done with params

  val isPlaying: Boolean
    get() = status.isLoaded && status.isPlaying

  var params: Params = Params()
    private set

  val status: Status
    @Synchronized get() {
      return Status(
          isLoaded = player.loaded,
          durationInMillis = player.duration,
          positionMillis = player.currentPosition,
          isPlaying = player.playing,
          isBuffering = player.buffering,
          playableDurationMillis = player.playableDuration ?: 0
      )
    }

  val audioSessionId: Int
    get() = player.audioSessionId

  val isPresentedFullscreen: Boolean
    get() = mFullscreenPresenter!!.isBeingPresentedFullscreen

  private// do nothing, we'll return an empty list
  val httpCookiesList: List<HttpCookie>
    get() {
      if (cookieHandler != null) {
        try {
          val headersMap = cookieHandler.get(URI.create(uri.toString()), null)
          val cookies = headersMap["Cookie"]
          return if (cookies != null) {
            val httpCookies = ArrayList<HttpCookie>()
            for (cookieValue in cookies) {
              httpCookies.addAll(HttpCookie.parse(cookieValue))
            }
            httpCookies
          } else {
            emptyList()
          }
        } catch (e: IOException) {
          // TODO: This look nasty
        }
      }
      return emptyList()
    }

  fun play() {
    this.params = params.copy(shouldPlay = true)
  }

  fun pause() {
    this.params = params.copy(shouldPlay = false)
  }

  fun seekTo(arguments: ReadableArguments, promise: Promise) {
    val seekToParams = SeekToParams.fromReadableArguments(arguments);
    if(seekToParams != null) {
      seekTo(seekToParams.position)
      promise.resolve(true)
    } else {
      promise.reject("E_AV_SEEK_TO", "Params are invalid!")
    }
  }

  fun seekTo(positionMillis: Int) {
    player.seekTo(positionMillis)
  }

  interface VideoSizeUpdateListener {
    fun onVideoSizeUpdate(videoWidthHeight: Pair<Int, Int>)
  }

  interface ErrorListener {
    fun onError(error: String)
  }

  interface LoadCompletionListener {
    fun onLoadSuccess(status: Status)

    fun onLoadError(error: String)
  }

  interface ParamsUpdatedListener {
    fun onParamsUpdate(params: Params?)
  }

  interface StatusUpdateListener {
    fun onStatusUpdate(status: Status?)
  }

  internal interface SetParamsCompletionListener {
    fun onSetStatusComplete()

    fun onSetStatusError(error: String)
  }

  interface FullscreenPresenter {
    val isBeingPresentedFullscreen: Boolean

    fun setFullscreenMode(isFullscreen: Boolean)
  }

  private inner class ProgressUpdater constructor(playerManager: PlayerManager) : Runnable {
    private val mPlayerDataWeakReference: WeakReference<PlayerManager> =
        WeakReference(playerManager)

    override fun run() {
      val playerManager = mPlayerDataWeakReference.get()
      playerManager?.callStatusUpdateListener()
      playerManager?.progressUpdateLoop()
    }
  }
  // Lifecycle

  fun load(arguments: ReadableArguments, loadCompletionListener: LoadCompletionListener) {
    this.player.load(uri, httpCookiesList, object : ExpoPlayer.LoadListener {
      override fun onLoaded() {
        setParams(params.update(arguments), object : SetParamsCompletionListener {
          override fun onSetStatusComplete() {
            loadCompletionListener.onLoadSuccess(status)
          }

          override fun onSetStatusError(error: String) {
            loadCompletionListener.onLoadSuccess(status)
          }
        })
      }

      override fun onLoadError(error: String) {
        loadCompletionListener.onLoadError(error)
      }
    })
  }

  fun setSurface(surface: Surface) {
    this.player.setSurface(surface, params.shouldPlay)
  }

  fun release() {
    stopUpdatingProgressIfNecessary()
    this.player.release()
  }

  // Status update listener

  private fun callStatusUpdateListenerWithStatus(status: Status?) {
    Log.d("PLAYER_STATUS", "updating status " + System.currentTimeMillis())
    mStatusUpdateListener?.onStatusUpdate(status)
  }

  private fun callStatusUpdateListenerWithDidJustFinish() {
    var status = status
    // TODO: Correct!
    status = status.copy(didJustFinish = true)
    callStatusUpdateListenerWithStatus(status)
  }

  private fun callStatusUpdateListener() {
    callStatusUpdateListenerWithStatus(status)
  }

  private fun stopUpdatingProgressIfNecessary() {
    mHandler.removeCallbacks(mProgressUpdater)
  }

  private fun progressUpdateLoop() {
    if (!player.continueUpdatingProgress || params.updateInterval <= 0) {
      stopUpdatingProgressIfNecessary()
    } else {
      Log.d("PLAYER_STATUS", "Post Delaying " + System.currentTimeMillis())
      mHandler.postDelayed(mProgressUpdater, params.updateInterval.toLong())
    }
  }

  private fun beginUpdatingProgressIfNecessary() {
    mHandler.post(mProgressUpdater)
  }

  fun setStatusUpdateListener(listener: StatusUpdateListener) {
    mStatusUpdateListener = listener
    if (mParamsUpdatedListener != null) {
      beginUpdatingProgressIfNecessary()
    }
  }

  // Error listener

  fun setErrorListener(listener: ErrorListener) {
    mErrorListener = listener
  }

  // Status

  private fun shouldPlayerPlay(): Boolean {
    return params.shouldPlay && params.rate > 0.0
  }

  fun setParams(status: ReadableArguments, promise: Promise?) {
    try {
      val newParams = this.params.update(status)
      setParams(newParams, object : SetParamsCompletionListener {
        override fun onSetStatusComplete() {
          if (promise == null) {
            callStatusUpdateListener()
          } else {
            promise.resolve(newParams.toBundle())
          }
        }

        override fun onSetStatusError(error: String) {
          if (promise == null) {
            callStatusUpdateListener()
          } else {
            promise.reject("E_AV_SETSTATUS", error)
          }
        }
      })
    } catch (throwable: Throwable) {
      promise?.reject("E_AV_SETSTATUS", "Encountered an error while setting status!", throwable)
    }

  }

  private fun setParams(params: Params,
                        setParamsCompletionListener: SetParamsCompletionListener) {
    this.params = params

    player.looping = this.params.isLooping

    if (!shouldPlayerPlay()) {
      player.pauseImmediately()
    } else {
      try {
        updateVolumeMuteAndDuck()
        acquireFocusAndPlay()
      } catch (ex: AudioFocusAquiringError) {
        setParamsCompletionListener.onSetStatusError(ex.toString())
      }

    }
    setParamsCompletionListener.onSetStatusComplete()

  }

  // Video specific stuff

  fun setVideoSizeUpdateListener(videoSizeUpdateListener: VideoSizeUpdateListener) {
    mVideoSizeUpdateListener = videoSizeUpdateListener
  }

  fun setFullscreenPresenter(fullscreenPresenter: FullscreenPresenter) {
    mFullscreenPresenter = fullscreenPresenter
  }

  fun toggleFullscreen() {
    mFullscreenPresenter?.setFullscreenMode(!isPresentedFullscreen)
  }

  // AudioEventHandler

  override fun handleAudioFocusInterruptionBegan() {
    if (!this.params.isMuted) {
      pauseImmediately()
      stopUpdatingProgressIfNecessary()
    }
  }

  override fun handleAudioFocusGained() {
    try {
      acquireFocusAndPlay()
    } catch (e: AudioFocusAquiringError) {
      // This is ok -- we might be paused or audio might have been disabled.
    }

  }

  override fun onPause() {
    pauseImmediately()
  }

  override fun pauseImmediately() {
    player.pauseImmediately()
  }

  override fun requiresAudioFocus(): Boolean {
    return player.playing && !this.params.isMuted
  }

  override fun updateVolumeMuteAndDuck() {
    if (player.loaded) {
      player.volume = this.params.volume
    }
  }

  override fun onResume() {
    try {
      acquireFocusAndPlay()
    } catch (e: AudioFocusAquiringError) {
      // Do nothing -- another app has audio focus for now, and handleAudioFocusGained() will be
      // called when it abandons it.
    }

  }

  override fun onCompleted() {
    callStatusUpdateListenerWithDidJustFinish()

    if (!player.looping) {
      // TODO: Abandon audio focus after finishing playing
    }

  }

  override fun onSeekCompleted() {
    callStatusUpdateListener()
  }

  override fun onError(message: String) {
    mErrorListener!!.onError(message)
  }

  override fun onBufferingStart() {
    callStatusUpdateListener()
  }

  override fun onBuffering(bufferedDuration: Int) {
    callStatusUpdateListener()
  }

  override fun onBufferingStop() {
    callStatusUpdateListener()
  }

  override fun statusUpdated() {
    callStatusUpdateListener()
  }

  override fun videoSizeChanged(width: Int, height: Int) {
    mVideoSizeUpdateListener?.onVideoSizeUpdate(Pair(width, height))
  }

  private fun handleFocusLostMayDuck() {
    // TODO: Handle according to params.
  }

  private fun handleFocustemporarirlyLost() {
    // TODO: Handle - pause player without unloading it
  }

  private fun handleFocusLost() {
    // TODO: Handle by stopping player
}

  private fun reactToMayBecomeNoisy() {
    // TODO: Handle according to params.
  }

  inner class AudioFocusListener : AudioFocusChangeListener {

    override fun focusStateChanged(state: AudioFocusHandler.FocusState) {
      when (state) {
        AudioFocusHandler.FocusState.GAINED -> this@PlayerManager.considerPlaying()
        AudioFocusHandler.FocusState.LOST_MAY_DUCK -> this@PlayerManager.handleFocusLostMayDuck()
        AudioFocusHandler.FocusState.TEMPORARILY_LOST -> this@PlayerManager.handleFocustemporarirlyLost()
        AudioFocusHandler.FocusState.LOST -> this@PlayerManager.handleFocusLost()
      }
    }

    override fun mayBecomeNoisy() {
      this@PlayerManager.reactToMayBecomeNoisy()
    }

  }

  @Throws(AudioFocusAquiringError::class)
  private fun acquireFocusAndPlay() {
    if (!player.loaded || !shouldPlayerPlay()) {
      return
    }

    if (!this.params.isMuted) {
      if (Build.VERSION.SDK_INT >= 26) {
        focusManager.requestFocus(AudioFocusHandler.FocusParams(
            AudioFocusHandler.FocusGain.GAIN,
            AudioFocusHandler.AudioUsage.MEDIA, AudioFocusHandler.AudioContentType.TYPE_MUSIC, true,
            true), focusChangeListener)
      } else {
        focusManager.requestFocus(
            AudioFocusHandler.PreOreoFocusParams(
                AudioFocusHandler.StreamType.MUSIC,
                AudioFocusHandler.FocusGain.GAIN), focusChangeListener)
      }
    }

  }

  private fun considerPlaying() {
    updateVolumeMuteAndDuck()
    if(shouldPlayerPlay()) {
      player.play(this.params.isMuted, this.params.rate, this.params.shouldCorrectPitch)
      beginUpdatingProgressIfNecessary()
    }

  }

}
