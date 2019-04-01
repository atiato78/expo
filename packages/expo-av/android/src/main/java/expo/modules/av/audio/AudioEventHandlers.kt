package expo.modules.av.audio

import expo.modules.av.player.PlayerManager
import expo.modules.av.video.VideoView
import java.lang.ref.WeakReference

object AudioEventHandlers {

  var videos: Set<WeakReference<VideoView>> = HashSet()
    private set

  var audios: Map<Int, WeakReference<PlayerManager>> = HashMap()
    private set

  val audioHandlers: Collection<PlayerManager>
    get() {
      return audios.values.map { it.get() }.filter { it != null }.map { it!! }
    }

  val videoHandlers: Collection<VideoView>
    get() {
      return videos.map { it.get() }.filter { it != null }.map { it!! }
    }

  val audioEventHandlers: Collection<AudioEventHandler>
    get() {
      return audioHandlers.plus(videoHandlers)
    }

  fun addVideo(video: VideoView) {
    videos = videos.plus(WeakReference(video))
  }

  fun removeVideo(video: VideoView) {
    for (v in videos) {
      if (v.get()?.equals(video) == true) {
        videos = videos.minus(v)
      }
    }
  }

  fun addAudio(key: Int, audio: PlayerManager) {
    audios = audios.plus(key to WeakReference(audio))
  }

  fun removeAudio(key: Int) {
    audios = audios.minus(key)
  }

}