package host.exp.exponent.notifications.presenters.modifiers;

import android.content.Context;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;


import com.facebook.common.executors.UiThreadImmediateExecutorService;
import com.facebook.common.references.CloseableReference;
import com.facebook.datasource.DataSource;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.imagepipeline.core.ImagePipeline;
import com.facebook.imagepipeline.datasource.BaseBitmapDataSubscriber;
import com.facebook.imagepipeline.image.CloseableImage;
import com.facebook.imagepipeline.request.ImageRequest;

import java.util.concurrent.Executor;

import host.exp.expoview.R;

import static host.exp.exponent.notifications.NotificationConstants.NOTIFICATION_ICON;

public class IconModifier implements NotificationModifier {
  @Override
  public void modify(NotificationCompat.Builder builder, Bundle notification, Context context, String experienceId) {
    builder.setSmallIcon(R.drawable.shell_notification_icon);
    if (notification.containsKey(NOTIFICATION_ICON)) {
      ImageRequest imageRequest = ImageRequest.fromUri(notification.getString(NOTIFICATION_ICON));
      ImagePipeline imagePipeline = Fresco.getImagePipeline();
      DataSource<CloseableReference<CloseableImage>> dataSource = imagePipeline.fetchDecodedImage(imageRequest, null);
      dataSource.subscribe(
        new BaseBitmapDataSubscriber() {

          @Override
          protected void onNewResultImpl(Bitmap bitmap) {
            builder.setLargeIcon(bitmap);
          }

          @Override
          protected void onFailureImpl(DataSource<CloseableReference<CloseableImage>> dataSource) {

          }
        },
        new Executor() { // run synchronously
          @Override
          public void execute(Runnable command) {
            command.run();
          }
        }
      );
    }
  }
}
