package expo.modules.av

import android.content.Context

import org.unimodules.core.BasePackage
import org.unimodules.core.ExportedModule
import org.unimodules.core.ViewManager
import org.unimodules.core.interfaces.InternalModule

import java.util.Arrays
import java.util.Collections

import expo.modules.av.player.datasource.SharedCookiesDataSourceFactoryProvider
import expo.modules.av.video.VideoManager
import expo.modules.av.video.VideoViewManager

class AVPackage : BasePackage() {

  override fun createInternalModules(context: Context): List<InternalModule> {
    return Arrays.asList(
        AVManager(context),
        SharedCookiesDataSourceFactoryProvider()
    )
  }

  override fun createExportedModules(context: Context): List<ExportedModule> {
    return Arrays.asList(
        AVModule(context),
        VideoManager(context)
    )
  }

  override fun createViewManagers(context: Context): List<ViewManager<*>> {
    return listOf<ViewManager<*>>(VideoViewManager())
  }
}
