package host.exp.exponent.notifications.postoffice;

import android.os.Bundle;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

public class PostOfficeProxy implements ExpoPostOffice {

  private Executor mSingleThreadExecutor = Executors.newSingleThreadExecutor();

  private static volatile PostOfficeProxy instance = null;

  private ExpoPostOffice mPostOffice;

  private PostOfficeProxy() {
    mPostOffice = new PostOffice();
  }

  public static synchronized ExpoPostOffice getInstance() {
    if (instance == null) {
      instance = new PostOfficeProxy();
    }
    return instance;
  }

  @Override
  public void notifyAboutUserInteraction(final String experienceId, final Bundle userInteraction) {
    mSingleThreadExecutor.execute(() -> mPostOffice.notifyAboutUserInteraction(experienceId, userInteraction));
  }

  @Override
  public void sendForegroundNotification(final String experienceId, final Bundle notification) {
    mSingleThreadExecutor.execute(() -> mPostOffice.sendForegroundNotification(experienceId, notification));
  }

  @Override
  public void registerModuleAndGetPendingDeliveries(final String experienceId, final Mailbox mailbox) {
    mSingleThreadExecutor.execute(() -> mPostOffice.registerModuleAndGetPendingDeliveries(experienceId, mailbox));
  }

  @Override
  public void unregisterModule(final String experienceId) {
    mSingleThreadExecutor.execute(() -> mPostOffice.unregisterModule(experienceId));
  }
}
