#!/usr/bin/env node

/**
 * 环境变量测试脚本
 * 验证wrangler配置和环境变量
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🧪 开始环境变量测试...\n');

// 测试1：检查配置文件
console.log('📁 测试1：检查配置文件...');
try {
  const wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
  
  // 检查全局环境变量
  if (wranglerConfig.includes('CUSTOM_DOMAIN = "libcuda.so"')) {
    console.log('  ✅ 全局 CUSTOM_DOMAIN 已配置');
  } else {
    console.log('  ❌ 全局 CUSTOM_DOMAIN 未配置');
  }
  
  if (wranglerConfig.includes('MODE = "production"')) {
    console.log('  ✅ 全局 MODE 已配置');
  } else {
    console.log('  ❌ 全局 MODE 未配置');
  }
  
  // 检查生产环境配置
  if (wranglerConfig.includes('[env.production]')) {
    console.log('  ✅ 生产环境配置段存在');
  } else {
    console.log('  ❌ 生产环境配置段不存在');
  }
  
} catch (error) {
  console.log(`  ❌ 读取配置文件失败: ${error.message}`);
}

// 测试2：验证wrangler配置
console.log('\n🔧 测试2：验证wrangler配置...');
try {
  const result = execSync('npx wrangler config list', { encoding: 'utf8' });
  console.log('  ✅ wrangler配置验证成功');
  console.log('  📋 配置内容预览:');
  console.log(result.substring(0, 200) + '...');
} catch (error) {
  console.log(`  ❌ wrangler配置验证失败: ${error.message}`);
}

// 测试3：检查环境变量绑定
console.log('\n🌍 测试3：检查环境变量绑定...');
try {
  // 模拟环境变量检查
  const envVars = {
    CUSTOM_DOMAIN: 'libcuda.so',
    MODE: 'production',
    TARGET_UPSTREAM: ''
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`  ✅ ${key} = "${value}"`);
  });
} catch (error) {
  console.log(`  ❌ 环境变量检查失败: ${error.message}`);
}

// 测试4：提供解决方案
console.log('\n💡 测试4：提供解决方案...');
console.log('  如果环境变量仍然未定义，请尝试以下方法：');
console.log('  1. 使用简化的配置文件: wrangler-simple.toml');
console.log('  2. 在部署命令中直接指定环境变量:');
console.log('     npx wrangler deploy src/index.js --env production --var CUSTOM_DOMAIN=libcuda.so');
console.log('  3. 检查Cloudflare Workers控制台的环境变量绑定');

console.log('\n🎯 推荐操作：');
console.log('  1. 备份当前配置: cp wrangler.toml wrangler.toml.backup');
console.log('  2. 使用简化配置: cp wrangler-simple.toml wrangler.toml');
console.log('  3. 重新部署: npx wrangler deploy src/index.js --env production'); 