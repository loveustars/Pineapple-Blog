#!/bin/bash

# Pineappleblog Editor v1.0.0 - 自动化启动脚本

echo "🍍 Pineappleblog Editor v1.0.0"
echo "================================"
echo ""

# 检查 Node.js
echo "检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js >= 18.0.0"
    exit 1
fi
echo "✅ Node.js 版本: $(node --version)"

# 检查 pnpm
echo "检查 pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  未找到 pnpm，将使用 npm"
    PKG_MANAGER="npm"
else
    echo "✅ pnpm 版本: $(pnpm --version)"
    PKG_MANAGER="pnpm"
fi

# 检查 Rust
echo "检查 Rust..."
if ! command -v cargo &> /dev/null; then
    echo "❌ 未找到 Rust，请先安装 Rust"
    echo "访问: https://rustup.rs/"
    exit 1
fi
echo "✅ Rust 版本: $(rustc --version)"

# 检查 Hugo
echo "检查 Hugo..."
if command -v hugo &> /dev/null; then
    echo "✅ Hugo 版本: $(hugo version | head -n 1)"
else
    echo "⚠️  未找到 Hugo"
    echo "   安装命令: brew install hugo"
fi

# 检查 Zola
echo "检查 Zola..."
if command -v zola &> /dev/null; then
    echo "✅ Zola 版本: $(zola --version)"
else
    echo "⚠️  未找到 Zola"
    echo "   安装命令: brew install zola"
fi

echo ""
echo "================================"
echo ""

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    $PKG_MANAGER install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

echo ""
echo "================================"
echo ""
echo "🚀 启动开发服务器..."
echo ""

# 启动 Tauri 开发模式
$PKG_MANAGER tauri:dev
