package expo.modules.av.player;

import android.os.Bundle;
import android.support.annotation.NonNull;
import android.widget.MediaController;

public class PlayerControl implements MediaController.MediaPlayerControl {
  private final PlayerManager mPlayerManager;

  public PlayerControl(final @NonNull PlayerManager playerManager) {
    mPlayerManager = playerManager;
  }

  @Override
  public void start() {
    final Bundle map = new Bundle();
    map.putBoolean(PlayerManager.STATUS_SHOULD_PLAY_KEY_PATH, true);
    mPlayerManager.setStatus(map, null);
  }

  @Override
  public void pause() {
    final Bundle map = new Bundle();
    map.putBoolean(PlayerManager.STATUS_SHOULD_PLAY_KEY_PATH, false);
    mPlayerManager.setStatus(map, null);
  }

  @Override
  public int getDuration() {
    final Bundle status = mPlayerManager.getStatus();
    return (status.getBoolean(PlayerManager.STATUS_IS_LOADED_KEY_PATH)
        && status.containsKey(PlayerManager.STATUS_DURATION_MILLIS_KEY_PATH))
        ? status.getInt(PlayerManager.STATUS_DURATION_MILLIS_KEY_PATH) : 0;
  }

  @Override
  public int getCurrentPosition() {
    final Bundle status = mPlayerManager.getStatus();
    return status.getBoolean(PlayerManager.STATUS_IS_LOADED_KEY_PATH)
        ? status.getInt(PlayerManager.STATUS_POSITION_MILLIS_KEY_PATH) : 0;
  }

  @Override
  public void seekTo(final int msec) {
    final Bundle map = new Bundle();
    map.putDouble(PlayerManager.STATUS_POSITION_MILLIS_KEY_PATH, (double) msec);
    mPlayerManager.setStatus(map, null);
  }

  @Override
  public boolean isPlaying() {
    final Bundle status = mPlayerManager.getStatus();
    return status.getBoolean(PlayerManager.STATUS_IS_LOADED_KEY_PATH)
        && status.getBoolean(PlayerManager.STATUS_IS_PLAYING_KEY_PATH);
  }

  @Override
  public int getBufferPercentage() {
    final Bundle status = mPlayerManager.getStatus();
    if (status.getBoolean(PlayerManager.STATUS_IS_LOADED_KEY_PATH)
        && status.containsKey(PlayerManager.STATUS_DURATION_MILLIS_KEY_PATH)
        && status.containsKey(PlayerManager.STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH)) {
      final double duration = status.getInt(PlayerManager.STATUS_DURATION_MILLIS_KEY_PATH);
      final double playableDuration = status.getInt(PlayerManager.STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH);
      return (int) (playableDuration / duration * 100.0);
    } else {
      return 0;
    }
  }

  @Override
  public boolean canPause() {
    return true;
  }

  @Override
  public boolean canSeekBackward() {
    return true;
  }

  @Override
  public boolean canSeekForward() {
    return true;
  }

  @Override
  public int getAudioSessionId() {
    return mPlayerManager.getAudioSessionId();
  }

  public boolean isFullscreen() {
    return mPlayerManager.isPresentedFullscreen();
  }

  public void toggleFullscreen() {
    mPlayerManager.toggleFullscreen();
  }
}
