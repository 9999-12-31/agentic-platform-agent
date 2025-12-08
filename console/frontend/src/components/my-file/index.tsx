import React, { ReactElement, useState, useEffect } from 'react';
import {
  DeleteOutlined,
  UploadOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import styles from '../sidebar/personal-center/index.module.scss';
import { Input, Button, Progress, Modal } from 'antd';
import useChatFileUpload from '@/hooks/use-chat-file-upload';
import type {
  BotInfoType,
  UploadFileInfo,
  SupportUploadConfig,
} from '@/types/chat';
import { deleteFiles, getAllFiles } from '@/services/chat';
import { getFileIcon } from '@/utils';

const { Search } = Input;

// 文件数据接口
interface FileItem {
  createTime: string;
  fileExtension: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
}

const mockBotInfo: BotInfoType = {
  pcBackground: '',
  botStatus: 1,
  chatId: 123456, // 替换为实际的chatId
  supportUploadConfig: [
    {
      icon: 'file',
      tip: '支持所有文件类型',
      accept: '*',
      businessType: 1,
      value: 1,
      limit: 10,
      required: false,
      name: 'general_file',
      type: 'file',
    },
  ],
  model: 'default',
  botId: 1,
  creatorNickname: 'admin',
  prologue: '',
  mine: true,
  botName: '默认机器人',
  avatar: '',
  botDesc: '',
  version: 1,
  inputExample: [],
  supportContext: true,
  isFavorite: 0,
  vcnCn: 'default',
};

// 模拟上传配置（支持所有文件类型）
const mockUploadConfig: SupportUploadConfig = {
  icon: 'file',
  tip: '支持所有文件类型',
  accept: '*',
  businessType: 1,
  value: 1,
  limit: 10,
  required: false,
  name: 'general_file',
  type: 'file',
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

const MyFile = (): ReactElement => {
  const [allFiles, setAllFiles] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');

  const getList = async () => {
    const res = await getAllFiles(searchValue || '');
    setAllFiles(res);
  };
  useEffect(() => {
    getList();
  }, []);

  const handleDeleteChatConfirm = async () => {
    await deleteFiles(itemIdToDelete);
    await getList();
    setDeleteOpen(false);
    setItemIdToDelete(null);
  };

  const toOpen = () => {};
  const {
    fileList: uploadedFileList,
    fileInputRef,
    handleFileSelect,
    triggerFileSelect,
  } = useChatFileUpload({
    botInfo: mockBotInfo,
    isBindChat: false,
    onUploadComplete: getList, // 文件上传完成后重新获取文件列表
  });

  // 上传最大文件大小（MB）
  const uploadMaxMB = 50;

  // 渲染单个文件项
  const renderFileItem = (file: FileItem) => {
    return (
      <div className={styles.itemBox} key={file.fileId} onClick={toOpen}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <img
              src={getFileIcon(file)}
              alt={file.fileExtension}
              className="w-10 h-10 mr-2"
            />
            <div className="flex flex-col">
              <div className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                {file.fileName}
              </div>
              <div className="text-xs text-gray-500">{file.createTime}</div>
            </div>
          </div>
          <DeleteOutlined
            className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
            onClick={async () => {
              setItemIdToDelete(file.fileId);
              setDeleteOpen(true);
            }}
          />
        </div>
        <div className="text-xs text-gray-500">
          {formatFileSize(file.fileSize)}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">我的文件</h2>
        <div className="flex items-center">
          <Search
            placeholder="输入文件名"
            size={'large'}
            onChange={e => setSearchValue(e.target.value)}
            onSearch={getList}
            enterButton
          />
          <div className="ml-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={e => handleFileSelect(e, mockUploadConfig, uploadMaxMB)}
              style={{ display: 'none' }}
            />
            <Button
              type="primary"
              icon={<UploadOutlined />}
              size="large"
              onClick={triggerFileSelect}
            >
              上传文件
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className={styles.contentWrapper}>
          {allFiles.map(renderFileItem)}
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onCancel={() => {
          setDeleteOpen(false);
          setItemIdToDelete(null);
        }}
        closeIcon={null}
        wrapClassName={styles.delete_mode}
        centered
        width={352}
        maskClosable={false}
        onOk={handleDeleteChatConfirm}
      >
        <div className={styles.delete_mode_title}>
          <img src={require('@/assets/imgs/sidebar/warning.svg')} alt="" />
          <span>确定移除该文件？</span>
        </div>
      </Modal>
    </div>
  );
};

export default MyFile;
