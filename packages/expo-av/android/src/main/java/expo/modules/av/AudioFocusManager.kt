package expo.modules.av

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioManager
import expo.modules.av.audio.AudioFocusHandler
import org.unimodules.core.interfaces.LifecycleEventListener
import org.unimodules.core.interfaces.services.UIManager

class AudioFocusManager(private val uiManager: UIManager, private val focusHandler: AudioFocusHandler): LifecycleEventListener, BecomingNoisyListener {

  init {
    uiManager.registerLifecycleEventListener(this)
  }

  override fun becomingNoisy() {
    TODO(
        "not implemented") //To change body of created functions use File | Settings | File Templates.
  }

  override fun onHostResume() {
    TODO(
        "not implemented") //To change body of created functions use File | Settings | File Templates.
  }

  override fun onHostPause() {
    TODO(
        "not implemented") //To change body of created functions use File | Settings | File Templates.
  }

  override fun onHostDestroy() {
    TODO(
        "not implemented") //To change body of created functions use File | Settings | File Templates.
  }
}

interface BecomingNoisyListener {

  fun becomingNoisy()

}

class NoisyBroadcastReceiver(val noisyListener: BecomingNoisyListener): BroadcastReceiver() {

  companion object {

    fun register(context: Context?, noisyListener: BecomingNoisyListener) {
      context?.registerReceiver(NoisyBroadcastReceiver(noisyListener),
          IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY))
    }
  }

  override fun onReceive(context: Context?, intent: Intent?) {
    if (AudioManager.ACTION_AUDIO_BECOMING_NOISY == intent?.getAction()) {
      this.noisyListener.becomingNoisy()
    } //To change body of created functions use File | Settings | File Templates.
  }
}