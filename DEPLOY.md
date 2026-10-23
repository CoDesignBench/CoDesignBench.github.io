# 通过 GitHub 网页上传并发布主页

这份主页是静态网站，已有 GitHub Pages 自动部署配置。使用公开仓库时，GitHub Free 即可。以下步骤全部在浏览器中完成。

主页按组织名 `CoDesignBench` 配置。如果采用其他名称，请同步替换仓库名、网址和下文的分享图片地址。

| 用途 | 地址或名称 |
| --- | --- |
| 组织 | `https://github.com/CoDesignBench` |
| 主页仓库 | `CoDesignBench/CoDesignBench.github.io` |
| 发布后的主页 | `https://codesignbench.github.io/` |

## 1. 创建主页仓库

组织 `CoDesignBench` 已创建。打开 [New repository](https://github.com/new?owner=CoDesignBench&name=CoDesignBench.github.io&visibility=public)，确认 Owner 为 `CoDesignBench`，Repository name 为 `CoDesignBench.github.io`，Visibility 为 **Public**，然后创建仓库。

仓库名应为 `<组织名>.github.io`，这样主页会发布在域名根路径。

## 2. 解压并通过网页上传

1. 将 ZIP 下载到自己的电脑并解压。GitHub Pages 不会自动解压上传的 ZIP。
2. 打开新仓库，点击空仓库提示中的 **uploading an existing file**；已有文件的仓库可选 **Add file → Upload files**。
3. 上传解压目录里面的全部文件和子目录，包括隐藏文件 `.nojekyll` 和 `.github/workflows/pages.yml`。如果文件管理器隐藏以点开头的文件，请先开启显示隐藏文件。
4. 点击 **Commit changes**，提交到 `main` 分支。

上传后，`index.html` 应直接位于仓库根目录，`assets/`、`data/`、`paper/` 和 `vendor/` 应与它同级。如果网页上传漏掉了工作流，可用 **Add file → Create new file** 创建 `.github/workflows/pages.yml`，复制包内对应文件的内容后提交。

## 3. 启用自动部署

在仓库中进入 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。

本目录已经包含部署工作流，无需再选择模板。随后进入 **Actions → Deploy Co-Design Bench page → Run workflow**，选择 `main` 并运行。

工作流成功后，**Settings → Pages → Visit site** 会给出实际网址。以后在网页上更新 `main` 分支的文件，就会自动重新部署。

## 分享图片网址

`index.html` 中的 `og:image` 和 `twitter:image` 已设为 `https://codesignbench.github.io/assets/social.png`，部署后社交平台可通过这个完整地址读取预览图片。如果更换组织名或改用自定义域名，请同步更新这两个地址。

## 官方文档

- [创建 GitHub 组织](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/creating-a-new-organization-from-scratch)
- [创建 GitHub Pages 网站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [配置 GitHub Actions 发布](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
