package host.exp.exponent.notifications.presenters;

public class NotificationPresenterProvider {

  private static volatile NotificationPresenterInterface instance;

  public synchronized static NotificationPresenterInterface getNotificationPresenter() {
    if (instance == null) {
      instance = new SmartNotificationPresenter();
    }
    return instance;
  }

}
