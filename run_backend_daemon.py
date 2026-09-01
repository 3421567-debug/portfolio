#!/usr/bin/env python3
"""把 Django runserver 守护化：双 fork + setsid，脱离启动它的 shell 会话，
使其在 WorkBuddy 沙箱 Bash 结束后仍存活（与 vite 在前端的存活方式一致）。"""
import os
import sys

PROJECT_DIR = "/Users/fan/Desktop/portfolio"
PYTHON = "/Users/fan/Desktop/portfolio/venv/bin/python"

# 第一次 fork：父进程立即退出，子进程由 init 接管
if os.fork() > 0:
    os._exit(0)

# 创建新会话，脱离原控制终端 / 进程组
os.setsid()

# 第二次 fork：确保不是会话首进程，永不重新获得控制终端
if os.fork() > 0:
    os._exit(0)

# 进入项目目录、重设文件掩码、重定向标准流到 /dev/null
os.chdir(PROJECT_DIR)
os.umask(0)
devnull = os.open(os.devnull, os.O_RDWR)
os.dup2(devnull, 0)
os.dup2(devnull, 1)
os.dup2(devnull, 2)

# 用 exec 替换进程映像，启动 Django（日志由 manage.py 自己写 backend.log 之外的 stdout/stderr 已丢弃）
os.execv(PYTHON, [PYTHON, "manage.py", "runserver", "127.0.0.1:8000"])
