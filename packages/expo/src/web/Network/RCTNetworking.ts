import { EventEmitter } from 'expo-core';

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */
function throwMissingNativeModule() {
  console.warn('Missing Native module');
}

class MissingNativeRCTNetworkingShim extends EventEmitter {

  sendRequest(...args: Array<any>) {
    throwMissingNativeModule();
  }

  abortRequest(...args: Array<any>) {
    throwMissingNativeModule();
  }

  clearCookies(...args: Array<any>) {
    throwMissingNativeModule();
  }
}

// This module depends on the native `RCTNetworkingNative` module. If you don't include it,
// `RCTNetworking.isAvailable` will return `false`, and any method calls will throw.
// We reassign the class variable to keep the autodoc generator happy.

class FakeModule {
  get name(): string {
    return 'FakeModule';
  }

  startObserving(): void {}
  stopObserving(): void {}
  addListener(eventName: string) {}
  removeListeners(count: number) {}
}

const RCTNetworking = new MissingNativeRCTNetworkingShim(new FakeModule());

export default RCTNetworking;
