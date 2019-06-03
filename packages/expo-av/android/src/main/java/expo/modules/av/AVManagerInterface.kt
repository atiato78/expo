package expo.modules.av

import android.content.Context

import org.unimodules.core.ModuleRegistry
import org.unimodules.core.Promise
import org.unimodules.core.arguments.ReadableArguments

import expo.modules.av.video.VideoView

interface AVManagerInterface {

  val context: Context

  val moduleRegistry: ModuleRegistry
  fun registerVideoViewForAudioLifecycle(videoView: VideoView)

  fun unregisterVideoViewForAudioLifecycle(videoView: VideoView)

  fun abandonAudioFocusIfUnused()

  fun getVolumeForDuckAndFocus(isMuted: Boolean, volume: Float): Float

  @Throws(AudioFocusNotAcquiredException::class)
  fun acquireAudioFocus()

  fun setAudioIsEnabled(value: Boolean?)

  fun setAudioMode(map: ReadableArguments)

  fun loadForSound(source: Source, status: ReadableArguments, promise: Promise)

  fun unloadForSound(key: Int?, promise: Promise)

  fun setParamsForSound(key: Int?, status: ReadableArguments, promise: Promise)

  fun replaySound(key: Int?, status: ReadableArguments, promise: Promise)

  fun getStatusForSound(key: Int?, promise: Promise)

  fun loadForVideo(tag: Int?, source: Source, status: ReadableArguments, promise: Promise)

  fun unloadForVideo(tag: Int?, promise: Promise)

  fun setStatusForVideo(tag: Int?, status: ReadableArguments, promise: Promise)

  fun replayVideo(tag: Int?, status: ReadableArguments, promise: Promise)

  fun getStatusForVideo(tag: Int?, promise: Promise)

  fun prepareAudioRecorder(options: ReadableArguments, promise: Promise)

  fun startAudioRecording(promise: Promise)

  fun pauseAudioRecording(promise: Promise)

  fun stopAudioRecording(promise: Promise)

  fun getAudioRecordingStatus(promise: Promise)

  fun unloadAudioRecorder(promise: Promise)
}
