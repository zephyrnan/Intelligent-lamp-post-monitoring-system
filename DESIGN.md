# Design System

## Style Direction

Vercel 极简风格，偏蓝色调。参考 Vercel Dashboard 的设计语言：纯白背景、极细边框、克制阴影、清晰的信息层级。

## Design Principles

1. **内容优先** — 去除一切装饰性渐变、毛玻璃、浮动动画，让数据本身成为焦点
2. **克制的交互反馈** — hover 仅变化边框颜色，不使用 translateY/scale 变形
3. **一致的间距系统** — 使用 CSS 变量 `--space-*` 和 `--radius-*` 保持全局一致
4. **扁平化色彩** — 状态色使用低透明度平涂，不使用渐变背景

## Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--primary-color` | `#0070f3` | 主按钮、链接、活跃态 |
| `--primary-color-light` | `#3291ff` | hover 态 |
| `--primary-color-lighter` | `#e8f4ff` | 选中背景、tag 底色 |
| `--success-color` | `#50e3c2` | 正常状态 |
| `--warning-color` | `#f5a623` | 警告状态 |
| `--error-color` | `#ee0000` | 错误/严重告警 |
| `--bg-primary` | `#ffffff` | 卡片、面板背景 |
| `--bg-secondary` | `#fafafa` | 页面背景、输入框 |
| `--bg-tertiary` | `#f5f5f5` | 次级背景 |
| `--text-primary` | `#111111` | 标题、正文 |
| `--text-secondary` | `#666666` | 描述文字 |
| `--text-tertiary` | `#888888` | 辅助信息 |
| `--border-light` | `#eaeaea` | 默认边框 |
| `--border-medium` | `#d9d9d9` | hover 边框 |

## Typography

- 字体：`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif`
- 基础字号：14px（移动端 13px）
- 标题：font-weight 600
- 正文：font-weight 400

## Components

- 卡片：纯白背景 + 1px 边框，无阴影，hover 变边框色
- 按钮：实色背景，圆角 6px
- 输入框：`--bg-secondary` 背景，1px 边框
- 表格：无外框阴影，行 hover 使用 `--bg-hover`
- Tag：低透明度平涂底色 + 语义色文字

## Do / Don't

- Do: 使用 CSS 变量控制所有颜色和间距
- Do: 保持 1px 边框作为主要分隔手段
- Don't: 使用 backdrop-filter / 毛玻璃效果
- Don't: 使用装饰性 ::before 渐变叠加层
- Don't: 使用 translateY/scale 作为 hover 反馈
- Don't: 在卡片/面板上使用 box-shadow
