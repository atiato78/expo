import { AdMobRewarded } from 'expo-ads-admob';
import { Platform } from '@unimodules/core';
import { executeUnavailabileMethod } from '../TestUtils';

export const name = 'AdMobRewarded';

const unavailableMessage = `is unavailable on ${Platform.OS}`;

const unavailableMethods = [
  'setAdUnitID',
  'setTestDeviceID',
  'requestAdAsync',
  'dismissAdAsync',
  'showAdAsync',
];

export async function test({ describe, it, expect }) {
  function testUnavailableMethod(methodName) {
    describe(`${name}.${methodName}()`, () => {
      it(unavailableMessage, () => executeUnavailabileMethod(expect, AdMobRewarded[methodName]));
    });
  }
  unavailableMethods.forEach(testUnavailableMethod);

  ['getIsReadyAsync'].map(unsupportedMethod => {
    describe(`${name}.${unsupportedMethod}()`, () => {
      it('method returns falsey', async () => {
        const value = await AdMobRewarded[unsupportedMethod]();
        expect(!!value).toBe(false);
      });
    });
  });
}
