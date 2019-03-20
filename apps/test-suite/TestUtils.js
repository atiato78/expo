'use strict';

import { UnavailabilityError } from '@unimodules/core';
import { NativeModules } from 'react-native';
let { ExponentTest } = NativeModules;

export async function acceptPermissionsAndRunCommandAsync(fn) {
  if (!ExponentTest) {
    return await fn();
  }

  let results = await Promise.all([
    ExponentTest.action({
      selectorType: 'text',
      selectorValue: 'Allow',
      actionType: 'click',
      delay: 1000,
      timeout: 100,
    }),
    fn(),
  ]);

  return results[1];
}

export async function shouldSkipTestsRequiringPermissionsAsync() {
  if (!ExponentTest || !ExponentTest.shouldSkipTestsRequiringPermissionsAsync) {
    return false;
  }
  return ExponentTest.shouldSkipTestsRequiringPermissionsAsync();
}

export async function throwsErrorAsync(method) {
  try {
    await method();
  } catch (error) {
    return error;
  }
}
export async function executeUnavailabileMethod(expect, method) {
  const error = await throwsErrorAsync(method);
  expect(error instanceof UnavailabilityError).toBeTruthy();
}
