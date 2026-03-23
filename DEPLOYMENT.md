# 网络协议栈可视化教学平台 - 部署和测试指�?

## 目录

1. [系统要求](#系统要求)
2. [后端部署](#后端部署)
3. [前端部署](#前端部署)
4. [前后端联调测试](#前后端联调测�?
5. [常见问题](#常见问题)

---

## 系统要求

### 软件要求

- **Node.js**: >= 18.0.0
- **Python**: >= 3.9
- **MongoDB**: >= 4.4
- **npm**: >= 8.0.0

### 硬件要求

- **CPU**: 双核及以�?
- **内存**: 4GB及以�?
- **磁盘**: 10GB可用空间

---

## 后端部署

### 1. 安装MongoDB

#### Windows

```bash
# 下载MongoDB Community Server
# https://www.mongodb.com/try/download/community

# 安装后启动MongoDB服务
net start MongoDB
```

#### Linux (Ubuntu/Debian)

```bash
# 导入MongoDB公钥
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# 添加MongoDB仓库
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# 更新包列�?
sudo apt-get update

# 安装MongoDB
sudo apt-get install -y mongodb-org

# 启动MongoDB服务
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### macOS

```bash
# 使用Homebrew安装
brew tap mongodb/brew
brew install mongodb-community

# 启动MongoDB服务
brew services start mongodb-community
```

### 2. 安装Python依赖

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环�?
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑.env文件，修改以下配�?
```

编辑`.env`文件�?

```env
# Flask配置
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production

# MongoDB配置
MONGO_URI=mongodb://localhost:27017/network_protocol_viz

# CORS配置
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# 协议栈模拟配�?
SIMULATION_DELAY=100
MAX_PACKETS=1000

# 数据包捕获配�?
CAPTURE_INTERFACE=eth0
CAPTURE_TIMEOUT=30

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=app.log
```

### 4. 启动后端服务

#### 开发模�?

```bash
python app.py
```

服务将在 `http://localhost:5000` 启动�?

#### 生产模式

```bash
# 安装Gunicorn
pip install gunicorn

# 启动服务
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 5. 验证后端服务

```bash
# 测试健康检�?
curl http://localhost:5000/health

# 测试API信息
curl http://localhost:5000/api
```

---

## 前端部署

### 1. 安装Node.js依赖

```bash
cd frontnd

# 安装依赖
npm install
```

### 2. 配置API地址

编辑 `src/constants/index.ts` 文件，修改API配置�?

```typescript
// API配置
export const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',  // 修改为后端地址
    TIMEOUT: 10000,
    RETRY_COUNT: 3
} as const;
```

### 3. 启动前端服务

#### 开发模�?

```bash
npm run dev
```

服务将在 `http://localhost:5173` 启动�?

#### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 4. 验证前端服务

在浏览器中访�?`http://localhost:5173`，应该能看到应用界面�?

---

## 前后端联调测�?

### 1. 运行API测试脚本

```bash
cd backend

# 确保后端服务正在运行
# 然后运行测试脚本
python test_api.py
```

测试脚本将自动执行以下测试：

- �?健康检�?
- �?用户注册
- �?用户登录
- �?创建实验
- �?获取实验列表
- �?启动实验
- �?获取协议栈状�?
- �?发送数据包
- �?获取数据包列�?
- �?启用故障模拟
- �?获取故障模拟列表
- �?获取实验指标
- �?停止实验

### 2. 手动测试流程

#### 步骤1: 用户注册

1. 访问 `http://localhost:5173/register`
2. 填写注册表单�?
   - 用户�? `testuser`
   - 邮箱: `test@example.com`
   - 密码: `password123`
3. 点击"注册"按钮
4. 注册成功后自动跳转到登录页面

#### 步骤2: 用户登录

1. 在登录页面输入：
   - 用户�? `testuser`
   - 密码: `password123`
2. 点击"登录"按钮
3. 登录成功后跳转到首页

#### 步骤3: 创建实验

1. 在首页点�?开始实�?或选择预设实验
2. 填写实验配置�?
   - 实验名称: `TCP三次握手测试`
   - 源IP: `192.168.1.1`
   - 目标IP: `192.168.1.2`
   - 协议: `TCP`
3. 点击"创建实验"按钮

#### 步骤4: 运行实验

1. 在实验页面点�?开始实�?按钮
2. 观察协议栈可视化
3. 点击"发送数据包"按钮
4. 查看数据包流动画
5. 检查抓包数�?

#### 步骤5: 测试故障模拟

1. 在配置面板中选择故障类型（如"数据包丢�?�?
2. 设置故障参数（如丢包�? 10%�?
3. 启用故障模拟
4. 发送数据包观察故障效果
5. 查看实验指标变化

#### 步骤6: 导出数据

1. 在抓包模块点�?导出"按钮
2. 选择导出格式（JSON/CSV/PCAP�?
3. 下载导出文件

### 3. 浏览器开发者工具测�?

打开浏览器开发者工具（F12），检查：

#### Network标签

- 查看API请求是否成功
- 检查请求头是否包含Authorization
- 验证响应数据格式

#### Console标签

- 查看是否有JavaScript错误
- 检查API调用日志
- 验证数据渲染

#### Application标签

- 检查localStorage中的token
- 验证用户信息存储

### 4. API端点测试

使用curl或Postman测试各个API端点�?

```bash
# 1. 健康检�?
curl http://localhost:5000/health

# 2. 用户注册
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# 3. 用户登录
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'

# 4. 创建实验（需要token�?
curl -X POST http://localhost:5000/api/experiments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"测试实验","parameters":{"source_ip":"192.168.1.1","destination_ip":"192.168.1.2","protocol":"tcp"}}'

# 5. 启动实验
curl -X POST http://localhost:5000/api/experiments/EXPERIMENT_ID/start \
  -H "Authorization: Bearer YOUR_TOKEN"

# 6. 发送数据包
curl -X POST http://localhost:5000/api/protocol/stack/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"experiment_id":"EXPERIMENT_ID","payload":"测试数据"}'

# 7. 获取数据包列�?
curl http://localhost:5000/api/packets?experiment_id=EXPERIMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 常见问题

### 1. MongoDB连接失败

**问题**: `MongoDB连接失败`

**解决方案**:

```bash
# 检查MongoDB服务状�?
# Windows:
sc query MongoDB

# Linux:
sudo systemctl status mongod

# macOS:
brew services list

# 启动MongoDB服务
# Windows:
net start MongoDB

# Linux:
sudo systemctl start mongod

# macOS:
brew services start mongodb-community
```

### 2. 端口被占�?

**问题**: `Address already in use`

**解决方案**:

```bash
# 查找占用端口的进�?
# Windows:
netstat -ano | findstr :5000

# Linux/macOS:
lsof -i :5000

# 终止进程
# Windows:
taskkill /PID <PID> /F

# Linux/macOS:
kill -9 <PID>

# 或修改端口号
# 后端: 修改app.py中的port参数
# 前端: 修改vite.config.ts中的server.port
```

### 3. CORS错误

**问题**: `Access to XMLHttpRequest blocked by CORS policy`

**解决方案**:

1. 检查后端CORS配置
2. 确保前端地址在CORS_ORIGINS�?
3. 检查浏览器控制台的具体错误信息

### 4. JWT令牌过期

**问题**: `令牌已过期`

**解决方案**:

1. 前端应该自动刷新令牌
2. 如果失败，清除localStorage并重新登�?
3. 检查JWT_ACCESS_TOKEN_EXPIRES配置

### 5. 前端构建失败

**问题**: `npm run build` 失败

**解决方案**:

```bash
# 清除缓存
rm -rf node_modules
rm package-lock.json

# 重新安装依赖
npm install

# 检查TypeScript错误
npm run type-check

# 修复错误后重新构�?
npm run build
```

### 6. 后端依赖安装失败

**问题**: `pip install` 失败

**解决方案**:

```bash
# 升级pip
python -m pip install --upgrade pip

# 使用国内镜像�?
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 或使用虚拟环�?
python -m venv venv
source venv/bin/activate  # Linux/macOS
# �?
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 7. 数据包动画不显示

**问题**: 数据包流动画不显�?

**解决方案**:

1. 检查浏览器是否支持Canvas
2. 查看控制台是否有JavaScript错误
3. 确认实验已启�?
4. 检查数据包数据是否正确返回

### 8. 实验无法启动

**问题**: 点击"开始实�?没有反应

**解决方案**:

1. 检查后端日�?
2. 确认用户已登�?
3. 验证实验ID是否正确
4. 检查网络连�?

---

## 性能优化建议

### 后端优化

1. **数据库索�?*: 确保所有查询字段都有索�?
2. **连接�?*: 使用连接池管理MongoDB连接
3. **缓存**: 对频繁访问的数据使用Redis缓存
4. **异步处理**: 使用Celery处理耗时任务
5. **日志级别**: 生产环境使用WARNING或ERROR级别

### 前端优化

1. **代码分割**: 使用React.lazy和Suspense
2. **图片优化**: 压缩和懒加载图片
3. **缓存策略**: 合理使用浏览器缓�?
4. **打包优化**: 使用webpack-bundle-analyzer分析
5. **CDN**: 静态资源使用CDN加�?

---

## 生产环境部署

### 使用Docker部署

#### 后端Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

#### 前端Dockerfile

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=network_protocol_viz

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/network_protocol_viz
      - FLASK_ENV=production
    depends_on:
      - mongodb
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontnd
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

启动服务�?

```bash
docker-compose up -d
```

---

## 监控和日�?

### 后端日志

```bash
# 查看实时日志
tail -f backend/app.log

# 查看错误日志
grep ERROR backend/app.log

# 查看最�?00行日�?
tail -n 100 backend/app.log
```

### 前端日志

在浏览器控制台中查看�?
- Console: JavaScript错误和警�?
- Network: API请求和响�?
- Performance: 性能指标

---

## 备份和恢�?

### MongoDB备份

```bash
# 备份
mongodump --db network_protocol_viz --out backup/

# 恢复
mongorestore --db network_protocol_viz backup/network_protocol_viz/
```

### 配置文件备份

```bash
# 备份环境变量
cp backend/.env backend/.env.backup

# 备份前端配置
cp frontnd/src/constants/index.ts frontnd/src/constants/index.ts.backup
```

---

## 安全建议

1. **修改默认密钥**: 生产环境必须修改SECRET_KEY和JWT_SECRET_KEY
2. **启用HTTPS**: 使用SSL/TLS加密通信
3. **输入验证**: 严格验证所有用户输�?
4. **SQL注入防护**: 使用参数化查�?
5. **XSS防护**: 对用户输出进行转�?
6. **CSRF防护**: 使用CSRF令牌
7. **速率限制**: 防止暴力攻击
8. **定期更新**: 及时更新依赖�?

---

## 联系支持

如有问题，请联系�?
- 技术支�? support@example.com
- 文档: https://docs.example.com
- GitHub Issues: https://github.com/example/network-protocol-viz/issues
