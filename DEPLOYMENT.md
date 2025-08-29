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

### 2. 环境配置

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

## 📋 部署检查清单

- [ ] 确认 `CUSTOM_DOMAIN` 已正确配置
- [ ] 验证Cloudflare Workers路由配置
- [ ] 测试Docker Registry代理功能
- [ ] 检查错误日志和监控

## 🐛 常见问题

### Q: Yarn版本不兼容
**A:** 删除 `yarn.lock` 文件，重新运行 `yarn install`

### Q: 构建失败
**A:** 检查Node.js版本是否 >= 18.0.0

### Q: 部署失败
**A:** 确认Cloudflare账户权限和API密钥配置

## 📞 技术支持

如遇到问题，请检查：
1. Cloudflare Workers控制台日志
2. 项目构建日志
3. 环境变量配置
4. 网络连接状态 