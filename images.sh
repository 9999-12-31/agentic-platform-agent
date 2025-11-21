## windows构建镜像命令
docker build -f console\frontend\Dockerfile -t harbor.bigdata.com/agentic/agentic-platform-agent/console-frontend:latest .
docker build -f console\backend\hub\Dockerfile -t harbor.bigdata.com/agentic/agentic-platform-agent/console-hub:latest .

## 拉取镜像
docker pull ghcr.io/9999-12-31/agentic-platform-agent/console-frontend:latest
docker pull ghcr.io/9999-12-31/agentic-platform-agent/console-hub:latest

## 重命名镜像为内网镜像
docker tag ghcr.io/9999-12-31/agentic-platform-agent/console-frontend:latest harbor.bigdata.com/agentic/agentic-platform-agent/console-frontend:latest
docker tag ghcr.io/9999-12-31/agentic-platform-agent/console-hub:latest harbor.bigdata.com/agentic/agentic-platform-agent/console-hub:latest

## 推送镜像
docker push harbor.bigdata.com/agentic/agentic-platform-agent/console-frontend:latest
docker push harbor.bigdata.com/agentic/agentic-platform-agent/console-hub:latest


