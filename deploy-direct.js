#!/usr/bin/env node

/**
 * 直接部署脚本 - 绕过依赖安装问题
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 开始直接部署...\n');

// 检查必要文件
console.log('📁 检查必要文件...');
const requiredFiles = [
  'src/index.js',
  'wrangler.toml'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - 文件不存在`);
    process.exit(1);
  }
});

// 检查wrangler是否可用
console.log('\n🔧 检查Wrangler可用性...');
try {
  const version = execSync('npx wrangler --version', { encoding: 'utf8' }).trim();
  console.log(`  📦 Wrangler版本: ${version}`);
  
  if (version.includes('3.114.9')) {
    console.log('  ✅ 版本匹配，可以部署');
  } else {
    console.log('  ⚠️  版本不匹配，但尝试部署');
  }
} catch (error) {
  console.log('  ❌ Wrangler不可用，尝试安装...');
  
  try {
    console.log('  安装Wrangler v3...');
    execSync('npm install --no-save wrangler@3.114.9', { stdio: 'inherit' });
    console.log('  ✅ Wrangler安装成功');
  } catch (installError) {
    console.log('  ❌ Wrangler安装失败');
    console.log('  尝试使用全局安装...');
    
    try {
      execSync('npm install -g wrangler@3.114.9', { stdio: 'inherit' });
      console.log('  ✅ 全局Wrangler安装成功');
    } catch (globalError) {
      console.log('  ❌ 所有安装方法都失败');
      process.exit(1);
    }
  }
}

// 部署命令
console.log('\n🚀 开始部署...');
const deployCommands = [
  'npx wrangler deploy src/index.js --env production',
  'wrangler deploy src/index.js --env production',
  'npx wrangler@3.114.9 deploy src/index.js --env production'
];

for (let i = 0; i < deployCommands.length; i++) {
  const cmd = deployCommands[i];
  console.log(`\n尝试命令 ${i + 1}: ${cmd}`);
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n🎉 部署成功！使用命令: ${cmd}`);
    process.exit(0);
  } catch (error) {
    console.log(`  ❌ 命令 ${i + 1} 失败，尝试下一个...`);
    
    if (i === deployCommands.length - 1) {
      console.log('\n💥 所有部署命令都失败了！');
      console.log('\n🔧 建议解决方案:');
      console.log('  1. 检查网络连接');
      console.log('  2. 确认Cloudflare账户权限');
      console.log('  3. 检查wrangler.toml配置');
      console.log('  4. 尝试手动部署');
      process.exit(1);
    }
  }
} 