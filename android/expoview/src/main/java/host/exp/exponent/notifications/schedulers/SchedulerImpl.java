package host.exp.exponent.notifications.schedulers;

import android.content.Context;

import java.util.HashMap;

import host.exp.exponent.notifications.ExponentNotificationManager;
import host.exp.exponent.notifications.exceptions.UnableToScheduleException;
import host.exp.exponent.notifications.insecurecheduler.ThreadSafeInsecureScheduler;

public class SchedulerImpl implements Scheduler {

  private SchedulerModel mSchedulerModel;

  private Context mApplicationContext;

  public SchedulerImpl(SchedulerModel schedulerModel) {
    this.mSchedulerModel = schedulerModel;
  }

  @Override
  public void schedule(String action) throws UnableToScheduleException {
    if (!mSchedulerModel.shouldBeTriggeredByAction(action)) {
      return;
    }
    long nextAppearanceTime = 0;

    try {
      nextAppearanceTime = mSchedulerModel.getNextAppearanceTime();
    } catch (IllegalArgumentException e) {
      throw new UnableToScheduleException();
    }

    String experienceId = mSchedulerModel.getOwnerExperienceId();
    int notificationId = mSchedulerModel.getId();
    HashMap<String, Object> details = mSchedulerModel.getDetails();

    ThreadSafeInsecureScheduler.getInstance().schedule(experienceId, nextAppearanceTime, notificationId, details, mApplicationContext);
  }

  @Override
  public String getIdAsString() {
    return mSchedulerModel.getIdAsString();
  }

  @Override
  public String getOwnerExperienceId() {
    return mSchedulerModel.getOwnerExperienceId();
  }

  @Override
  public void cancel() {
    String experienceId = mSchedulerModel.getOwnerExperienceId();
    int notificationId = mSchedulerModel.getId();
    ThreadSafeInsecureScheduler.getInstance().cancelScheduled(experienceId, notificationId, mApplicationContext);
  }

  @Override
  public boolean canBeRescheduled() {
    return mSchedulerModel.canBeRescheduled();
  }

  @Override
  public String saveAndGetId() {
    return mSchedulerModel.saveAndGetId();
  }

  @Override
  public void setApplicationContext(Context context) {
    mApplicationContext = context.getApplicationContext();
  }

  @Override
  public void remove() {
    cancel();
    mSchedulerModel.remove();
  }

}
