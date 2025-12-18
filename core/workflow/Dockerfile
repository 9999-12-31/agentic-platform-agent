# Use the base image with Python 3.11 and Spark Link dependencies
FROM python:3.11-slim

# Set the working directory for the application
WORKDIR /opt/core

# Configure environment variables
ENV PATH=$PATH:/opt/core
ENV PYTHONPATH=/opt/core
ENV UV_NO_CACHE=1
# Set timezone environment variable (optional but helpful)
ENV TZ=Asia/Shanghai

# Install tzdata to set system timezone (required for correct time in logs, cron, etc.)
RUN apt-get update && \
    apt-get install -y --no-install-recommends tzdata && \
    ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata && \
    rm -rf /var/lib/apt/lists/*

# Install UV package manager using Tsinghua mirror
RUN pip install uv --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple/

# Copy dependency files
COPY core/workflow/uv.lock core/workflow/pyproject.toml ./

# Install Python dependencies
RUN uv sync -i https://pypi.tuna.tsinghua.edu.cn/simple/

# Copy source code
COPY core/workflow ./workflow
COPY core/common ./common

# Default command
CMD ["uv", "run", "workflow/main.py"]