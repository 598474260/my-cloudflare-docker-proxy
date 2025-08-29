#!/usr/bin/env node

/**
 * 快速部署脚本 - 测试环境变量修复
 */

const { execSync } = require('child_process');

console.log('🚀 开始快速部署测试...\n');

// 检查环境变量配置
console.log('🔍 检查环境变量配置...');
try {
  const fs = require('fs');
  const wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
  
  if (wranglerConfig.includes('CUSTOM_DOMAIN = "libcuda.so"')) {
    console.log('  ✅ CUSTOM_DOMAIN 已配置');
  } else {
    console.log('  ❌ CUSTOM_DOMAIN 未配置');
  }
  
  if (wranglerConfig.includes('MODE = "production"')) {
    console.log('  ✅ MODE 已配置');
  } else {
    console.log('  ❌ MODE 未配置');
  }
} catch (error) {
  console.log(`  ❌ 读取配置失败: ${error.message}`);
}

// 部署命令
const deployCommands = [
  'npx wrangler deploy src/index.js --env production',
  'npx wrangler@4 deploy src/index.js --env production',
  'npm run deploy:direct'
];

console.log('\n📋 可用的部署命令:');
deployCommands.forEach((cmd, index) => {
  console.log(`  ${index + 1}. ${cmd}`);
});

console.log('\n💡 推荐使用第一个命令进行测试:');
console.log('   npx wrangler deploy src/index.js --env production');

console.log('\n🔧 如果仍有问题，请检查:');
console.log('   1. wrangler.toml 中的环境变量配置');
console.log('   2. 源代码中的环境变量使用');
console.log('   3. Cloudflare Workers 的环境变量绑定'); 