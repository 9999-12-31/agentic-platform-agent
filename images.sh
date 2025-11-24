## windows构建镜像命令
docker build -f console\frontend\Dockerfile -t harbor.bigdata.com/agentic/agentic-platform-agent/console-frontend:latest .
docker build -f console\backend\hub\Dockerfile -t harbor.bigdata.com/agentic/agentic-platform-agent/console-hub:latest .

## 拉取镜像
docker pull ghcr.io/9999-12-31/agentic-platform-agent/console-frontend:latest
docker pull ghcr.io/9999-12-31/agentic-platform-agent/console-hub:latest
docker pull ghcr.io/9999-12-31/agentic-platform-agent/core-rpa:latest
docker pull ghcr.io/9999-12-31/agentic-platform-agent/core-agent:latest
docker pull ghcr.io/9999-12-31/agentic-platform-agent/core-database:latest
docker pull ghcr.io/9999-12-31/agentic-platform-agent/core-knowledge:latest
docker pull ghcr.io/9999-12-31/agentic-platform-agent/core-workflow:latest
docker pull ghcr.io/9999-12-31/agentic-platform-agent/core-link:latest
docker pull ghcr.io/9999-12-31/agentic-platform-agent/core-tenant:latest
docker pull ghcr.io/9999-12-31/agentic-platform-agent/core-aitools:latest

## 重命名镜像为内网镜像
docker tag ghcr.io/9999-12-31/agentic-platform-agent/console-frontend:latest harbor.bigdata.com/agentic/agentic-platform-agent/console-frontend:latest
docker tag ghcr.io/9999-12-31/agentic-platform-agent/console-hub:latest harbor.bigdata.com/agentic/agentic-platform-agent/console-hub:latest
docker tag ghcr.io/9999-12-31/agentic-platform-agent/core-rpa:latest harbor.bigdata.com/agentic/agentic-platform-agent/core-rpa:latest
docker tag ghcr.io/9999-12-31/agentic-platform-agent/core-agent:latest harbor.bigdata.com/agentic/agentic-platform-agent/core-agent:latest
docker tag ghcr.io/9999-12-31/agentic-platform-agent/core-database:latest harbor.bigdata.com/agentic/agentic-platform-agent/core-database:latest
docker tag ghcr.io/9999-12-31/agentic-platform-agent/core-knowledge:latest harbor.bigdata.com/agentic/agentic-platform-agent/core-knowledge:latest
docker tag ghcr.io/9999-12-31/agentic-platform-agent/core-workflow:latest harbor.bigdata.com/agentic/agentic-platform-agent/core-workflow:latest
docker tag ghcr.io/9999-12-31/agentic-platform-agent/core-link:latest harbor.bigdata.com/agentic/agentic-platform-agent/core-link:latest
docker tag ghcr.io/9999-12-31/agentic-platform-agent/core-tenant:latest harbor.bigdata.com/agentic/agentic-platform-agent/core-tenant:latest
docker tag ghcr.io/9999-12-31/agentic-platform-agent/core-aitools:latest harbor.bigdata.com/agentic/agentic-platform-agent/core-aitools:latest

## 推送镜像
docker push harbor.bigdata.com/agentic/agentic-platform-agent/console-frontend:latest
docker push harbor.bigdata.com/agentic/agentic-platform-agent/console-hub:latest
docker push harbor.bigdata.com/agentic/agentic-platform-agent/core-rpa:latest
docker push harbor.bigdata.com/agentic/agentic-platform-agent/core-agent:latest
docker push harbor.bigdata.com/agentic/agentic-platform-agent/core-database:latest
docker push harbor.bigdata.com/agentic/agentic-platform-agent/core-knowledge:latest
docker push harbor.bigdata.com/agentic/agentic-platform-agent/core-workflow:latest
docker push harbor.bigdata.com/agentic/agentic-platform-agent/core-link:latest
docker push harbor.bigdata.com/agentic/agentic-platform-agent/core-tenant:latest
docker push harbor.bigdata.com/agentic/agentic-platform-agent/core-aitools:latest
