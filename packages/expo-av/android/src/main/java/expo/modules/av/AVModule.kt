package expo.modules.av

import android.content.Context

import org.unimodules.core.ExportedModule
import org.unimodules.core.ModuleRegistry
import org.unimodules.core.Promise
import org.unimodules.core.arguments.ReadableArguments
import org.unimodules.core.interfaces.ExpoMethod
import org.unimodules.core.interfaces.ModuleRegistryConsumer

class AVModule(context: Context) : ExportedModule(context), ModuleRegistryConsumer {
  private lateinit var mAVManager: AVManagerInterface

  override fun getName(): String {
    return "ExponentAV"
  }

  override fun setModuleRegistry(moduleRegistry: ModuleRegistry) {
    mAVManager = moduleRegistry.getModule(AVManagerInterface::class.java)
  }

  @ExpoMethod
  fun setAudioMode(map: ReadableArguments, promise: Promise) {
    mAVManager.setAudioMode(map)
    promise.resolve(null)
  }

  @ExpoMethod
  fun loadForSound(source: ReadableArguments, status: ReadableArguments, promise: Promise) {
    mAVManager.loadForSound(Source.fromReadableArguments(source), status, promise)
  }

  @ExpoMethod
  fun unloadForSound(key: Int?, promise: Promise) {
    mAVManager.unloadForSound(key, promise)
  }

  @ExpoMethod
  fun setParamsForSound(key: Int?, status: ReadableArguments, promise: Promise) {
    mAVManager.setParamsForSound(key, status, promise)
  }

  @ExpoMethod
  fun replaySound(key: Int?, status: ReadableArguments, promise: Promise) {
    mAVManager.replaySound(key, status, promise)
  }

  @ExpoMethod
  fun getStatusForSound(key: Int?, promise: Promise) {
    mAVManager.getStatusForSound(key, promise)
  }

  @ExpoMethod
  fun loadForVideo(tag: Int?, source: ReadableArguments, status: ReadableArguments,
                   promise: Promise) {
    mAVManager.loadForVideo(tag, Source.fromReadableArguments(source), status, promise)
  }

  @ExpoMethod
  fun unloadForVideo(tag: Int?, promise: Promise) {
    mAVManager.unloadForVideo(tag, promise)
  }

  @ExpoMethod
  fun setStatusForVideo(tag: Int?, status: ReadableArguments, promise: Promise) {
    mAVManager.setStatusForVideo(tag, status, promise)
  }

  @ExpoMethod
  fun replayVideo(tag: Int?, status: ReadableArguments, promise: Promise) {
    mAVManager.replayVideo(tag, status, promise)
  }

  @ExpoMethod
  fun getStatusForVideo(tag: Int?, promise: Promise) {
    mAVManager.getStatusForVideo(tag, promise)
  }

  @ExpoMethod
  fun prepareAudioRecorder(options: ReadableArguments, promise: Promise) {
    mAVManager.prepareAudioRecorder(options, promise)
  }

  @ExpoMethod
  fun startAudioRecording(promise: Promise) {
    mAVManager.startAudioRecording(promise)
  }

  @ExpoMethod
  fun pauseAudioRecording(promise: Promise) {
    mAVManager.pauseAudioRecording(promise)
  }

  @ExpoMethod
  fun stopAudioRecording(promise: Promise) {
    mAVManager.stopAudioRecording(promise)
  }

  @ExpoMethod
  fun getAudioRecordingStatus(promise: Promise) {
    mAVManager.getAudioRecordingStatus(promise)
  }

  @ExpoMethod
  fun unloadAudioRecorder(promise: Promise) {
    mAVManager.unloadAudioRecorder(promise)
  }
}
