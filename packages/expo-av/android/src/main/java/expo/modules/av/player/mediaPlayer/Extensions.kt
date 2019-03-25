package expo.modules.av.player.mediaPlayer

import android.media.MediaPlayer
import android.util.Pair

fun MediaPlayer.videoWidthHeight(): Pair<Int, Int> {
  return Pair(this.videoWidth, this.videoHeight)
}