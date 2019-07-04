import chalk from 'chalk';
import fs from 'fs-extra';

interface Action {
  /**
   * Check that ensures action can be executed safely.
   * @returns Error upon any erronous state occur or undefined upon everything is fine.
   */
  precondition: () => Promise<Error | void>;

  /**
   * Actual action that performs some logic.
   * @returns Error upon any erronous state occur or undefined upon everything is fine.
   */
  action: () => Promise<Error | void>;

  /**
   * Optional log supporting this action evaluation.
   */
  log?: string;
}

class RemovalAction implements Action {
  /**
   * @param path path to file or directory that will be removed.
   * @param log optional log supporting this action evaluation.
   */
  constructor(
    protected path: string,
    public log?: string,
  ) {}

  async precondition() {
    if (!await fs.pathExists(this.path)) {
      throw new Error(`No such file or directory ${this.path}`);
    }
  }

  async action() {
    await fs.remove(this.path)
  }
}

class UpdateAction extends RemovalAction {
  /**
   * @param path path to file that will be searched for old values.
   * @param oldValue value that should be searched throught file and be replaced.
   * @param newValue new value.
   * @param log optional log supporting this action evaluation.
   */
  constructor(
    path: string,
    private oldValue: string | RegExp,
    private newValue: string,
    log?: string,
  ) {
    super(path, log)
  }

  async action() {
    const contents = await fs.readFile(this.path, 'utf-8');
    const results = contents.replace(this.oldValue, this.newValue);
  }
}

function createRemovalConfiguration(versionNumber: string, rootPath: string): Array<RemovalAction | UpdateAction> {
  const abiVersion = `abi${versionNumber.replace(/\./g, '_')}`;
  return [
    new RemovalAction(`${rootPath}/android/versioned-abis/expoview-${abiVersion}`),
    new RemovalAction() // remove all expolibs that are no longer needed -> collect all usages from this sdk and others and remove these that are used by this sdk only
    new UpdateAction() // remove `abiXX_X_X` item from a list of supported SDKs in `settings.gradle`
    new UpdateAction() // remove appropriate entry from `allprojects.repositories` block from `build.gradle` (`maven { url { …abiXX_X_X… } }`)
    // - search in `.` (`/android`) for `SDK_XX` string — go through every found entry and decide what to do with the appropriate code. At the moment all search results are `BEGIN_SDK_XX` and `END_SDK_XX`, code between which should be just removed
    // (I would suggest _with Android Studio_) look for every usage of `ABIVersion.toNumber(String abiVersion)` method which is used whenever someone wants to create a code path depending on the SDK version in the unversioned code. Try to remove the codepath if possible
    // search in Java and Kotlin files for `/SDK(?!_INT)/`. Look through every entry and see if you can drop any no longer used code path
    // (if dropping some Android version support) look for `SDK_INT` in the codebase and see if you can simplify the logic
  ];
}

/**
 * @param versionNumber SDK version number to be removed
 * @param rootPath root path for Expo project
 */
export async function removeVersionAsync(
  versionNumber: string,
  rootPath: string,
) {

  console.log(`Removing SDK version ${chalk.cyan(versionNumber)}.`)
  console.log(`Checking preconditions ... 🧐`);

  const removalConfiguration = createRemovalConfiguration(versionNumber, rootPath);
  for (const item of removalConfiguration) {
    await item.precondition();
  }

  console.log(`Preconditions fullfilled! 😏`)
  console.log(`Runnig removal actions! 🤪`);

  for (const item of removalConfiguration) {
    if (item.log) {
      console.log(item.log);
    }
    await item.action();
  }
}
