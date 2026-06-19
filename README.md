# ma-small-journal

常熟麻将记分小网站。当前阶段是 **Vite + React + TypeScript** 的单机版记分器，适合先把本地牌桌记分体验做扎实，后续再接多人房间、云端存储和 AI 复盘。

## 技术栈

- Vite：开发服务器和生产构建
- React：组件化界面
- TypeScript：记分规则和数据结构类型约束
- localStorage：第一阶段本机浏览器保存数据

## 本地开发

第一次打开项目后先安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

本地预览生产包：

```bash
npm run preview
```

只做类型检查：

```bash
npm run typecheck
```

## 用 PyCharm 打开

可以直接用 PyCharm 打开项目根目录 `/Users/fan/Documents/code/ma-small-journal`。

建议流程：

1. 在 PyCharm 的 Terminal 里执行 `npm install`
2. 执行 `npm run dev`
3. 打开终端里显示的本地地址，例如 `http://localhost:5173`

## 数据保存逻辑

当前阶段没有后端，所有牌桌数据保存在当前浏览器的 `localStorage` 中。

- 刷新页面：数据仍然保留
- 关闭浏览器后再打开：通常仍然保留
- 点击页面“清空”：重置当前牌桌
- 清理浏览器网站数据：本地牌桌会消失
- 换电脑/换浏览器：不会自动同步

页面里的“导出/导入”可以临时备份一桌牌局 JSON。

## 当前功能

- 4 人玩家名设置
- 自摸、点炮、明杠、暗杠、手动调整
- 自动计算每位玩家总分
- 入账前实时预览每家分数变化
- 牌局记录和撤销上一局
- 分数走势图
- 本地复盘分析
- 规则分值设置
- 导出/导入牌桌数据

## 第一阶段边界

这一版是单机版，不做账号、不做多人实时同步、不接真实 AI API。

本地复盘是基于已记录牌局的规则分析，不会调用外部模型，也不会自动修改分数。

## 后续路线

- 补齐常熟麻将具体番型/结算规则
- 增加房间码和多人确认入账
- 增加云端保存
- 增加后端 AI 复盘接口
- 增加 GitHub Pages 或 Netlify 部署配置

## 推荐目录

```text
src/
├── App.tsx
├── main.tsx
├── styles.css
└── domain/
    ├── insights.ts
    ├── scoring.ts
    ├── storage.ts
    └── types.ts
```

