import DeviceEventEmitter from 'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter';
import {
  Notification,
  LocalNotification,
  Channel,
  ActionType,
  LocalNotificationId,
  OnUserInteractionListener,
  OnForegroundNotificationListener,
  UserInteraction
} from './Notifications.types';

export class Mailbox {
  private onUserInteractionListeners: Map<string, OnUserInteractionListener>;
  private onForegroundNotificationListeners: Map<string, OnForegroundNotificationListener>;

  constructor() {
    this.onUserInteractionListeners = new Map();
    this.onForegroundNotificationListeners = new Map();
    DeviceEventEmitter.addListener('Exponent.onUserInteraction', this._onUserInteraction.bind(this));
    DeviceEventEmitter.addListener('Exponent.onForegroundNotification', this._onForegroundNotification.bind(this));
  }

  addOnUserInteractionListener(listenerName: string, listener: OnUserInteractionListener) {
    this.onUserInteractionListeners.set(listenerName, listener);
  }

  addOnForegroundNotificationListener(listenerName: string, listener: OnForegroundNotificationListener) {
    this.onForegroundNotificationListeners.set(listenerName, listener);
  }

  removeOnUserInteractionListener(listenerName: string) {
    this.onUserInteractionListeners.delete(listenerName);
  }

  removeOnForegroundNotificationListener(listenerName: string) {
    this.onForegroundNotificationListeners.delete(listenerName);
  }

  _onForegroundNotification(notification) {
    for (let listener of this.onForegroundNotificationListeners.values()) {
      listener(notification);
    }
  }

  _onUserInteraction(userInteraction) {
    for (let listener of this.onUserInteractionListeners.values()) {
      listener(userInteraction);
    }
  }
};
