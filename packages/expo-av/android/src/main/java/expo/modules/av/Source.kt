package expo.modules.av

import org.unimodules.core.arguments.ReadableArguments

data class Source(val uri: String, val requestHeaders: Map<*, *>?,
                  val uriOverridingExtension: String?) {

  companion object {
    private const val STATUS_HEADERS_KEY_PATH = "headers"
    private const val STATUS_URI_KEY_PATH = "uri"
    private const val STATUS_OVERRIDING_EXTENSION_KEY_PATH = "overridingExtension"

    @JvmStatic
    fun fromReadableArguments(readableArguments: ReadableArguments): Source {
      val uri = readableArguments.getString(STATUS_URI_KEY_PATH)
      val headers = readableArguments.getMap(STATUS_HEADERS_KEY_PATH)
      val overridingExtension = readableArguments.getString(STATUS_OVERRIDING_EXTENSION_KEY_PATH)
      return Source(uri, headers, overridingExtension)
    }

  }

}