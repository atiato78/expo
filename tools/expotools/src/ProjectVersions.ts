import path from 'path';
import fs from 'fs-extra';
import plist from 'plist';
import semver from 'semver';
import JsonFile from '@expo/json-file';

import * as Directories from './Directories';
import { Platform } from './utils/platform';

interface ProjectVersions {
  sdkVersion: string;
  nativeSdkVersion: string;
  iosAppVersion: string;
}

const EXPO_DIR = Directories.getExpoRepositoryRootDir();

export async function sdkVersionAsync(): Promise<string> {
  const packageJson = await JsonFile.readAsync(path.join(EXPO_DIR, 'packages/expo/package.json'));
  return packageJson.version as string;
}

export async function nativeSdkVersionAsync(sdkVersion?: string): Promise<string> {
  // On the native side we always just the first release version (with zeros).
  const majorVersion = semver.major(sdkVersion || await sdkVersionAsync());
  return `${majorVersion}.0.0`;
}

export async function iosAppVersionAsync(): Promise<string> {
  const infoPlistPath = path.join(EXPO_DIR, 'ios', 'Exponent', 'Supporting', 'Info.plist');
  const infoPlist = plist.parse(fs.readFileSync(infoPlistPath, 'utf8'));
  const bundleVersion = infoPlist.CFBundleShortVersionString;

  if (!bundleVersion) {
    throw new Error(`"CFBundleShortVersionString" not found in plist: ${infoPlistPath}`);
  }
  return bundleVersion;
}

export async function getProjectVersionsAsync(): Promise<ProjectVersions> {
  const sdkVersion = await sdkVersionAsync();
  const nativeSdkVersion = await nativeSdkVersionAsync(sdkVersion);
  const iosAppVersion = await iosAppVersionAsync();

  return {
    sdkVersion,
    nativeSdkVersion,
    iosAppVersion,
  };
}

/**
 * Looks for supported SDK versions by reading some project files.
 * @Android reads `android/app/build.gradle`
 * @iOS reads `exponent-view-template/ios/exponent-view-template/Supporting/sdkVersions.json`
 * @returns array of strings, each in semver format (X.X.X).
 */
export async function getSDKVersionsAsync(platform: Platform): Promise<string[]> {
  switch (platform) {
    case Platform.IOS:
      const sdkVersionsPath = path.join(EXPO_DIR, 'exponent-view-template', 'ios', 'exponent-view-template', 'Supporting', 'sdkVersions.json');

      if (!await fs.pathExists(sdkVersionsPath)) {
        throw new Error(`File ${sdkVersionsPath} does not exist. It's needed for extracting available SDK versions on iOS.`);
      }

      const { sdkVersions } = await JsonFile.readAsync(sdkVersionsPath) as { sdkVersions: string[] };
      return sdkVersions;

    case Platform.Android: {
      const buildGradlePath = path.join(EXPO_DIR, 'android', 'app', 'build.gradle');

      if (!await fs.pathExists(buildGradlePath)) {
        throw new Error(`File ${buildGradlePath} does not exists. It's neede for reading available SDK version on Android.`);
      }

      function nonNullPredicate<T>(value: T | null): value is T {
        return value !== null;
      }

      const buildGradleContent = await fs.readFile(buildGradlePath, 'utf-8');
      const matches = buildGradleContent.match(/project\(["']:expoview-abi((\d)+_(\d)+_(\d)+)['"]\)/g) || [];
      const versions = matches
        .map(match => /\d+_\d+_\d+/.exec(match))
        .map(matched => matched && matched[0].replace(/_/g, '.'))
        .filter(nonNullPredicate);

      return versions;
    }
  }
}

export async function getOldestSDKVersionAsync(platform: Platform): Promise<string | undefined> {
  const sdkVersions = await getSDKVersionsAsync(platform);
  return sdkVersions.sort(semver.compare)[0];
}

export async function getNextSDKVersionAsync(platform: Platform): Promise<string | undefined> {
  const sdkVersions = await getSDKVersionsAsync(platform);
  const newestVersion = sdkVersions.sort(semver.rcompare)[0];

  if (!newestVersion) {
    return;
  }
  return `${semver.major(semver.inc(newestVersion, 'major'))}.0.0`;
}
