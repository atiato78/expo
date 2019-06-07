import { UnavailabilityError } from '@unimodules/core';

import { AppIcon } from './AppIcon.types';
import ExpoAppIcon from './ExpoAppIcon';

export { AppIcon };

export const isSupported: boolean = ExpoAppIcon.isSupported;

// TODO: Bacon: Return a localURI to the alternate Icon. Currently the name is used to reference a static asset.
export const alternateIcons: {
  [name: string]: AppIcon;
} = ExpoAppIcon.icons;

// TODO: Bacon: non-standard iOS - return the default icon instead of null.
export async function getIconAsync(): Promise<AppIcon | null> {
  if (!ExpoAppIcon.getIconAsync) throw new UnavailabilityError('expo-app-icon', 'getIconAsync');
  return ExpoAppIcon.getIconAsync();
}

export async function setIconAsync(name: string | null): Promise<void> {
  if (!ExpoAppIcon.setIconAsync) throw new UnavailabilityError('expo-app-icon', 'setIconAsync');
  return await ExpoAppIcon.setIconAsync(name);
}

// Helper method
export async function isCurrentIconAsync(name: string | null): Promise<boolean> {
  let currentIconName: string | null = null;
  try {
    const icon = await getIconAsync();
    if (icon) {
      currentIconName = icon.name;
    }
  } catch (error) {}
  // If the module is unsupported then the current icon would be default.
  return name === currentIconName;
}
