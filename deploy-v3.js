#!/usr/bin/env node

/**
 * Wrangler v3 部署脚本
 * 使用正确的语法传递环境变量
 */

const { execSync } = require('child_process');

console.log('🚀 开始 Wrangler v3 部署...\n');

// 检查Wrangler版本
console.log('🔍 检查Wrangler版本...');
try {
  const version = execSync('npx wrangler --version', { encoding: 'utf8' }).trim();
  console.log(`  📦 Wrangler版本: ${version}`);
  
  if (version.includes('3.')) {
    console.log('  ✅ 使用Wrangler v3，将使用 --define 参数');
  } else {
    console.log('  ⚠️  非Wrangler v3版本');
  }
} catch (error) {
  console.log('  ❌ 无法检测Wrangler版本');
}

// 部署命令选项
const deployCommands = [
  // Wrangler v3 语法
  'npx wrangler deploy src/index.js --env production --define CUSTOM_DOMAIN=libcuda.so --define MODE=production --define TARGET_UPSTREAM=""',
  
  // 环境变量前缀方式
  'CUSTOM_DOMAIN=libcuda.so MODE=production TARGET_UPSTREAM="" npx wrangler deploy src/index.js --env production',
  
  // 简化部署（使用硬编码值）
  'npx wrangler deploy src/index.js --env production'
];

console.log('\n📋 可用的部署命令:');
deployCommands.forEach((cmd, index) => {
  console.log(`  ${index + 1}. ${cmd}`);
});

console.log('\n💡 推荐使用第一个命令（Wrangler v3语法）:');
console.log('   npx wrangler deploy src/index.js --env production --define CUSTOM_DOMAIN=libcuda.so --define MODE=production --define TARGET_UPSTREAM=""');

console.log('\n🔧 如果仍有问题，源代码已使用硬编码默认值，可以直接使用:');
console.log('   npx wrangler deploy src/index.js --env production');

console.log('\n📝 注意：');
console.log('   - Wrangler v3 使用 --define 参数传递环境变量');
console.log('   - 源代码已包含硬编码默认值，确保基本功能正常');
console.log('   - 部署成功后可以在Cloudflare控制台修改环境变量'); 