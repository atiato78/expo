import { GoogleSignIn } from 'expo';
import { Platform } from '@unimodules/core';
import { executeUnavailabileMethod } from '../TestUtils';

const unavailableMethods = [
  'initAsync',
  'signInAsync',
  'signOutAsync',
  'getCurrentUserAsync',
  'disconnectAsync',
  'getPhotoAsync',
  'isSignedInAsync',
];

export const name = 'GoogleSignIn';

const unavailableMessage = `is unavailable on ${Platform.OS}`;

export async function test({ describe, it, expect }) {
  function testUnavailableMethod(methodName) {
    describe(`${name}.${methodName}()`, () => {
      it(unavailableMessage, () => executeUnavailabileMethod(expect, GoogleSignIn[methodName]));
    });
  }
  unavailableMethods.forEach(testUnavailableMethod);
}
