images = [
    "mysql:8.4.6",
    "bitnami/redis:latest",
    "minio/minio:RELEASE.2025-06-13T11-33-47Z-cpuv1",
    "openresty/openresty:1.27.1.1-alpine",
    "ghcr.io/iflytek/astron-rpa/ai-service:latest",
    "ghcr.io/iflytek/astron-rpa/openapi-service:latest",
    "ghcr.io/iflytek/astron-rpa/resource-service:latest",
    "ghcr.io/iflytek/astron-rpa/robot-service:latest"
]

harbor_registry = "harbor.bigdata.com/agentic"

# 构建命令列表
pull_original = []
tag_to_harbor = []
push_to_harbor = []
pull_from_harbor = []
tag_to_original = []

for img in images:
    harbor_img = f"{harbor_registry}/{img}"
    pull_original.append(f"docker pull {img}")
    tag_to_harbor.append(f"docker tag {img} {harbor_img}")
    push_to_harbor.append(f"docker push {harbor_img}")
    pull_from_harbor.append(f"docker pull {harbor_img}")
    tag_to_original.append(f"docker tag {harbor_img} {img}")

# 写入脚本函数
def write_script(filename, commands):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("#!/bin/bash\nset -e\n\n")
        for cmd in commands:
            f.write(cmd + "\n")
    import os
    os.chmod(filename, 0o755)

# 生成五个脚本
write_script("01_pull_original.sh", pull_original)
write_script("02_tag_to_harbor.sh", tag_to_harbor)
write_script("03_push_to_harbor.sh", push_to_harbor)
write_script("04_pull_from_harbor.sh", pull_from_harbor)
write_script("05_tag_to_original.sh", tag_to_original)

print("✅ 已生成以下脚本：")
print("   01_pull_original.sh      # 从官方/源仓库拉取")
print("   02_tag_to_harbor.sh      # 打标签到 Harbor")
print("   03_push_to_harbor.sh     # 推送至 Harbor")
print("   04_pull_from_harbor.sh   # 从 Harbor 拉取（验证/灾备）")
print("   05_tag_to_original.sh    # 打回原始标签（本地使用）")