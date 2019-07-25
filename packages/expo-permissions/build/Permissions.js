import { coalesceExpirations, coalesceStatuses } from './CoalescedPermissions';
import Permissions from './ExpoPermissions';
import { Platform } from 'react-native';
import { PermissionStatus, } from './Permissions.types';
export { PermissionStatus, };
export const CAMERA = 'camera';
export const CAMERA_ROLL = 'cameraRoll';
export const AUDIO_RECORDING = 'audioRecording';
export const LOCATION = 'location';
export const USER_FACING_NOTIFICATIONS = 'userFacingNotifications';
export const NOTIFICATIONS = 'notifications';
export const CONTACTS = 'contacts';
export const CALENDAR = 'calendar';
export const REMINDERS = 'reminders';
export const SYSTEM_BRIGHTNESS = 'systemBrightness';
export async function getAsync(...types) {
    if (Platform.OS === "ios") {
        return await _handleMultiPermissionsRequestIOSAsync(types, Permissions.getAsync);
    }
    return await _handlePermissionsRequestAsync(types, Permissions.getAsync);
}
export async function askAsync(...types) {
    if (Platform.OS === "ios") {
        return await _handleMultiPermissionsRequestIOSAsync(types, Permissions.askAsync);
    }
    return await _handlePermissionsRequestAsync(types, Permissions.askAsync);
}
async function _handleSinglePermissionRequestIOSAsync(type, handlePermission) {
    return handlePermission(type);
}
async function _handleMultiPermissionsRequestIOSAsync(types, handlePermission) {
    if (!types.length) {
        throw new Error('At least one permission type must be specified');
    }
    return await Promise.all(types.map(async (type) => ({
        [type]: await _handleSinglePermissionRequestIOSAsync(type, handlePermission),
    })))
        .then(permissions => permissions.reduce((permission, acc) => ({ ...acc, ...permission }), {}))
        .then(permissions => ({
        status: coalesceStatuses(permissions),
        expires: coalesceExpirations(permissions),
        permissions: { ...permissions },
    }));
}
async function _handlePermissionsRequestAsync(types, handlePermissions) {
    if (!types.length) {
        throw new Error('At least one permission type must be specified');
    }
    const permissions = await handlePermissions(types);
    return {
        status: coalesceStatuses(permissions),
        expires: coalesceExpirations(permissions),
        permissions,
    };
}
//# sourceMappingURL=Permissions.js.map