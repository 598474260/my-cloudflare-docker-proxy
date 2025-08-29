# 部署故障排除指南

## 🚨 当前问题：Wrangler入口点错误

### 问题描述
```
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

### 原因分析
1. **Wrangler版本不匹配**：构建环境使用v3.114.9，项目配置为v4.33.1
2. **配置缓存问题**：构建环境可能使用了缓存的旧配置
3. **依赖版本冲突**：npm和yarn版本不一致

## 🛠️ 解决方案

### 方案1：强制指定入口点（推荐）

在部署命令中直接指定入口点：

```bash
# 方法1：直接指定文件
npx wrangler deploy src/index.js --env production

# 方法2：指定版本并指定文件
npx wrangler@4 deploy src/index.js --env production

# 方法3：使用项目脚本
npm run deploy:direct
```

### 方案2：清理并重新安装依赖

```bash
# 清理缓存
npm cache clean --force
yarn cache clean

# 删除node_modules
rm -rf node_modules

# 重新安装
npm install
# 或者
yarn install
```

### 方案3：使用兼容性配置

如果构建环境强制使用Wrangler v3，可以：

1. **降级wrangler版本**：
   ```bash
   npm install --save-dev wrangler@^3.36.0
   ```

2. **修改wrangler.toml**：
   ```toml
   # 移除v4特有配置
   # compatibility_flags = ["nodejs_compat"]
   ```

## 🔍 诊断步骤

### 1. 运行验证脚本

```bash
# 基础验证
npm run verify

# Workers专用验证
npm run verify:worker
```

### 2. 检查配置文件

确认以下文件存在且配置正确：
- ✅ `src/index.js` - 源代码文件
- ✅ `wrangler.toml` - 包含 `main = "src/index.js"`
- ✅ `package.json` - 正确的依赖版本

### 3. 检查构建环境

```bash
# 检查Node.js版本
node --version

# 检查npm版本
npm --version

# 检查Wrangler版本
npx wrangler --version
```

## 📋 部署检查清单

- [ ] 运行 `npm run verify:worker` 验证配置
- [ ] 确认 `wrangler.toml` 包含 `main = "src/index.js"`
- [ ] 检查Wrangler版本兼容性
- [ ] 验证环境变量配置
- [ ] 测试本地开发环境

## 🚀 快速部署命令

### 开发环境测试
```bash
npm run dev
```

### 生产环境部署
```bash
# 方法1：直接部署
npx wrangler deploy src/index.js --env production

# 方法2：使用脚本
npm run deploy:direct

# 方法3：指定版本
npx wrangler@4 deploy src/index.js --env production
```

### 测试环境部署
```bash
npx wrangler deploy src/index.js --env staging
```

## 🐛 常见错误及解决方案

### 错误1：Missing entry-point
**解决方案**：在部署命令中指定 `src/index.js`

### 错误2：Wrangler版本过旧
**解决方案**：使用 `npx wrangler@4` 或升级依赖

### 错误3：配置读取失败
**解决方案**：检查 `wrangler.toml` 语法和路径

### 错误4：环境变量未定义
**解决方案**：确认环境配置正确

## 📞 技术支持

如果问题仍然存在：

1. **运行诊断脚本**：`npm run verify:worker`
2. **检查构建日志**：查看完整的错误信息
3. **验证配置文件**：确认所有配置项正确
4. **测试本地环境**：先确保本地能正常运行

## 🔄 更新日志

### 2025-08-29 v2
- 添加了专门的Workers构建验证脚本
- 创建了部署故障排除指南
- 提供了多种部署方法
- 增强了配置验证功能 