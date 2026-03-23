# 网络协议栈可视化教学平台 - 后端服务

基于Flask和MongoDB的后端API服务，提供网络协议栈模拟、数据包生成、故障模拟等功能。

## 技术栈

- **框架**: Flask 3.0.0
- **数据库**: MongoDB
- **认证**: Flask-JWT-Extended
- **跨域**: Flask-CORS
- **密码加密**: bcrypt
- **数据验证**: Pydantic

## 项目结构

```
backend/
├── app.py                  # Flask应用入口
├── config.py               # 配置文件
├── database.py             # 数据库连接管理
├── auth.py                 # 认证和授权
├── requirements.txt        # Python依赖
├── .env.example           # 环境变量示例
├── models/
│   ├── __init__.py
│   └── schemas.py         # 数据模型定义
├── routes/
│   ├── __init__.py
│   ├── auth.py            # 认证路由
│   ├── experiments.py     # 实验路由
│   ├── packets.py         # 数据包路由
│   └── protocol.py        # 协议栈路由
└── simulation/
    ├── __init__.py
    ├── protocol_stack.py  # 协议栈模拟器
    └── fault_simulator.py # 故障模拟器
```

## 安装步骤

### 1. 安装Python依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 安装MongoDB

确保已安装并启动MongoDB服务：

```bash
# Windows
# 下载并安装MongoDB Community Server
# 启动MongoDB服务

# Linux
sudo apt-get install mongodb
sudo systemctl start mongodb

# macOS
brew install mongodb-community
brew services start mongodb-community
```

### 3. 配置环境变量

复制环境变量示例文件并修改配置：

```bash
cp .env.example .env
```

编辑`.env`文件，修改以下配置：

```env
# Flask配置
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production

# MongoDB配置
MONGO_URI=mongodb://localhost:27017/network_protocol_viz

# CORS配置
CORS_ORIGINS=http://localhost:5173
```

## 运行服务

### 开发模式

```bash
python app.py
```

服务将在 `http://localhost:5000` 启动。

### 生产模式

使用Gunicorn运行：

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API文档

### 基础信息

- **基础URL**: `http://localhost:5000`
- **认证方式**: JWT Bearer Token

### 主要端点

#### 认证相关 (`/api/auth`)

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新令牌
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

#### 实验相关 (`/api/experiments`)

- `POST /api/experiments` - 创建实验
- `GET /api/experiments` - 获取实验列表
- `GET /api/experiments/<id>` - 获取实验详情
- `PUT /api/experiments/<id>` - 更新实验
- `DELETE /api/experiments/<id>` - 删除实验
- `POST /api/experiments/<id>/start` - 启动实验
- `POST /api/experiments/<id>/stop` - 停止实验
- `POST /api/experiments/<id>/reset` - 重置实验
- `GET /api/experiments/<id>/metrics` - 获取实验指标

#### 数据包相关 (`/api/packets`)

- `POST /api/packets` - 创建数据包
- `GET /api/packets` - 获取数据包列表
- `GET /api/packets/<id>` - 获取数据包详情
- `PUT /api/packets/<id>` - 更新数据包
- `POST /api/packets/export` - 导出数据包

#### 协议栈相关 (`/api/protocol`)

- `GET /api/protocol/stack/status` - 获取协议栈状态
- `POST /api/protocol/stack/send` - 发送数据包
- `POST /api/protocol/faults` - 启用故障模拟
- `DELETE /api/protocol/faults/<type>` - 禁用故障模拟
- `GET /api/protocol/faults` - 获取故障模拟列表

### 健康检查

- `GET /` - API信息
- `GET /health` - 健康检查
- `GET /api` - API端点列表

## 数据模型

### 用户 (User)

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "created_at": "datetime",
  "is_active": "boolean"
}
```

### 实验 (Experiment)

```json
{
  "id": "string",
  "user_id": "string",
  "name": "string",
  "description": "string",
  "parameters": {
    "source_ip": "string",
    "destination_ip": "string",
    "protocol": "string",
    "config": {
      "port": "number",
      "mtu": "number",
      "window_size": "number",
      "timeout": "number"
    }
  },
  "status": "string",
  "created_at": "datetime"
}
```

### 数据包 (Packet)

```json
{
  "id": "string",
  "experiment_id": "string",
  "sequence_number": "number",
  "timestamp": "datetime",
  "source_ip": "string",
  "destination_ip": "string",
  "protocol": "string",
  "size": "number",
  "status": "string",
  "layers": [
    {
      "layer": "string",
      "protocol": "string",
      "headers": "object",
      "payload": "string"
    }
  ]
}
```

## 功能特性

### 1. 用户认证系统
- 用户注册和登录
- JWT令牌认证
- 令牌刷新机制
- 密码加密存储

### 2. 实验管理
- 创建、更新、删除实验
- 实验状态管理（创建、运行、暂停、完成）
- 实验参数配置
- 实验指标统计

### 3. 协议栈模拟
- 五层协议栈模拟（应用层、传输层、网络层、数据链路层、物理层）
- 多种协议支持（HTTP、TCP、UDP、IP、Ethernet等）
- 数据包生成和传输
- 实时状态监控

### 4. 故障模拟
- 数据包丢失
- 网络延迟
- 数据包乱序
- 数据损坏
- 连接中断

### 5. 数据包管理
- 数据包创建和查询
- 数据包详情展示
- 多种过滤条件
- 数据包导出（JSON、CSV、PCAP）

## 开发指南

### 添加新的API端点

1. 在`routes/`目录下创建新的路由文件
2. 在`app.py`中注册蓝图
3. 在`models/schemas.py`中定义数据模型
4. 实现业务逻辑

### 数据库操作

使用`database.db`实例进行数据库操作：

```python
from database import db

# 获取集合
collection = db.get_collection('collection_name')

# 插入文档
result = collection.insert_one(document)

# 查询文档
documents = collection.find(query)

# 更新文档
collection.update_one(filter, update)

# 删除文档
collection.delete_one(filter)
```

### 认证保护

使用装饰器保护需要认证的路由：

```python
from flask_jwt_extended import jwt_required
from auth import token_required

@jwt_required()
def protected_route():
    # 需要认证的路由
    pass

@token_required
def custom_protected_route():
    # 自定义认证保护
    pass
```

## 测试

### 运行测试

```bash
# 安装测试依赖
pip install pytest pytest-flask

# 运行测试
pytest tests/
```

### API测试示例

使用curl测试API：

```bash
# 注册用户
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# 登录
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'

# 创建实验（需要令牌）
curl -X POST http://localhost:5000/api/experiments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"测试实验","parameters":{"source_ip":"192.168.1.1","destination_ip":"192.168.1.2","protocol":"tcp"}}'
```

## 部署

### Docker部署

创建`Dockerfile`：

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

构建和运行：

```bash
docker build -t network-protocol-backend .
docker run -p 5000:5000 network-protocol-backend
```

### Docker Compose

使用Docker Compose同时运行MongoDB和后端服务：

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/network_protocol_viz
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

运行：

```bash
docker-compose up -d
```

## 故障排除

### MongoDB连接失败

确保MongoDB服务正在运行：

```bash
# 检查MongoDB状态
sudo systemctl status mongodb

# 启动MongoDB
sudo systemctl start mongodb
```

### 端口被占用

修改`app.py`中的端口号：

```python
app.run(host='0.0.0.0', port=8000, debug=True)
```

### 依赖安装失败

使用虚拟环境：

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# 或
venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

## 许可证

MIT License

## 联系方式

如有问题，请联系开发团队。
