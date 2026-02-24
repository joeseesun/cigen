# 词根词缀记忆工坊

基于 `XDF________.pdf` 自动抽取词根词缀与例词，构建交互式记忆 Web App。

在线 Pages 地址（发布后可用）:
`https://<github-username>.github.io/<repo-name>/`

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

## 发布到 GitHub Pages

1. 新建 GitHub 仓库并推送代码（分支 `main`）。
2. 仓库 `Settings -> Pages -> Build and deployment`:
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main` / `root`
3. 等待 1-2 分钟即可通过上方 Pages 地址访问。

## 说明

- 解析来自 OCR PDF，个别词条可能有噪音，可在后续迭代增加人工校对或词表白名单。
- 如果 PDF 存在版权风险，可只公开 `data/roots_affixes.json` 与前端代码，不上传原始 PDF。
