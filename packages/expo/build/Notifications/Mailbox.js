import DeviceEventEmitter from 'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter';
export class Mailbox {
    constructor() {
        this.onUserInteractionListeners = new Map();
        this.onForegroundNotificationListeners = new Map();
        DeviceEventEmitter.addListener('Exponent.onUserInteraction', this._onUserInteraction.bind(this));
        DeviceEventEmitter.addListener('Exponent.onForegroundNotification', this._onForegroundNotification.bind(this));
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
        for (let listener of this.onForegroundNotificationListeners.values()) {
            listener(notification);
        }
    }
    _onUserInteraction(userInteraction) {
        for (let listener of this.onUserInteractionListeners.values()) {
            listener(userInteraction);
        }
    }
}
;
//# sourceMappingURL=Mailbox.js.map