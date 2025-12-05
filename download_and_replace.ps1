# 定义下载目录
$downloadDir = "E:\2025programs\agentic-platform-agent\console\frontend\public\assets\xfyun-resources"

# 创建下载目录（如果不存在）
if (-not (Test-Path -Path $downloadDir)) {
    New-Item -ItemType Directory -Path $downloadDir | Out-Null
}

# 定义包含openres.xfyun.cn链接的文件和对应的URL
$fileUrls = @(
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\chat-page\components\multi-upload-buttons.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-10-23/d260123d-aa1d-4d1e-a575-22fa427deae0/1729648164577/fvadsdfgb.svg",
        "https://openres.xfyun.cn/xfyundoc/2024-10-23/eb1e209f-e13f-4722-8561-8c564658e46d/1729648162929/adfsa.svg",
        "https://openres.xfyun.cn/xfyundoc/2024-12-04/28cc8ea7-e679-47ba-b3e1-810870f79e38/1733276919310/afsddfsadfs.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\model-agent\components\recorder-com.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-10-21/c4fd1b99-1011-48de-8085-990ff99500da/1729522975912/zsfdzfsd.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\chat-page\components\deep-think-progress.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-03-31/1c2b6582-14d3-4741-8361-286401473663/1743423234749/scaasc.svg",
        "https://openres.xfyun.cn/xfyundoc/2025-04-01/52202e3f-c57f-4820-81ee-361335e861f9/1743475056488/vasvasavs.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\constants\config.ts"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-08-15/4c1ec85b-b8a5-422f-ad09-b398700a218e/1755245023381/building.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\space\config.ts"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-08-15/4c1ec85b-b8a5-422f-ad09-b398700a218e/1755245023381/building.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\components\space\space-modal\index.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-07-28/1b05a0cf-e3b5-424c-8fd7-7a527488ab70/1753700397686/spaceAvatar.png"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\model-agent\components\deep-think-progress.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-03-31/1c2b6582-14d3-4741-8361-286401473663/1743423234749/scaasc.svg",
        "https://openres.xfyun.cn/xfyundoc/2025-04-01/52202e3f-c57f-4820-81ee-361335e861f9/1743475056488/vasvasavs.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\components\sidebar\notice-modal\index.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2023-12-20/d2285839-d0c5-481c-860a-f65e1dce63ee/1703071130174/picon-bell.png",
        "https://openres.xfyun.cn/xfyundoc/2023-12-20/9a15bf49-175c-42f0-ab53-7bce59249750/1703073213967/picon-notice.png"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\components\combo-modal\combo-modal.module.scss"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-08-07/414a1d0d-6503-426a-b54e-5c467fc542a0/1754534445690/contactUs-08.07.png"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\model-agent\components\source-info-box.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-04-11/22f3b4aa-daab-4b0c-a4d7-c42a7aff03d6/1712803618079/aaaaaa.png"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\bot-api\api.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-03-25/1fa7e299-25ab-4128-92c9-a56928caea49/1742887223777/workflow_openapi_demo_python.py.zip",
        "https://openres.xfyun.cn/xfyundoc/2025-03-25/ae1c647f-9d9e-4bdf-b50a-7f5e683aa6ad/1742887220264/workflow_openapi_demo_java.java.zip"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\model-agent\components\resq-bottom-buttons.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-08-28/ead19985-ae09-4fd0-9c05-d993ec65d7a2/1756369724570/rotate-cw.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\model-agent\components\multi-upload-buttons.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-10-23/d260123d-aa1d-4d1e-a575-22fa427deae0/1729648164577/fvadsdfgb.svg",
        "https://openres.xfyun.cn/xfyundoc/2024-10-23/eb1e209f-e13f-4722-8561-8c564658e46d/1729648162929/adfsa.svg",
        "https://openres.xfyun.cn/xfyundoc/2024-12-04/28cc8ea7-e679-47ba-b3e1-810870f79e38/1733276919310/afsddfsadfs.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\space\enterprise\page-components\member-manage\components\batch-import\utils.ts"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-09-30/c7044679-2817-4d22-b470-353012d55efd/1759213793509/%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\chat-page\components\audio-animate.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-10-23/713754ca-5528-4cc9-a8e8-959facc8c648/1729652844928/afdfsdaaf.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\model-agent\components\audio-animate.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-10-23/713754ca-5528-4cc9-a8e8-959facc8c648/1729652844928/afdfsdaaf.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\chat-page\components\recorder-com.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-10-21/c4fd1b99-1011-48de-8085-990ff99500da/1729522975912/zsfdzfsd.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\home-page\index.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-09-01/ec2409cf-17cc-4276-b8f3-acdca4abac42/1756696685915/agentRewardBanner.png",
        "https://openres.xfyun.cn/xfyundoc/2025-07-28/1b4d1b3b-5fc0-44e5-938a-f11cd399ea09/1753666916737/banner01-07.28.jpg",
        "https://openres.xfyun.cn/xfyundoc/2025-07-29/e6c12f1d-9e5c-4623-b668-d05d2d826a1f/1753771451925/banner-en02.jpg",
        "https://openres.xfyun.cn/xfyundoc/2025-07-28/057e265c-d206-42a0-bcc4-e35d1a5950ad/1753666916740/banner02-07.28.jpg",
        "https://openres.xfyun.cn/xfyundoc/2025-07-29/453698ff-0f08-41d7-b847-9db6640852c6/1753771451926/banner-en03.jpg",
        "https://openres.xfyun.cn/xfyundoc/2025-07-28/d88084c2-16c8-4210-b5cb-7ef3e298a1bb/1753666916741/banner03-07.28.jpg",
        "https://openres.xfyun.cn/xfyundoc/2025-07-29/0d319c45-816c-4d5b-a94c-91bc489c374d/1753771451926/banner-en04.jpg",
        "https://openres.xfyun.cn/xfyundoc/2025-07-28/79576df5-7d4c-4cf0-b7cf-b1c343acc11a/1753666916742/banner04-07.28.jpg",
        "https://openres.xfyun.cn/xfyundoc/2025-07-29/4818e1ba-8af5-4374-8238-db7250a14e84/1753771451927/banner-en05.jpg",
        "https://openres.xfyun.cn/xfyundoc/2024-01-03/2e6bdf58-f307-4765-9dfa-157813ea5875/1704248820240/%E7%BB%841%402x.png"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\components\config-page-component\config-base\index.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-09-24/e9b74fbb-c2d6-4f4a-8c07-0ea7f03ee03a/1758681839941/icon.png"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\chat-page\components\file-grid-display.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-03-27/2111528e-44a4-493e-baf2-1c3f7dd20812/1711540006742/%E7%BC%96%E7%BB%84%202%402x.png"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\components\virtual-config-modal\index.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-10-21/0969f0d7-519b-45c0-b006-2765fa8f79f7/1729496233283/lingxiaoyue.jpg",
        "https://openres.xfyun.cn/xfyundoc/2025-01-10/072d1c04-b23b-4feb-9728-091207773145/1736479064040/20250110-111727.jpg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\chat-page\components\source-info-box.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-04-11/22f3b4aa-daab-4b0c-a4d7-c42a7aff03d6/1712803618079/aaaaaa.png"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\components\workflow\drawer\advanced-config\index.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-05-13/6c7b581a-e2f1-43fc-a73f-f63307df8150/1715581373857/1123213.png"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\components\config-page-component\config-base\components\CapabilityDevelopment.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-05-13/6c7b581a-e2f1-43fc-a73f-f63307df8150/1715581373857/1123213.png",
        "https://openres.xfyun.cn/xfyundoc/2024-01-22/47883fae-7d3e-46e2-bde0-e46b4753351b/1705888336589/addDatasetIcon.svg",
        "https://openres.xfyun.cn/xfyundoc/2024-01-19/79de3a69-71e9-4e5a-b3cb-188df402f443/1705654589331/selectDatasetBtnIcon.svg",
        "https://openres.xfyun.cn/xfyundoc/2024-01-22/83a641b6-1132-4105-88f9-1d11b5f2d376/1705889402708/deleteDatasetIcon.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\chat-page\components\resq-bottom-buttons.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2025-08-28/ead19985-ae09-4fd0-9c05-d993ec65d7a2/1756369724570/rotate-cw.svg"
    )},
    @{File = "E:\2025programs\agentic-platform-agent\console\frontend\src\pages\model-agent\components\file-grid-display.tsx"; Urls = @(
        "https://openres.xfyun.cn/xfyundoc/2024-03-27/2111528e-44a4-493e-baf2-1c3f7dd20812/1711540006742/%E7%BC%96%E7%BB%84%202%402x.png"
    )}
)

# 下载文件并更新引用
foreach ($item in $fileUrls) {
    $filePath = $item.File
    $urls = $item.Urls
    
    foreach ($url in $urls) {
        try {
            # 从URL中提取文件名
            $fileName = [System.IO.Path]::GetFileName($url)
            $localPath = Join-Path -Path $downloadDir -ChildPath $fileName
            
            # 下载文件
            Invoke-WebRequest -Uri $url -OutFile $localPath -ErrorAction Stop
            Write-Host "下载成功: $url -> $localPath"
            
            # 构建本地引用路径
            $localReference = "/assets/xfyun-resources/$fileName"
            
            # 更新文件中的引用
            $content = Get-Content -Path $filePath -Raw -ErrorAction Stop
            $newContent = $content -replace [regex]::Escape($url), $localReference
            
            # 保存修改后的文件
            Set-Content -Path $filePath -Value $newContent -ErrorAction Stop
            Write-Host "更新引用成功: $filePath 中的 $url -> $localReference"
        } catch {
            Write-Host "处理失败: $url - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "所有文件处理完成!" -ForegroundColor Green