package expo.modules.av.player

import android.content.Context
import android.net.Uri
import com.google.android.exoplayer2.util.Util
import expo.modules.av.AVManagerInterface
import expo.modules.av.Params
import expo.modules.av.Source
import expo.modules.av.player.datasource.DataSourceFactoryProvider
import expo.modules.av.player.exoplayer.ExoPlayerWrapper
import expo.modules.av.player.mediaPlayer.MediaPlayerWrapper

class PlayerCreator(val context: Context, val avModule: AVManagerInterface) {

  fun createUnloadedPlayerData(source: Source, params: Params): PlayerManager {
    // uriString is guaranteed not to be null (both VideoView.setSource and Sound.loadAsync handle that case)
    val uri = Uri.parse(source.uri)

    val requestHeaders: Map<String, Any>? = source.requestHeaders as? Map<String, Any>

    return if (mediaPlayerImplementationName == params.implementation) {
      PlayerManager(MediaPlayerWrapper(context, requestHeaders),
          avModule, uri)
    } else {
      val sourceFactory = avModule.moduleRegistry.getModule(
          DataSourceFactoryProvider::class.java).createFactory(context, avModule.moduleRegistry,
          Util.getUserAgent(avModule.context, "yourApplicationName"), requestHeaders)
      PlayerManager(ExoPlayerWrapper(context, source.uriOverridingExtension, sourceFactory),
          avModule, uri)
    }
  }

  companion object {
    const val mediaPlayerImplementationName = "MediaPlayer"
  }

}