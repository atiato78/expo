import DeviceEventEmitter from 'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter';
export class Mailbox {
    constructor() {
        this.onUserInteractionListeners = new Map();
        this.onForegroundNotificationListeners = new Map();
        DeviceEventEmitter.addListener('Exponent.onUserInteraction', this._onUserInteractionListener);
        DeviceEventEmitter.addListener('Exponent.onForegroundNotification', this._onForegroundNotification);
    }
    addOnUserInteractionListener(listenerName, listener) {
        this.onUserInteractionListeners.set(listenerName, listener);
    }
    addOnForegroundNotificationListener(listenerName, listener) {
        this.onForegroundNotificationListeners.set(listenerName, listener);
    }
    removeOnUserInteractionListener(listenerName) {
        this.onUserInteractionListeners.delete(listenerName);
    }
    removeOnForegroundNotificationListener(listenerName) {
        this.onForegroundNotificationListeners.delete(listenerName);
    }
    _onForegroundNotification(notification) {
        const data = notification.data;
        for (let listener of this.onUserInteractionListeners.values()) {
            listener(data);
        }
    }
    _onUserInteractionListener(userInteraction) {
        const data = userInteraction.data;
        for (let listener of this.onForegroundNotificationListeners.values()) {
            listener(data);
        }
    }
}
;
//# sourceMappingURL=Mailbox.js.map