#!/usr/bin/env python3
"""把 Vite dev server 守护化：双 fork + setsid，脱离启动它的 shell 会话，
使其在 WorkBuddy 沙箱 Bash 结束后仍存活（与后端守护启动器同机制）。"""
import os

FRONTEND_DIR = "/Users/fan/Desktop/portfolio/frontend"
NODE = "/Users/fan/.workbuddy/binaries/node/versions/22.22.2/bin/node"
VITE = "/Users/fan/Desktop/portfolio/frontend/node_modules/vite/bin/vite.js"

# 第一次 fork：父进程立即退出
if os.fork() > 0:
    os._exit(0)

# 创建新会话，脱离原控制终端 / 进程组
os.setsid()

# 第二次 fork：确保不是会话首进程
if os.fork() > 0:
    os._exit(0)

os.chdir(FRONTEND_DIR)
os.umask(0)
devnull = os.open(os.devnull, os.O_RDWR)
os.dup2(devnull, 0)
os.dup2(devnull, 1)
os.dup2(devnull, 2)

os.execv(NODE, [NODE, VITE])
