module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://c.y.qq.com',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api': 'https://c.y.qq.com'
        },
        headers: {
          referer: 'https://c.y.qq.com/',
          host: 'c.y.qq.com'
        }
      },
      '/uapi': {
        target: 'https://u.y.qq.com',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/uapi': 'https://u.y.qq.com'
        },
        headers: {
          referer: 'https://y.qq.com/',
          host: 'u.y.qq.com'
        }
      }
    }
  }
}
