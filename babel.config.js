module.exports = {
  presets: [
    'react-app',
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ],
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        throwIfNamespace: false, // defaults to true
        runtime: 'automatic', // defaults to classic
        importSource: '@theme-ui/core' // defaults to react
      }
    ]
  ]
}
