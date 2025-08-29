/**
 * 构建配置文件
 * 解决Wrangler部署入口点问题
 */

module.exports = {
  // 构建命令
  buildCommand: 'npm run build',
  
  // 输出目录
  outputDirectory: 'dist',
  
  // 部署命令
  deployCommand: 'npx wrangler deploy src/index.js --env production',
  
  // 入口点文件
  entryPoint: 'src/index.js',
  
  // 环境配置
  environments: {
    production: {
      deployCommand: 'npx wrangler deploy src/index.js --env production',
      env: 'production'
    },
    staging: {
      deployCommand: 'npx wrangler deploy src/index.js --env staging',
      env: 'staging'
    },
    dev: {
      deployCommand: 'npx wrangler dev src/index.js --env dev',
      env: 'dev'
    }
  },
  
  // 验证配置
  validation: {
    requiredFiles: [
      'src/index.js',
      'wrangler.toml',
      'package.json'
    ],
    wranglerConfig: {
      main: 'src/index.js',
      compatibility_date: '2024-12-01'
    }
  }
}; 