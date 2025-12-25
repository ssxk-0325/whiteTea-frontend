# 福鼎白茶服务平台 - 前端

## 项目简介
基于 Vue 3 + Vite 的福鼎白茶服务平台前端系统

## 技术栈
- Vue 3
- Vite 5
- Vue Router 4
- Vuex 4
- Element Plus
- Axios

## 项目结构
```
frontend/
├── index.html          # 入口 HTML 文件
├── vite.config.js      # Vite 配置文件
├── package.json
├── public/            # 静态资源
├── src/
│   ├── api/           # API接口
│   ├── components/    # 公共组件
│   ├── router/         # 路由配置
│   ├── store/          # 状态管理
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
└── README.md
```

## 安装依赖
```bash
npm install
```

## 启动项目
```bash
npm run dev
```

## 构建项目
```bash
npm run build
```

## 预览构建
```bash
npm run preview
```

## 功能模块
- 用户注册/登录
- 产品浏览和搜索
- 购物车管理
- 订单管理
- 个人中心
- 白茶文化
- 社区功能
- 管理后台

## 注意事项
- 默认端口：3000
- 后端API地址：http://localhost:8080/api
- 需要先启动后端服务
- 推荐使用 Node.js 18+ 版本

## Vite 优势
- ⚡ 极速的启动速度（秒级）
- 🔥 快速的热更新
- 📦 优化的生产构建
- 🎯 更好的开发体验
