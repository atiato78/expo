import { AR } from 'expo';
import ARScreens from './AR';
import Simple from './Simple';
// import Loaders from './Loaders';
// import Effects from './Effects';
// import Legacy from './Legacy';
// import CubeTexture from './CubeTexture';
// import Shaders from './Shaders';

let screens = {
  // Loaders,
  // Effects,
  // Shaders,
  Simple,
  // Legacy,
  // CubeTexture,
};

if (AR.isAvailable()) {
  screens = { ...screens, ...ARScreens };
}

export default screens;
