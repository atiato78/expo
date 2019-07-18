import { LocalNotification } from './Notifications.types';
export declare type UserInteraction = LocalNotification & {
    actionType?: string;
    userText?: string;
};
export declare type OnUserInteractionListener = (userInteraction: UserInteraction) => void;
export declare type OnForegroundNotificationListener = (notification: LocalNotification) => void;
export declare class Mailbox {
    onUserInteractionListeners: Map<string, OnUserInteractionListener>;
    onForegroundNotificationListeners: Map<string, OnForegroundNotificationListener>;
    constructor();
    addOnUserInteractionListener(listenerName: string, listener: OnUserInteractionListener): void;
    addOnForegroundNotificationListener(listenerName: string, listener: OnForegroundNotificationListener): void;
    removeOnUserInteractionListener(listenerName: string): void;
    removeOnForegroundNotificationListener(listenerName: string): void;
    _onForegroundNotification(notification: any): void;
    _onUserInteraction(userInteraction: any): void;
}
