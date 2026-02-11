# 猫咪人格测试应用 - 部署与使用指南

## 1. 本地运行 (Local Development)

### 先决条件

确保你的电脑上安装了 `Node.js` (v18+)。

### 启动步骤

1. **安装依赖** (如果尚未安装):

    ```bash
    npm install
    ```

2. **生成测试激活码**:
    我们提供了一个脚本来批量生成激活码。

    ```bash
    node scripts/generate_codes.js
    ```

    运行后，会在 `scripts/codes.txt` 中生成 100 个激活码。你可以复制其中一个用于测试。

3. **启动开发服务器**:

    ```bash
    npm run dev
    ```

4. **访问应用**:
    打开浏览器访问 `http://localhost:3000`。
    输入你在第 2 步生成的激活码，即可开始测试。

## 2. 部署到 Vercel (推荐)

Vercel 是最简单的部署 Next.js 应用的方式，且提供免费 HTTPS 域名。

### 步骤

1. **上传代码到 GitHub**:
    * 在 GitHub 上创建一个新仓库。
    * 将本地代码推送到仓库:

        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin <你的仓库地址>
        git push -u origin main
        ```

2. **在 Vercel 导入项目**:
    * 注册/登录 [Vercel](https://vercel.com)。
    * 点击 **"Add New..."** -> **"Project"**。
    * 选择你刚才创建的 GitHub 仓库。
    * 框架预设选择 **Next.js** (通常自动识别)。
    * 点击 **"Deploy"**。

3. **等待构建**:
    * Vercel 会自动构建并部署。
    * 完成后，你会获得一个 `https://your-project.vercel.app` 的链接。
    * 你的应用上线了！

## 3. 生产环境配置 (进阶)

### 数据库对接

目前项目使用的是 **Mock (模拟) 验证**，所有的激活码验证在内存中进行（或通过简单逻辑校验）。
如果你需要正式售卖，建议对接真实数据库 (Database)。

* **推荐方案**: Supabase (PostgreSQL) 或 Vercel KV (Redis)。
* **修改位置**:
  * `src/app/api/verify/route.ts`: 将 Mock 逻辑替换为查询数据库。
  * `scripts/generate_codes.js`: 修改脚本，将生成的码直接写入数据库。

### 防刷与安全

* 当前 Session Token 存储在 `localStorage`，并在前端校验。
* 建议在正式版中，API 接口增加速率限制 (Rate Limiting) 防止暴力破解验证码。
