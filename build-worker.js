#!/usr/bin/env node

/**
 * Cloudflare Workers 构建脚本
 * 解决构建环境配置问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始构建 Cloudflare Workers...\n');

// 检查必要文件
const requiredFiles = [
  'src/index.js',
  'wrangler.toml',
  'package.json'
];

console.log('📁 检查必要文件...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - 文件不存在`);
    process.exit(1);
  }
});

// 检查wrangler版本
console.log('\n🔧 检查Wrangler版本...');
try {
  const wranglerVersion = execSync('npx wrangler --version', { encoding: 'utf8' }).trim();
  console.log(`  📦 Wrangler版本: ${wranglerVersion}`);
  
  if (wranglerVersion.includes('3.')) {
    console.log('  ⚠️  检测到Wrangler v3，将使用兼容模式');
  } else if (wranglerVersion.includes('4.')) {
    console.log('  ✅ 使用Wrangler v4，支持最新特性');
  }
} catch (error) {
  console.log('  ❌ 无法检测Wrangler版本');
}

// 验证wrangler.toml配置
console.log('\n⚙️  验证wrangler.toml配置...');
try {
  const wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
  
  if (wranglerConfig.includes('main = "src/index.js"')) {
    console.log('  ✅ 入口点配置正确');
  } else {
    console.log('  ❌ 缺少入口点配置');
    process.exit(1);
  }
  
  if (wranglerConfig.includes('compatibility_date')) {
    console.log('  ✅ 兼容性日期已配置');
  } else {
    console.log('  ❌ 缺少兼容性日期');
  }
} catch (error) {
  console.log(`  ❌ 读取wrangler.toml失败: ${error.message}`);
  process.exit(1);
}

// 构建项目
console.log('\n🔨 开始构建项目...');
try {
  console.log('  执行: npm run build');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('  ✅ 构建完成');
} catch (error) {
  console.log('  ❌ 构建失败');
  process.exit(1);
}

// 验证构建输出
console.log('\n📋 验证构建输出...');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`  📁 构建输出目录: ${distPath}`);
  files.forEach(file => {
    console.log(`    📄 ${file}`);
  });
} else {
  console.log('  ⚠️  构建输出目录不存在，这可能是正常的（直接部署源码）');
}

console.log('\n🎉 构建验证完成！');
console.log('\n📋 下一步操作:');
console.log('  1. 直接部署: npx wrangler deploy src/index.js --env production');
console.log('  2. 指定版本部署: npx wrangler@4 deploy src/index.js --env production');
console.log('  3. 使用脚本部署: npm run deploy:direct'); 