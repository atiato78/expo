// Support Metro Bundler env variable with webpack:
// https://github.com/codesandbox/codesandbox-client/pull/1807#issuecomment-486441740

if (typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = process.env.NODE_ENV !== 'production';
}
