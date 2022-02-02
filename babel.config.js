module.exports = {
  presets: [
    'react-app',
    ['@babel/preset-react', {
      importSource: 'theme-ui',
      runtime: 'automatic',
      throwIfNamespace: false
    }]
  ]
}
