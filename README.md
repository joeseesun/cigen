# 词根词缀记忆工坊

用[`https://pdfresources.com/`](https://pdfresources.com/)搜索到了一个词根PDF,从而引发这个idea，从其中自动抽取词根词缀与例词，构建交互式记忆 Web App。

在线 Pages 地址:
[https://jesselau76.github.io/cigen/](https://jesselau76.github.io/cigen/)

## 功能

- 词根/词缀检索与浏览
- 词根详情页（例词 + 拆解 + 中文释义）
- 闪卡训练（显示答案 / 记住 / 再看）
- 选择题训练（本地记录正确率）
- 本地学习进度保存（`localStorage`）

## 目录

- `scripts/extract_pdf_data.py`: 从 PDF 生成结构化数据
- `data/roots_affixes.json`: 解析输出
- `index.html` + `styles.css` + `app.js`: 前端应用

## 使用方式

1. 重新生成数据（可选）:
   ```bash
   python3 scripts/extract_pdf_data.py
   ```
2. 启动静态服务:
   ```bash
   python3 -m http.server 8080
   ```
3. 打开浏览器访问:
   `http://localhost:8080`

## 部署

### Vercel 部署（推荐）

1. 安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 在项目根目录运行：
   ```bash
   vercel
   ```

3. 按照提示完成部署配置，项目会自动部署到 Vercel。

### GitHub Pages 部署

1. 新建 GitHub 仓库并推送代码（分支 `main`）。
2. 仓库 `Settings -> Pages -> Build and deployment`:
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main` / `root`
3. 等待 1-2 分钟即可通过上方 Pages 地址访问。



