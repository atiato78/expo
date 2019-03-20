import { FacebookAds } from 'expo';
import { Platform } from '@unimodules/core';
import { executeUnavailabileMethod } from '../TestUtils';

const unavailableMethods = [
  'NativeAdsManager',
  'AdSettings',
  'withNativeAd',
  'AdMediaView',
  'AdIconView',
  'AdTriggerView',
];

export const name = 'NativeAd';

const unavailableMessage = `is unavailable on ${Platform.OS}`;

export async function test({ describe, it, expect }) {
  function testUnavailableMethod(methodName) {
    describe(`${name}.${methodName}()`, () => {
      it(unavailableMessage, () => executeUnavailabileMethod(expect, FacebookAds[methodName]));
    });
  }
  unavailableMethods.forEach(testUnavailableMethod);
}
