# 猫咪测试项目 - 管理员维护指南

本手册包含了在云服务器上管理激活码和维护系统的常用命令。

## 1. 基础环境 (必读)

在执行任何 `scripts` 目录下的脚本前，请确保已激活编译器环境：

```bash
source /opt/rh/gcc-toolset-12/enable
```

## 2. 激活码管理

### 批量生成激活码

生成 100 个激活码，自动存入数据库并备份到 `scripts/generated_codes.txt`：

```bash
tsx scripts/generate-codes.mjs 100
```

### 查看数据库统计

查看总数、已核销数、剩余可用数等：

```bash
tsx scripts/check-db.mjs
```

### 重置测试数据

重新初始化管理员码（`CAT-ADMIN-POWER`）和基础测试码：

```bash
tsx scripts/seed-initial.mjs
```

## 3. 系统维护

### 查看应用状态

```bash
pm2 status
```

### 重启应用 (更新代码后执行)

```bash
pm2 reload cat-quiz
```

### 查看实时日志

```bash
pm2 logs cat-quiz
```

## 4. 在线监控

您可以直接通过浏览器访问统计接口：
`http://您的服务器IP/api/admin/stats?secret=CAT-ADMIN-123456`
