# 生产环境变量配置指南

## 概述

本项目使用环境变量来管理敏感配置信息，如 API 密钥和应用程序设置。以下是在生产环境中正确设置和使用环境变量的完整指南。

## 必需的环境变量

### API 配置
```bash
# DashScope API 密钥（必需）
DASHSCOPE_API_KEY=your_actual_api_key_here

# DashScope 应用 ID（必需）
DASHSCOPE_APP_ID=your_actual_app_id_here
```

### 环境配置
```bash
# Node.js 环境（生产环境设置为 production）
NODE_ENV=production
```

## 生产环境部署方式

### 1. Vercel 部署

如果使用 Vercel 部署，可以通过以下方式设置环境变量：

**方法一：通过 Vercel 控制台**
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 Settings → Environment Variables
4. 添加以下变量：
   - `DASHSCOPE_API_KEY`: 你的 DashScope API 密钥
   - `DASHSCOPE_APP_ID`: 你的 DashScope 应用 ID
   - `NODE_ENV`: production

**方法二：通过 Vercel CLI**
```bash
vercel env add DASHSCOPE_API_KEY
vercel env add DASHSCOPE_APP_ID
vercel env add NODE_ENV
```

### 2. Docker 部署

创建 `docker-compose.yml` 文件：
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DASHSCOPE_API_KEY=${DASHSCOPE_API_KEY}
      - DASHSCOPE_APP_ID=${DASHSCOPE_APP_ID}
    env_file:
      - .env.production
```

### 3. 传统服务器部署

**方法一：使用 .env.production 文件**
```bash
# 创建生产环境文件
touch .env.production

# 添加环境变量
echo "NODE_ENV=production" >> .env.production
echo "DASHSCOPE_API_KEY=your_actual_api_key" >> .env.production
echo "DASHSCOPE_APP_ID=your_actual_app_id" >> .env.production

# 构建和启动
npm run build
npm start
```

**方法二：直接设置系统环境变量**
```bash
export NODE_ENV=production
export DASHSCOPE_API_KEY=your_actual_api_key
export DASHSCOPE_APP_ID=your_actual_app_id

npm run build
npm start
```

### 4. PM2 部署

创建 `ecosystem.config.js` 文件：
```javascript
module.exports = {
  apps: [{
    name: 'rag-web-2',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      DASHSCOPE_API_KEY: 'your_actual_api_key',
      DASHSCOPE_APP_ID: 'your_actual_app_id'
    }
  }]
}
```

启动命令：
```bash
pm2 start ecosystem.config.js --env production
```

## 安全最佳实践

### 1. 环境变量安全
- ✅ **永远不要**将真实的 API 密钥提交到版本控制系统
- ✅ 使用 `.env.example` 文件作为模板（不包含真实值）
- ✅ 在生产环境中使用强密码和复杂的 API 密钥
- ✅ 定期轮换 API 密钥

### 2. 文件权限
```bash
# 设置 .env 文件的适当权限
chmod 600 .env.production
```

### 3. 环境隔离
- 开发环境：`.env.local` 或 `.env.development`
- 测试环境：`.env.test`
- 生产环境：`.env.production`

## 环境变量验证

项目已经包含基本的环境变量验证，位于 `src/app/api/chat/route.ts`：

```typescript
const apiKey = process.env.DASHSCOPE_API_KEY;
const appId = process.env.DASHSCOPE_APP_ID;

if (!apiKey || !appId) {
  return NextResponse.json({ error: 'API 配置缺失' }, { status: 500 });
}
```

## 故障排除

### 常见问题

1. **环境变量未加载**
   - 检查文件名是否正确（`.env.production`）
   - 确保没有前后空格
   - 重启应用程序

2. **API 调用失败**
   - 验证 API 密钥是否有效
   - 检查应用 ID 是否正确
   - 查看网络连接和防火墙设置

3. **权限错误**
   - 检查 `.env` 文件的读取权限
   - 确保运行应用的用户有访问权限

### 调试命令

```bash
# 检查环境变量是否已设置
echo $DASHSCOPE_API_KEY
echo $DASHSCOPE_APP_ID

# 在 Node.js 中检查
node -e "console.log(process.env.DASHSCOPE_API_KEY)"
```

## 示例环境变量文件

创建 `.env.example` 文件作为模板：
```bash
# DashScope API 配置
DASHSCOPE_API_KEY=your_dashscope_api_key_here
DASHSCOPE_APP_ID=your_dashscope_app_id_here

# 环境配置
NODE_ENV=production

# 可选配置
NEXT_PUBLIC_APP_NAME=RAG Web App
NEXT_PUBLIC_APP_VERSION=2.0.0
```

## 注意事项

1. **NEXT_PUBLIC_** 前缀的变量会暴露给客户端，不要用于敏感信息
2. 服务器端 API 路由中的环境变量（如 `DASHSCOPE_API_KEY`）只在服务器端可用，保持安全
3. 生产环境部署后，重新部署才能应用新的环境变量更改
