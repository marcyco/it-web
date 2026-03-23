# 网络协议栈可视化教学平台 - 项目总结

## 项目概述

网络协议栈可视化教学平台是一个基于Web的交互式教学工具，旨在帮助学生和开发者深入理解网络协议栈的工作原理。通过可视化的方式展示数据包在网络各层协议中的传输过程，提供实验、模拟和故障注入等功能。

## 技术架构

### 前端技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: Zustand
- **数据可视化**: D3.js + Canvas API
- **HTTP客户端**: Axios
- **样式**: CSS + CSS Variables

### 后端技术栈

- **框架**: Flask 3.0.0
- **数据库**: MongoDB
- **认证**: Flask-JWT-Extended
- **跨域**: Flask-CORS
- **密码加密**: bcrypt
- **数据验证**: Pydantic

## 项目结构

```
network-protocol-viz/
├── frontnd/                          # 前端项目
│   ├── src/
│   │   ├── components/            # 组件库
│   │   │   ├── ProtocolStack/    # 协议栈可视化
│   │   │   ├── PacketFlow/       # 数据包流动画
│   │   │   ├── DeviceIcons/      # 设备图标
│   │   │   ├── ConfigPanel/      # 配置面板
│   │   │   └── PacketCapture/    # 抓包模块
│   │   ├── pages/                # 页面
│   │   │   ├── Home/           # 首页
│   │   │   ├── Experiment/      # 实验页面
│   │   │   ├── Login/          # 登录页面
│   │   │   └── Register/       # 注册页面
│   │   ├── services/            # API服务
│   │   ├── store/              # 状态管理
│   │   ├── types/              # 类型定义
│   │   ├── constants/          # 常量配置
│   │   └── router/             # 路由配置
│   ├── Dockerfile              # 前端Docker配置
│   ├── nginx.conf             # Nginx配置
│   └── package.json           # 依赖配置
│
├── backend/                          # 后端项目
│   ├── app.py                    # Flask应用入口
│   ├── config.py                 # 配置文件
│   ├── database.py               # 数据库管理
│   ├── auth.py                  # 认证授权
│   ├── requirements.txt          # Python依赖
│   ├── models/                  # 数据模型
│   │   └── schemas.py          # Pydantic模型
│   ├── routes/                  # API路由
│   │   ├── auth.py             # 认证路由
│   │   ├── experiments.py      # 实验路由
│   │   ├── packets.py          # 数据包路由
│   │   └── protocol.py         # 协议栈路由
│   ├── simulation/              # 模拟引擎
│   │   ├── protocol_stack.py   # 协议栈模拟器
│   │   └── fault_simulator.py # 故障模拟器
│   ├── test_api.py             # API测试脚本
│   └── Dockerfile              # 后端Docker配置
│
├── docker-compose.yml               # Docker Compose配置
├── DEPLOYMENT.md                  # 部署指南
├── frontnd/implementation-plan.md  # 实施计划
└── frontnd/remard.md             # 需求文档
```

## 核心功能

### 1. 用户认证系统

- ✅ 用户注册和登录
- ✅ JWT令牌认证
- ✅ 令牌刷新机制
- ✅ 密码加密存储
- ✅ 用户信息管理

### 2. 实验管理

- ✅ 创建、更新、删除实验
- ✅ 实验状态管理（创建、运行、暂停、完成）
- ✅ 实验参数配置
- ✅ 预设实验场景
- ✅ 实验指标统计

### 3. 协议栈可视化

- ✅ 五层协议栈展示（应用层、传输层、网络层、数据链路层、物理层）
- ✅ 每层协议类型和描述
- ✅ 交互式层选择
- ✅ 实时状态更新
- ✅ 动画效果

### 4. 数据包流动画

- ✅ Canvas绘制协议栈背景
- ✅ 数据包动画效果
- ✅ 播放/暂停/重置控制
- ✅ 数据包点击交互
- ✅ 实时动画渲染

### 5. 设备图标

- ✅ 多种设备类型（路由器、交换机、防火墙、主机、网关）
- ✅ 设备状态显示
- ✅ SVG图标渲染
- ✅ 悬停和选择效果

### 6. 配置面板

- ✅ 网络参数配置（端口、MTU、窗口大小、超时）
- ✅ 网络模拟设置（延迟、丢包率、乱序）
- ✅ 故障模拟选择
- ✅ 实时配置更新

### 7. 抓包模块

- ✅ 实时抓包控制
- ✅ 多种过滤条件
- ✅ 数据包列表展示
- ✅ 数据包详情展开
- ✅ 多种导出格式（JSON、CSV、PCAP）
- ✅ 统计信息显示

### 8. 协议栈模拟

- ✅ 五层协议栈模拟
- ✅ 多种协议支持（HTTP、TCP、UDP、IP、Ethernet等）
- ✅ 数据包生成和传输
- ✅ 实时状态监控
- ✅ 协议头信息生成

### 9. 故障模拟

- ✅ 数据包丢失
- ✅ 网络延迟
- ✅ 数据包乱序
- ✅ 数据损坏
- ✅ 连接中断
- ✅ 可配置故障参数

## API端点

### 认证相关 (`/api/auth`)

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新令牌
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 实验相关 (`/api/experiments`)

