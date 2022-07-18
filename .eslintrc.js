module.exports = {
  root: true,
  extends: ['@slimevr/eslint-config'],
  settings: {
    next: {
      rootDir: ['apps/*/']
    }
  },
  parserOptions: {
    project: ['./packages/*/tsconfig.json', './apps/*/tsconfig.json']
  }
};
