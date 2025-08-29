# 部署说明

## 🚀 快速部署

### 1. 解决Yarn版本兼容性问题

本项目已升级到Yarn v4，解决了构建环境的版本冲突问题。

**如果遇到Yarn版本错误，请按以下步骤操作：**

```bash
# 删除旧的锁文件
rm yarn.lock

# 清理缓存
yarn cache clean

# 重新安装依赖
yarn install
```

### 2. 解决Wrangler配置问题

**已修复的配置问题：**
- ✅ 添加了 `main = "src/index.js"` 入口点配置
- ✅ 启用了路由配置（routes）
- ✅ 更新了兼容性日期到 2024-12-01
- ✅ 升级Wrangler到最新v4版本

### 3. 项目验证

在部署前，运行验证命令检查配置：

```bash
# 验证项目配置
yarn verify

# 或者直接运行
node build.js
```

### 4. 环境配置

#### 开发环境
```bash
yarn dev
```

#### 生产环境部署
```bash
yarn deploy
```

#### 测试环境部署
```bash
yarn deploy:staging
```

## 🔧 环境变量配置

### 必需的环境变量

在 `wrangler.toml` 中配置以下环境变量：

```toml
[env.vars]
CUSTOM_DOMAIN = "your-domain.com"

[env.dev.vars]
MODE = "debug"
TARGET_UPSTREAM = "https://registry-1.docker.io"
CUSTOM_DOMAIN = "example.com"

[env.production.vars]
MODE = "production"
TARGET_UPSTREAM = ""

[env.staging.vars]
MODE = "staging"
TARGET_UPSTREAM = ""
```

### 路由配置

生产环境已启用以下路由：
- `docker.libcuda.so/*` → Docker Hub
- `quay.libcuda.so/*` → Quay.io
- `gcr.libcuda.so/*` → Google Container Registry
- `k8s-gcr.libcuda.so/*` → Kubernetes GCR
- `k8s.libcuda.so/*` → Kubernetes Registry
- `ghcr.libcuda.so/*` → GitHub Container Registry
- `cloudsmith.libcuda.so/*` → Cloudsmith
- `ecr.libcuda.so/*` → AWS ECR Public

## 📋 部署检查清单

- [ ] 运行 `yarn verify` 验证配置
- [ ] 确认 `CUSTOM_DOMAIN` 已正确配置
- [ ] 验证Cloudflare Workers路由配置
- [ ] 测试Docker Registry代理功能
- [ ] 检查错误日志和监控

## 🐛 常见问题

### Q: Yarn版本不兼容
**A:** 删除 `yarn.lock` 文件，重新运行 `yarn install`

### Q: Wrangler入口点错误
**A:** 确认 `wrangler.toml` 中包含 `main = "src/index.js"`

### Q: 构建失败
**A:** 检查Node.js版本是否 >= 18.0.0

### Q: 部署失败
**A:** 确认Cloudflare账户权限和API密钥配置

### Q: 路由不工作
**A:** 检查 `wrangler.toml` 中的routes配置是否正确

## 📞 技术支持

如遇到问题，请检查：
1. 运行 `yarn verify` 验证配置
2. Cloudflare Workers控制台日志
3. 项目构建日志
4. 环境变量配置
5. 网络连接状态

## 🔄 更新日志

### 2025-08-29
- 升级到Yarn v4
- 修复Wrangler配置问题
- 添加项目验证脚本
- 启用路由配置
- 更新Wrangler到v4版本 