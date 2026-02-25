# PWA 图标生成指南

为了使 PWA 功能完整，需要生成以下尺寸的图标：

## 需要的图标

1. **icon-192.png** (192x192 像素)
   - 用于 Android 主屏幕图标
   - 用于应用快捷方式

2. **icon-512.png** (512x512 像素)
   - 用于 Android 启动画面
   - 用于更高分辨率设备

3. **og-image.png** (1200x630 像素，可选)
   - 用于社交媒体分享预览
   - Open Graph 和 Twitter Card

## 快速生成图标

### 方式 1：使用在线工具

访问 https://www.favicon-generator.org/ 或 https://realfavicongenerator.net/

上传一张 1024x1024 的原始图片，自动生成所有尺寸。

### 方式 2：使用 ImageMagick (命令行)

```bash
# 假设你有一张 logo.png (1024x1024)
convert logo.png -resize 192x192 icon-192.png
convert logo.png -resize 512x512 icon-512.png
convert logo.png -resize 1200x630 og-image.png
```

### 方式 3：使用 AI 生成

使用即梦 API 或其他 AI 工具生成一个词根主题的图标：

**提示词**：
```
A minimalist app icon for a vocabulary learning app focused on word roots and affixes. 
Clean, modern design with book or tree metaphor. Indigo color scheme. 1024x1024px.
```

## 临时方案

在图标生成之前，可以使用纯色占位符：

```bash
# 生成纯色占位符（需要 ImageMagick）
convert -size 192x192 xc:#6366f1 icon-192.png
convert -size 512x512 xc:#6366f1 icon-512.png
convert -size 1200x630 xc:#6366f1 -pointsize 72 -fill white -gravity center \
        -annotate +0+0 "词根工坊" og-image.png
```

## 验证

生成后，将图标文件放在项目根目录，然后：

1. 在 Chrome DevTools 中打开 Application → Manifest 查看是否正确加载
2. 使用 Lighthouse 审计 PWA 性能
3. 在 Android 设备上测试"添加到主屏幕"功能

