import React, { useState, useEffect, JSX, useRef } from 'react';
import { Tooltip, Popover, Modal, Button, Input, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { BotInfoType, SupportUploadConfig, UploadFileInfo } from '@/types/chat';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { getAllFiles, uploadFileBindChat } from '@/services/chat';
import styles from '@/components/sidebar/personal-center/index.module.scss';
import { getFileIcon } from '@/utils';
import useChatFileUpload from '@/hooks/use-chat-file-upload';

interface MultiUploadButtonsProps {
  botInfo: BotInfoType;
  handleFileSelect: (
    event: React.ChangeEvent<HTMLInputElement>,
    config?: SupportUploadConfig,
    uploadMaxMB?: number
  ) => void;
  fileList: UploadFileInfo[];
  setFileList?: (
    files:
      | UploadFileInfo[]
      | ((prevFiles: UploadFileInfo[]) => UploadFileInfo[])
  ) => void;
}
const { Search } = Input;

const MultiUploadButtons: React.FC<MultiUploadButtonsProps> = ({
  botInfo,
  handleFileSelect,
  fileList,
  setFileList,
}) => {
  const { t } = useTranslation();
  const [fileTypeCounts, setFileTypeCounts] = useState<Record<string, number>>(
    {}
  );
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [currentUploadConfig, setCurrentUploadConfig] =
    useState<SupportUploadConfig | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [allFiles, setAllFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>(
    {}
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateFileBusinessKey = (): string => {
    const randomBytes = new Uint8Array(10);
    window.crypto.getRandomValues(randomBytes);
    const randomStr = Array.from(randomBytes, byte => byte.toString(36))
      .join('')
      .substring(2, 15);

    return `${Date.now()}-${randomStr}`;
  };

  useEffect(() => {
    getList();
  }, []);

  // 统计各文件类型的数量
  useEffect(() => {
    const uploadConfigs: SupportUploadConfig[] =
      botInfo?.supportUploadConfig || [];
    const counts: Record<string, number> = {};

    // 初始化所有文件类型的计数
    uploadConfigs.forEach(config => {
      if (config.name) {
        counts[config.name] = 0;
      }
    });

    // 统计 fileList 中的有效文件
    if (fileList && Array.isArray(fileList) && fileList.length > 0) {
      fileList.forEach((file: UploadFileInfo) => {
        // 排除失败状态的文件
        const status = file.status || 'success';
        if (status === 'error') {
          return; // 跳过失败的文�?
        }

        // 根据 inputName (config.name) 进行计数
        // 只计算有效文件：uploading、processing、success、pending、completed
        const inputName = file.inputName || file.type || 'unknown';
        if (
          inputName &&
          Object.prototype.hasOwnProperty.call(counts, inputName)
        ) {
          counts[inputName] = (counts[inputName] || 0) + 1;
        }
      });
    }

    setFileTypeCounts(counts);
  }, [fileList, botInfo]);

  /**
   * 获取文件类型对应的图�?
   */
  const getIconUrl = (icon?: string): string => {
    if (icon === 'image') {
      return '/assets/xfyun-resources/fvadsdfgb.svg';
    }
    return '/assets/xfyun-resources/adfsa.svg';
  };
  const getList = async () => {
    const res = await getAllFiles(searchValue || '');
    setAllFiles(res);
  };
  // 打开上传弹窗
  const handleOpenUploadModal = (config: SupportUploadConfig) => {
    setCurrentUploadConfig(config);
    setSelectedFiles({}); // 重置选择状态
    setUploadModalVisible(true);
  };

  // 关闭上传弹窗
  const handleCloseUploadModal = () => {
    setUploadModalVisible(false);
    setCurrentUploadConfig(null);
    setSelectedFiles({}); // 重置选择状态
  };

  // 处理文件项选择
  const handleFileItemSelect = (fileId: string) => {
    if (!currentUploadConfig) return;

    const { limit } = currentUploadConfig;
    const currentSelectionCount =
      Object.values(selectedFiles).filter(Boolean).length;

    // 如果文件已选中，则取消选择
    if (selectedFiles[fileId]) {
      setSelectedFiles(prev => ({
        ...prev,
        [fileId]: false,
      }));
      return;
    }

    // 如果已达到选择上限，则不允许再选择
    if (currentSelectionCount >= (limit || 1)) {
      return;
    }

    // 选择文件
    setSelectedFiles(prev => ({
      ...prev,
      [fileId]: true,
    }));
  };

  // 处理确认选择
  const handleConfirmSelection = async () => {
    if (!currentUploadConfig) return;

    // 这里可以根据selectedFiles处理选中的文件
    const selectedFileList = allFiles.filter(
      file => selectedFiles[file.fileId]
    );
    console.log('Selected files:', selectedFileList);
    const config = currentUploadConfig;

    // 处理选中的文件
    const newFiles: UploadFileInfo[] = selectedFileList.map(fileObj => ({
      uid: generateFileBusinessKey(),
      fileName: fileObj.fileName,
      file:fileObj,
      fileSize: fileObj.fileSizeRaw,
      fileId:fileObj.fileId,
      type: fileObj.type,
      status: 'completed',
      fileUrl: fileObj.fileUrl,
      fileBusinessKey: generateFileBusinessKey(),
      progress: 100,
      paramName: config.name, // 添加 paramName
      inputName: config.name, // 添加 inputName（对应 config.name）
    }));

    // 使用函数式更新添加新文件
    if (setFileList) {
      setFileList(prev => [...prev, ...newFiles]);
    }

    // 为每个选中的文件调用上传绑定接口
    for (const fileObj of selectedFileList) {
      await uploadFileBindChat({
        chatId: botInfo.chatId,
        fileName: fileObj.fileName,
        fileSize: fileObj.fileSizeRaw,
        fileUrl: fileObj.fileUrl,
        fileBusinessKey: generateFileBusinessKey(),
        paramName: config.name || config.type, // 添加 paramName 参数
      });
    }

    handleCloseUploadModal();
  };

  // 触发文件选择
  const triggerFileInput = () => {
    if (fileInputRef.current && currentUploadConfig) {
      fileInputRef.current.click();
    }
  };

  // 处理文件选择
  const handleFileSelectWithConfig = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (currentUploadConfig) {
      const uploadMaxMB =
        currentUploadConfig.icon === 'image'
          ? 20
          : currentUploadConfig.icon === 'video'
            ? 500
            : 50;
      handleFileSelect(e, currentUploadConfig, uploadMaxMB);
      handleCloseUploadModal();
    }
  };

  /**
   * 渲染单个上传按钮
   */
  const renderUploadButton = (
    config: SupportUploadConfig,
    index: number,
    isPopover?: boolean
  ): JSX.Element => {
    const { accept, limit, type, icon, name, schema } = config;
    const currentCount = fileTypeCounts[name || type] || 0;
    const uploadMaxMB = icon === 'image' ? 20 : icon === 'video' ? 500 : 50;
    const isDisabled = currentCount >= (limit || 1);

    return (
      <Tooltip
        key={`upload-${index}`}
        title={t('chatPage.chatWindow.uploadTooltip', {
          accept,
          size: uploadMaxMB,
          count: limit || 1,
        })}
        placement="top"
        mouseEnterDelay={1}
      >
        <div
          className={clsx(
            'relative flex items-center justify-center gap-1.5 px-2 py-1 cursor-pointer transition-all rounded hover:bg-[#f5f5f5]',
            isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
          onClick={() => !isDisabled && handleOpenUploadModal(config)}
        >
          <img
            src={getIconUrl(icon)}
            alt={type}
            className="w-4 h-4 flex-shrink-0 cursor-pointer"
          />
          <div className="flex flex-col">
            <div className="text-xs whitespace-nowrap">
              {type} <span>{schema.default ? `(${schema.default})` : ''}</span>
            </div>
            {isPopover && (
              <div className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                {t('chatPage.chatWindow.uploadTooltip', {
                  accept,
                  size: uploadMaxMB,
                  count: limit || 1,
                })}
              </div>
            )}
          </div>
        </div>
      </Tooltip>
    );
  };

  /**
   * 渲染 Popover 内容
   */
  const renderPopoverContent = (
    uploadConfigs: SupportUploadConfig[]
  ): JSX.Element => {
    return (
      <div className="max-h-[240px] overflow-y-auto rounded-lg [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#f1f1f1] [&::-webkit-scrollbar-track]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-[#c1c1c1] [&::-webkit-scrollbar-thumb]:rounded-sm">
        {uploadConfigs.map((config: SupportUploadConfig, index: number) => (
          <div
            key={`popover-upload-${index}`}
            className={clsx(
              'p-2 border-b border-[#f0f0f0] rounded hover:bg-[#f5f5f5]',
              index === uploadConfigs.length - 1 && 'border-b-0'
            )}
          >
            {renderUploadButton(config, index, true)}
          </div>
        ))}
      </div>
    );
  };

  /**
   * 渲染合并的上传按钮（当配置项超过3个时使用�?
   */
  const renderMergedUploadButton = (
    uploadConfigs: SupportUploadConfig[]
  ): JSX.Element => {
    return (
      <Popover
        content={renderPopoverContent(uploadConfigs)}
        placement="bottom"
        overlayInnerStyle={{
          maxWidth: '300px',
          padding: '8px',
          marginBottom: '5px',
        }}
        arrow={false}
      >
        <img
          src="/assets/xfyun-resources/afsddfsadfs.svg"
          alt="Upload"
          className="w-5 h-5 cursor-pointer ml-1"
        />
      </Popover>
    );
  };

  /**
   * 渲染所有上传按�?
   */
  const renderUploadButtons = (): JSX.Element => {
    const uploadConfigs: SupportUploadConfig[] =
      botInfo?.supportUploadConfig || [];

    if (!uploadConfigs || uploadConfigs.length === 0) {
      return <div />;
    }

    // 当配置项超过3个时，使用合并的 Popover 按钮
    if (uploadConfigs.length > 3) {
      return (
        <div className="flex items-center">
          {renderMergedUploadButton(uploadConfigs)}
        </div>
      );
    }

    // 配置项不超过3个时，并排显示
    return (
      <div className="flex items-center">
        {uploadConfigs.map((config: SupportUploadConfig, index: number) =>
          renderUploadButton(config, index)
        )}
      </div>
    );
  };

  // 渲染上传弹窗
  const renderUploadModal = () => {
    if (!currentUploadConfig) return null;

    const { accept, limit, type, icon, name, schema } = currentUploadConfig;

    return (
      <Modal
        title="选择个人中心文件"
        open={uploadModalVisible}
        onCancel={handleCloseUploadModal}
        footer={null}
        width={900}
      >
        {/* 搜索栏 */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center">
            <Search
              placeholder="输入文件名"
              size={'large'}
              onChange={e => setSearchValue(e.target.value)}
              onSearch={getList}
              enterButton
            />
            <div className="ml-2">
              <Button
                type="primary"
                icon={<UploadOutlined />}
                size="large"
                onClick={triggerFileInput}
              >
                上传本地文件
              </Button>
            </div>
          </div>
        </div>

        {/* 选择信息提示 */}
        {allFiles.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            已选择 {Object.values(selectedFiles).filter(Boolean).length} /{' '}
            {limit} 个文件
          </div>
        )}

        {/* 文件列表 */}
        <div className="mb-8">
          <div className={styles.contentWrapper}>
            {allFiles.map(file => {
              const isSelected = selectedFiles[file.fileId] || false;
              const currentSelectionCount =
                Object.values(selectedFiles).filter(Boolean).length;
              const isDisabled =
                !isSelected && currentSelectionCount >= (limit || 1);

              return (
                <div
                  className={`${styles.itemBox} ${isSelected ? 'border-blue-400 bg-blue-50' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  key={file.fileId}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFileItemSelect(file.fileId)}
                        disabled={isDisabled}
                        className="mr-2 cursor-pointer"
                      />
                      <img
                        src={getFileIcon(file)}
                        alt={file.fileExtension}
                        className="w-10 h-10 mr-2"
                      />
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                          {file.fileName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file.createTime}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{file.fileSize}</div>
                </div>
              );
            })}
          </div>
          {allFiles.length === 0 && <Empty />}
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center justify-end mt-4">
          <Button onClick={handleCloseUploadModal}>取消</Button>
          <Button
            type="primary"
            className="ml-2"
            onClick={handleConfirmSelection}
            disabled={Object.values(selectedFiles).filter(Boolean).length === 0}
          >
            确定
          </Button>
        </div>

        {/* 隐藏的文件输入框 */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={(limit || 0) > 1}
          onChange={handleFileSelectWithConfig}
          style={{ display: 'none' }}
        />
      </Modal>
    );
  };

  return (
    <>
      {renderUploadButtons()}
      {renderUploadModal()}
    </>
  );
};

export default MultiUploadButtons;
