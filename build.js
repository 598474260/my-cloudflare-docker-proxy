#!/usr/bin/env node

/**
 * 构建脚本 - 验证项目配置和构建过程
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始项目构建验证...\n');

// 检查必要文件
const requiredFiles = [
  'src/index.js',
  'wrangler.toml',
  'package.json',
  '.yarnrc.yml'
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

// 检查wrangler.toml配置
console.log('\n⚙️  检查wrangler.toml配置...');
try {
  const wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
  
  if (wranglerConfig.includes('main = "src/index.js"')) {
    console.log('  ✅ 入口点配置正确');
  } else {
    console.log('  ❌ 缺少入口点配置');
  }
  
  if (wranglerConfig.includes('routes = [')) {
    console.log('  ✅ 路由配置已启用');
  } else {
    console.log('  ❌ 路由配置未启用');
  }
  
  if (wranglerConfig.includes('compatibility_date = "2024-12-01"')) {
    console.log('  ✅ 兼容性日期已更新');
  } else {
    console.log('  ❌ 兼容性日期需要更新');
  }
} catch (error) {
  console.log(`  ❌ 读取wrangler.toml失败: ${error.message}`);
}

// 检查package.json
console.log('\n📦 检查package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.devDependencies.wrangler) {
    const wranglerVersion = packageJson.devDependencies.wrangler;
    if (wranglerVersion.startsWith('^4.')) {
      console.log(`  ✅ Wrangler版本: ${wranglerVersion}`);
    } else {
      console.log(`  ⚠️  Wrangler版本过低: ${wranglerVersion}`);
    }
  }
  
  if (packageJson.engines && packageJson.engines.node) {
    console.log(`  ✅ Node.js版本要求: ${packageJson.engines.node}`);
  }
} catch (error) {
  console.log(`  ❌ 读取package.json失败: ${error.message}`);
}

// 检查源代码
console.log('\n💻 检查源代码...');
try {
  const sourceCode = fs.readFileSync('src/index.js', 'utf8');
  
  if (sourceCode.includes('addEventListener("fetch"')) {
    console.log('  ✅ 源代码包含必要的Worker事件监听器');
  }
  
  if (sourceCode.includes('CUSTOM_DOMAIN')) {
    console.log('  ✅ 源代码包含环境变量引用');
  }
  
  console.log(`  📊 源代码行数: ${sourceCode.split('\n').length}`);
} catch (error) {
  console.log(`  ❌ 读取源代码失败: ${error.message}`);
}

console.log('\n🎉 项目构建验证完成！');
console.log('\n📋 下一步操作:');
console.log('  1. 运行: yarn install');
console.log('  2. 运行: yarn dev (测试开发环境)');
console.log('  3. 运行: yarn deploy (部署到生产环境)');
console.log('  4. 运行: yarn deploy:staging (部署到测试环境)'); 