/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 *
 * @deprecated Only supported on Chrome and Android Webview.
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;
}

export async function isStandalone() {
  return (
    // Chrome
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari
    (window.navigator as any).standalone === true
  );
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export async function preventAutoPresentInstallBanner() {
  // https://developers.google.com/web/fundamentals/app-install-banners/#listen_for_beforeinstallprompt
  /**
   * `BeforeInstallPromptEvent`
   */

  window.addEventListener('beforeinstallprompt', e => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e as any;
  });
}

export async function promptToInstall() {
  if (!deferredPrompt) throw new Error('promptToInstall: cannot promt');
  // Show the prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  const choiceResult = await deferredPrompt.userChoice;
  console.log(choiceResult);
  if (choiceResult.outcome === 'accepted') {
    console.log('User accepted the A2HS prompt');
  } else {
    // Once dismissed by the user, it will not appear again until a sufficient amount of time has passed (currently 3 months)
    console.log('User dismissed the A2HS prompt');
  }
  deferredPrompt = null;
}

window.addEventListener('appinstalled', evt => {
  // App added to home screen
});

export function useHoverStatesForTouches(enabled) {
  /**
   * https://dev.to/oskarlarsson/designing-native-like-progressive-web-apps-for-ios-510o
   *
   * Instead of using the default gray highlighting when tapping a link,
   * you may add your own on-tap effects.
   * By including the ontouchstart attribute in the body
   * tag of your code and keeping its value empty,
   * links and other elements will display their :hover and :active
   * effects when tapped. Use the following code and play around
   * with different :hover and :active styles to find the effects
   * that work best for your PWA.
   */
  if (enabled) {
    document.body.setAttribute('ontouchstart', '');
  } else {
    document.body.removeAttribute('ontouchstart');
  }
}

export async function disableCallouts(userSelect, touchCallout, highlightColor) {
  const style = _createWebStyle(userSelect, touchCallout, highlightColor);
  document.head!.appendChild(style);
}

function _createWebStyle(
  userSelect: string = 'none',
  touchCallout: string = 'none',
  highlightColor: string
): HTMLStyleElement {
  const style = `body {
-webkit-user-select: ${userSelect};
-webkit-tap-highlight-color: ${highlightColor};
-webkit-touch-callout: ${touchCallout};
}`;

  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  // @ts-ignore: TypeScript does not define HTMLStyleElement::styleSheet. This is just for IE and
  // possibly can be removed if it's unnecessary on IE 11.
  if (styleElement.styleSheet) {
    // @ts-ignore
    styleElement.styleSheet.cssText = fontStyle;
  } else {
    const textNode = document.createTextNode(style);
    styleElement.appendChild(textNode);
  }
  return styleElement;
}
