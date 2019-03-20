import { Platform } from '@unimodules/core';
import { Haptics } from 'expo';

import { executeUnavailabileMethod } from '../TestUtils';

export const name = 'Haptics';

const unavailableMessage = `is unavailable on ${Platform.OS}`;

const unavailableMethods = [
  'notification',
  'impact',
  'selection',
  'notificationAsync',
  'impactAsync',
  'selectionAsync',
];

export async function test({ describe, it, expect }) {
  function testUnavailableMethod(methodName) {
    describe(`${name}.${methodName}()`, () => {
      it(unavailableMessage, () => executeUnavailabileMethod(expect, Haptics[methodName]));
    });
  }
  unavailableMethods.forEach(testUnavailableMethod);
}
