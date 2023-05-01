module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = 'electron-renderer'
    }
    config.experiments = {
      asyncWebAssembly: true,
      layers: true
    }
    return config
  }
}
