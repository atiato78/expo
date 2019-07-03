import chalk from 'chalk';
import semver from 'semver';
import inquirer from 'inquirer';
import { Command } from '@expo/commander/typings';

import * as IosVersioning from '../versioning/ios';
import * as AndroidVersioning from '../versioning/android';
import { getExpoRepositoryRootDir } from '../Directories';
import { getOldestSDKVersionAsync } from '../ProjectVersions';
import { Platform } from '../utils/platform';

interface ActionOptions {
  platform: Platform;
  sdkVersion: string;
}

type InputActionOptions = Partial<ActionOptions>

const EXPO_DIR = getExpoRepositoryRootDir();

async function getOldestOrAskForSDKVersionAsync(platform: Platform): Promise<string | undefined> {
  const defaultSdkVersion = await getOldestSDKVersionAsync(platform);

  if (defaultSdkVersion && process.env.CI) {
    console.log(`${chalk.red('`--sdkVersion`')} not provided - defaulting to ${chalk.cyan(defaultSdkVersion)}`);
    return defaultSdkVersion;
  }

  const { sdkVersion } = await inquirer.prompt<{ sdkVersion: string }>([
    {
      type: 'input',
      name: 'sdkVersion',
      message: 'What is the SDK version that you want to remove?',
      default: defaultSdkVersion,
      validate(value) {
        if (!semver.valid(value)) {
          return `Invalid version: ${chalk.cyan(value)}`;
        }
        return true;
      },
    }
  ]);
  return sdkVersion;
}

/**
 * Validates InputActionOptions and throws Error upon wrong option passed in.
 */
async function validateActionOptions(options: InputActionOptions): Promise<ActionOptions> {
  if (!options.platform) {
    throw new Error(`Run with \`--platform <${Object.values(Platform).join(' | ')}>\`.`);
  }
  if (!Object.values(Platform).includes(options.platform)) {
    throw new Error(`Platform '${options.platform}' is not supported. Use one of <${Object.values(Platform).join(' | ')}>`);
  }

  const sdkVersion = options.sdkVersion || await getOldestOrAskForSDKVersionAsync(options.platform);

  if (!sdkVersion) {
    throw new Error('Oldest SDK version not found. Try to run with `--sdkVersion <SDK version>`.');
  }

  return {
    sdkVersion,
    platform: options.platform,
  };
}

async function action(inputOptions: InputActionOptions) {
  const options = await validateActionOptions(inputOptions);

  switch (options.platform) {
    case Platform.IOS:
      return IosVersioning.removeVersionAsync(options.sdkVersion, EXPO_DIR);
    case Platform.Android:
      return AndroidVersioning.removeVersionAsync(options.sdkVersion, EXPO_DIR);
  }
}

export default (program: Command) => {
  program
    .command('remove-sdk-version')
    .alias('remove-sdk', 'rm-sdk')
    .description('Removes SDK version.')
    .usage(`

To remove versioned code for the oldest supported SDK on iOS, run:
${chalk.gray('>')} ${chalk.italic.cyan('et remove-sdk-version --platform ios')}`
    )
    .option('-p, --platform <string>', `Specifies a platform for which the SDK code should be removed. Supported platforms: ${chalk.cyan('ios')}, ${chalk.cyan('android')}.`)
    .option('-s, --sdkVersion [string]', 'SDK version to remove. Defaults to the oldest supported SDK version.')
    .asyncAction(action);
};