- `POST /api/experiments` - 创建实验
- `GET /api/experiments` - 获取实验列表
- `GET /api/experiments/<id>` - 获取实验详情
- `PUT /api/experiments/<id>` - 更新实验
- `DELETE /api/experiments/<id>` - 删除实验
- `POST /api/experiments/<id>/start` - 启动实验
- `POST /api/experiments/<id>/stop` - 停止实验
- `POST /api/experiments/<id>/reset` - 重置实验
- `GET /api/experiments/<id>/metrics` - 获取实验指标

### 数据包相关 (`/api/packets`)

- `POST /api/packets` - 创建数据包
- `GET /api/packets` - 获取数据包列表
- `GET /api/packets/<id>` - 获取数据包详情
- `PUT /api/packets/<id>` - 更新数据包
- `POST /api/packets/export` - 导出数据包

### 协议栈相关 (`/api/protocol`)

- `GET /api/protocol/stack/status` - 获取协议栈状态
- `POST /api/protocol/stack/send` - 发送数据包
- `POST /api/protocol/faults` - 启用故障模拟
- `DELETE /api/protocol/faults/<type>` - 禁用故障模拟
- `GET /api/protocol/faults` - 获取故障模拟列表

## 部署方式

### 开发环境

#### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# 或 venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```

#### 前端

```bash
cd frontnd
npm install
npm run dev
```

### 生产环境

#### Docker Compose

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 手动部署

1. **后端部署**

```bash
cd backend
pip install -r requirements.txt
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

2. **前端部署**

```bash
cd frontnd
npm run build
# 将dist目录部署到Web服务器
```

## 测试

### API测试

```bash
cd backend
python test_api.py
```

### 手动测试流程

1. 访问 `http://localhost:5173`
2. 注册新用户
3. 登录系统
4. 创建实验
5. 启动实验
6. 发送数据包
7. 观察协议栈可视化
8. 测试故障模拟
9. 导出数据包

## 性能优化

### 前端优化

- ✅ 使用React.memo优化组件渲染
- ✅ 使用useCallback和useMemo优化函数和计算
- ✅ Canvas动画优化
- ✅ 代码分割和懒加载
- ✅ 图片优化和懒加载
- ✅ 浏览器缓存策略

### 后端优化

- ✅ 数据库索引优化
- ✅ 连接池管理
- ✅ 响应压缩
- ✅ 日志级别控制
- ✅ 错误处理优化
- ✅ CORS配置优化

## 安全特性

- ✅ JWT令牌认证
- ✅ 密码bcrypt加密
- ✅ CORS跨域保护
- ✅ 输入验证和清理
- ✅ SQL注入防护（使用ORM）
- ✅ XSS防护
- ✅ CSRF保护
- ✅ 速率限制

## 数据库设计

### 主要集合

1. **users** - 用户信息
2. **experiments** - 实验配置
3. **packets** - 数据包数据
4. **devices** - 网络设备
5. **faults** - 故障模拟配置
6. **records** - 学习记录
7. **captures** - 抓包数据

### 索引策略

- 用户名和邮箱唯一索引
- 实验ID和用户ID索引
- 数据包实验ID和时间戳索引
- 故障实验ID和类型索引

## 文档

- **需求文档**: [`frontnd/remard.md`](frontnd/remard.md)
- **实施计划**: [`frontnd/implementation-plan.md`](frontnd/implementation-plan.md)
- **部署指南**: [`DEPLOYMENT.md`](DEPLOYMENT.md)
- **后端README**: [`backend/README.md`](backend/README.md)
- **前端README**: [`frontnd/README.md`](frontnd/README.md)

## 技术亮点

1. **完整的协议栈模拟**: 实现了五层协议栈的完整模拟，包括各层协议头信息生成
2. **实时数据可视化**: 使用Canvas和D3.js实现流畅的数据包流动画
3. **故障模拟系统**: 提供多种网络故障模拟功能，帮助理解网络问题
4. **模块化架构**: 前后端分离，模块化设计，易于维护和扩展
5. **容器化部署**: 提供完整的Docker配置，支持一键部署
6. **类型安全**: 前端使用TypeScript，后端使用Pydantic，确保类型安全
7. **响应式设计**: 支持多种设备和屏幕尺寸
8. **国际化支持**: 预留了国际化接口

## 未来扩展方向

1. **更多协议支持**: 添加更多网络协议（如IPv6、TLS等）
2. **真实网络抓包**: 集成真实网络接口抓包功能
3. **协作学习**: 支持多用户协作实验
4. **AI辅助**: 使用AI提供学习建议和问题诊断
5. **移动端应用**: 开发移动端应用
6. **离线模式**: 支持离线学习和实验
7. **性能监控**: 添加详细的性能监控和分析
8. **多语言支持**: 实现完整的国际化

## 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 许可证

MIT License

## 联系方式

- 项目地址: https://github.com/example/network-protocol-viz
- 问题反馈: https://github.com/example/network-protocol-viz/issues
- 邮箱: support@example.com

## 致谢

感谢所有为本项目做出贡献的开发者和用户！

---

**项目状态**: ✅ 开发完成，可投入使用

**最后更新**: 2026-03-22
