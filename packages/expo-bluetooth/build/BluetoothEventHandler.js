import { EventEmitter } from 'expo-core';
import { BLUETOOTH_EVENT, EVENTS } from './BluetoothConstants';
import { getPeripherals } from './BluetoothLocalState';
import ExpoBluetooth from './ExpoBluetooth';
const eventEmitter = new EventEmitter(ExpoBluetooth);
const multiEventHandlers = {
    [EVENTS.CENTRAL_DID_DISCOVER_PERIPHERAL]: [],
    [EVENTS.CENTRAL_DID_UPDATE_STATE]: [],
    everything: [],
    centralState: [],
};
export function firePeripheralObservers() {
    for (const subscription of multiEventHandlers.everything) {
        subscription({ peripherals: getPeripherals() });
    }
}
export function fireMultiEventHandlers(event, { central, peripheral }) {
    ensureKey(event);
    for (const callback of multiEventHandlers[event]) {
        callback({ central, peripheral });
    }
}
function ensureKey(key) {
    if (!(key in multiEventHandlers)) {
        multiEventHandlers[key] = [];
    }
}
export async function resetHandlersForKey(key) {
    ensureKey(key);
    let promises = [];
    for (const listener of multiEventHandlers[key]) {
        if (listener.remove instanceof Function) {
            promises.push(listener.remove());
        }
    }
    multiEventHandlers[key] = [];
    return await Promise.all(promises);
}
export async function _resetAllHandlers() {
    for (const key of Object.keys(multiEventHandlers)) {
        await resetHandlersForKey(key);
    }
}
export function addHandlerForKey(key, callback) {
    ensureKey(key);
    multiEventHandlers[key].push(callback);
    return {
        remove() {
            const index = multiEventHandlers[key].indexOf(callback);
            if (index != -1) {
                multiEventHandlers[key].splice(index, 1);
            }
        },
    };
}
export function getHandlersForKey(key) {
    ensureKey(key);
    return multiEventHandlers[key];
}
export function addListener(listener) {
    // eventEmitter.removeAllListeners(BLUETOOTH_EVENT);
    console.log('EXBLUE_INTERNAL: listener count: ', eventEmitter._listenerCount);
    return eventEmitter.addListener(BLUETOOTH_EVENT, listener);
}
// TODO: Bacon: How do we plan on calling this...
export function removeAllListeners() {
    eventEmitter.removeAllListeners(BLUETOOTH_EVENT);
}
//# sourceMappingURL=BluetoothEventHandler.js.map