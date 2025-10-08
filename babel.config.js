module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  plugins.push('react-native-worklets/plugin');
  plugins.push([
    'module-resolver',
    {
      root: ['./'],
      alias: {
        '@': './src',
        '@assets': './assets',
      },
      extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
    },
  ]);

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
