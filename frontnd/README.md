# 网络协议栈可视化教学平台 - 前端

基于 React + TypeScript + Vite + D3.js 构建的网络协议栈可视化教学平台前端项目。

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: Zustand
- **数据可视化**: D3.js
- **HTTP客户端**: Axios
- **代码规范**: ESLint + Prettier

## 项目结构

```
network-protocol-viz/
├── public/                 # 静态资源
├── src/
│   ├── assets/             # 资源文件
│   ├── components/         # 组件目录
│   │   ├── ProtocolStack/  # 协议栈可视化组件
│   │   ├── PacketFlow/     # 数据包流动画组件
│   │   ├── DeviceIcons/    # 设备图标组件
│   │   ├── ConfigPanel/    # 配置面板组件
│   │   ├── PacketCapture/  # 抓包组件
│   │   └── common/        # 通用组件
│   ├── pages/             # 页面组件
│   │   ├── Home/          # 首页
│   │   ├── Experiment/     # 实验页面
│   │   ├── Login/         # 登录页面
│   │   └── Register/      # 注册页面
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── services/          # API服务
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript类型定义
│   ├── constants/         # 常量定义
│   ├── hooks/             # 自定义Hooks
│   ├── App.tsx            # 根组件
│   ├── main.tsx           # 入口文件
│   ├── index.css          # 全局样式
│   └── App.css           # 应用样式
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 开始使用

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:5173 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 功能特性

### 已实现
- ✅ 项目基础架构搭建
- ✅ 路由配置（首页、实验页、登录、注册）
- ✅ 响应式布局
- ✅ 基础UI组件
- ✅ TypeScript类型定义
- ✅ CSS样式系统

### 待实现
- ⏳ 协议栈可视化组件
- ⏳ 数据包流动画
- ⏳ 设备图标和状态显示
- ⏳ 实验配置面板
- ⏳ 抓包模块
- ⏳ 网络故障模拟
- ⏳ 用户认证系统
- ⏳ 后端API集成

## 开发规范

### 代码风格
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用函数式组件 + Hooks

### 命名规范
- 组件文件：PascalCase（如 `ProtocolStack.tsx`）
- 工具函数：camelCase（如 `formatDate.ts`）
- 常量：UPPER_SNAKE_CASE（如 `API_CONFIG`）
- 类型：PascalCase（如 `Packet`）

### Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 开发计划

### 阶段 1：基础架构 ✅
- [x] 项目搭建
- [x] 路由配置
- [x] 基础页面
- [x] 样式系统

### 阶段 2：核心功能开发
- [ ] 协议栈可视化
- [ ] 数据包流动画
- [ ] 设备图标组件
- [ ] 配置面板

### 阶段 3：高级功能
- [ ] 抓包模块
- [ ] 故障模拟
- [ ] 用户认证
- [ ] API集成

### 阶段 4：优化和部署
- [ ] 性能优化
- [ ] 测试覆盖
- [ ] 文档完善
- [ ] 生产部署

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request
