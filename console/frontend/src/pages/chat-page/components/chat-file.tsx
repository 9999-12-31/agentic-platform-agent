import React, { useEffect, useMemo, useState } from 'react';

import { BotInfoType, UploadFileInfo } from '@/types/chat';
import { getAllChatFiles, getAllFiles } from '@/services/chat';
import { useParams } from 'react-router-dom';
import { getFileIcon } from '@/utils';
import FilePreview from './file-preview';

// 组件Props接口
interface ChatSideProps {
  botInfo?: BotInfoType;
}

const ChatFile: React.FC<ChatSideProps> = ({ botInfo }) => {
  const [allFiles, setAllFiles] = useState<UploadFileInfo[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadFileInfo | undefined>();
  const {
    botId,
    version,
    chatId: chilChatId,
  } = useParams<{
    botId: string;
    version?: string;
    chatId?: string;
  }>();

  const getList = async () => {
    const res = await getAllChatFiles(botInfo?.chatId as number, chilChatId);
    setAllFiles(res);
  };

  useEffect(() => {
    getList();
  }, [botId,chilChatId]);

  return (
    <div className="fixed top-[84px] right-6 w-[340px] h-[calc(100vh-108px)] bg-white rounded-2xl py-10 px-6 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col space-y-4">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">文件</h3>
        </div>

        {/* 文件列表 */}
        <div className="flex flex-col space-y-3">
          {allFiles.map(file => (
            <div
              key={file.fileId}
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setPreviewFile(file)}
            >
              {/* 文件图标 */}
              <div className="mr-4">
                <img
                  src={getFileIcon(file)}
                  alt={file.fileExtension}
                  className="w-10 h-10 mr-2"
                />
              </div>

              {/* 文件信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {file.fileName}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 mt-1">{file.createTime}</p>
              </div>
            </div>
          ))}
          {allFiles.length === 0 && <div>暂无数据</div>}
        </div>
      </div>

      {/* 文件预览组件 */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(undefined)}
        />
      )}
    </div>
  );
};

export default ChatFile;
