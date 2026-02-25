# 词根词缀记忆工坊

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/joeseesun/cigen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/joeseesun/cigen?style=social)](https://github.com/joeseesun/cigen/stargazers)

**一键部署你自己的词根词缀记忆工坊 👆**

</div>

---

用[`https://pdfresources.com/`](https://pdfresources.com/)搜索到了一个词根PDF,从而引发这个idea，从其中自动抽取词根词缀与例词，构建交互式记忆 Web App。

## 🚀 在线体验

- **Vercel 部署**: [Coming Soon]
- **GitHub Pages**: [https://jesselau76.github.io/cigen/](https://jesselau76.github.io/cigen/)

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 🔍 **智能检索** | 支持词根、词缀、中文含义多维度搜索 |
| 📖 **词根详情** | 展示例词、拆解规则、中文释义 |
| 🎴 **闪卡训练** | 科学记忆法，支持"显示答案"、"记住"、"再看" |
| 📝 **选择题练习** | 自动生成选择题，本地记录正确率 |
| 💾 **进度保存** | 使用 localStorage 本地保存学习进度 |
| 🎲 **随机词根** | 一键随机学习，让背单词不枯燥 |

## 🛠️ 技术栈

- **前端**: 原生 HTML + CSS + JavaScript（零依赖）
- **数据提取**: Python 3 + PyMuPDF
- **部署**: Vercel / GitHub Pages
- **存储**: localStorage（本地进度）

---

## 📂 项目结构

```
cigen/
├── index.html              # 主页面
├── styles.css              # 样式文件
├── app.js                  # 应用逻辑
├── data/
│   └── roots_affixes.json  # 词根词缀数据
├── scripts/
│   └── extract_pdf_data.py # PDF 数据提取脚本
└── vercel.json             # Vercel 部署配置
```

## 💻 本地开发

### 1. 克隆项目

```bash
git clone https://github.com/joeseesun/cigen.git
cd cigen
```

### 2. 启动本地服务器

**使用 Python**：
```bash
python3 -m http.server 8080
```

**使用 Node.js** (需先安装 `http-server`):
```bash
npm i -g http-server
http-server -p 8080
```

**使用 VS Code**：安装 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 插件，右键 `index.html` → `Open with Live Server`

### 3. 访问应用

打开浏览器访问: `http://localhost:8080`

---

### 🔧 重新生成数据（可选）

如果需要从新的 PDF 提取数据：

```bash
# 确保已安装 PyMuPDF
pip3 install PyMuPDF

# 运行提取脚本
python3 scripts/extract_pdf_data.py
```

## 🚀 部署

### 方式一：一键部署到 Vercel（推荐）

点击页面顶部的 **"Deploy with Vercel"** 按钮，或点击下方链接：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/joeseesun/cigen)

**优势**：
- ✅ 零配置，30秒完成部署
- ✅ 全球 CDN 加速，访问更快
- ✅ 自动 HTTPS，安全可靠
- ✅ 每次 Push 自动重新部署

---

### 方式二：使用 Vercel CLI 部署

1. **安装 Vercel CLI**：
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**：
   ```bash
   vercel login
   ```

3. **部署到生产环境**：
   ```bash
   vercel --prod
   ```

---

### 方式三：GitHub Pages 部署

1. Fork 本仓库到你的 GitHub 账号
2. 进入仓库 `Settings → Pages → Build and deployment`
3. 选择 `Deploy from a branch`，分支选择 `main` / `root`
4. 等待 1-2 分钟，通过 `https://你的用户名.github.io/cigen/` 访问

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献方式

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 License

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 📱 关注作者

如果这个项目对你有帮助，欢迎关注我获取更多技术分享：

- **X (Twitter)**: [@vista8](https://x.com/vista8)
- **微信公众号「向阳乔木推荐看」**:

<p align="center">
  <img src="https://github.com/joeseesun/terminal-boost/raw/main/assets/wechat-qr.jpg?raw=true" alt="向阳乔木推荐看公众号二维码" width="300">
</p>

---

## ⭐ Star History

如果觉得项目不错，请给个 Star ⭐️ 支持一下！

[![Star History Chart](https://api.star-history.com/svg?repos=joeseesun/cigen&type=Date)](https://star-history.com/#joeseesun/cigen&Date)



