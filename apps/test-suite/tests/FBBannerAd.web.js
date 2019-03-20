import { FacebookAds } from 'expo';
import { Platform } from '@unimodules/core';
import { executeUnavailabileMethod } from '../TestUtils';

const unavailableMethods = ['BannerAd', 'AdSettings'];

export const name = 'BannerAd';

const unavailableMessage = `is unavailable on ${Platform.OS}`;

export async function test({ describe, it, expect }) {
  function testUnavailableMethod(methodName) {
    describe(`${name}.${methodName}()`, () => {
      it(unavailableMessage, () => executeUnavailabileMethod(expect, FacebookAds[methodName]));
    });
  }
  unavailableMethods.forEach(testUnavailableMethod);
}
