import { AppIcon } from './AppIcon.types';

export default {
  get name() {
    return 'ExpoAppIcon';
  },
  get isSupported() {
    return false;
  },
  get icons(): {
    [name: string]: AppIcon;
  } {
    return {};
  },
};
