import { Platform } from '@unimodules/core';
import { MediaLibrary } from 'expo';

import { executeUnavailabileMethod } from '../TestUtils';

export const name = 'MediaLibrary';

const unavailableMessage = `is unavailable on ${Platform.OS}`;

const unavailableMethods = [
  'createAssetAsync',
  'addAssetsToAlbumAsync',
  'removeAssetsFromAlbumAsync',
  'deleteAssetsAsync',
  'getAssetInfoAsync',
  'getAlbumsAsync',
  'getAssetsAsync',
  'getMomentsAsync',
  'getAlbumAsync',
  'createAlbumAsync',
  'deleteAlbumsAsync',
];

export async function test({ describe, it, expect }) {
  function testUnavailableMethod(methodName) {
    describe(`${name}.${methodName}()`, () => {
      it(unavailableMessage, () => executeUnavailabileMethod(expect, MediaLibrary[methodName]));
    });
  }
  unavailableMethods.forEach(testUnavailableMethod);
}
