#!/bin/bash
# launchd / 用户终端使用：前台运行（exec 替换 shell），
# 这样 launchd 能正确把它当作子进程管理（KeepAlive 崩溃自重启）。
# 注意：WorkBuddy 沙箱保活请用 run_frontend_daemon.py（需脱离沙箱会话）。
cd /Users/fan/Desktop/portfolio/frontend
exec /Users/fan/.workbuddy/binaries/node/versions/22.22.2/bin/npm run dev
