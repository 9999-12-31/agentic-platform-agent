import { UploadFileInfo } from '@/types/chat';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { getFileIcon } from '@/utils';
import closeIcon from '@/assets/imgs/chat/plugin/delete-file.png';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { renderAsync } from 'docx-preview';
import DOMPurify from 'dompurify';
import styles from '../index.module.scss';

const FilePreview = ({
  file,
  onClose,
}: {
  file: UploadFileInfo;
  onClose: () => void;
}): ReactElement => {
  const { t } = useTranslation();
  const extension = file.fileName?.split('.').pop()?.toLowerCase();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const downloadTxtFile = (url?: string) => {
    if (!url) return;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(txtContent => {
        setContent(txtContent);
      })
      .catch(error => {
        console.error('下载失败:', error);
      });
  };
  const loadExcel = async (url?: string) => {
    if (!url) return;
    setLoading(true);
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames?.[0];
      if (!firstSheetName) {
        setContent('');
      } else {
        const worksheet =
          workbook.Sheets[firstSheetName as keyof typeof workbook.Sheets];
        if (worksheet) {
          const html = XLSX.utils.sheet_to_html(worksheet);
          setContent(DOMPurify.sanitize(html));
        } else {
          setContent('');
        }
      }
    } catch (error) {
      console.error('Excel load failed:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadWord = async (url?: string) => {
    if (!url) return;
    setLoading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      if (docxContainerRef.current) {
        docxContainerRef.current.innerHTML = '';
        await renderAsync(blob, docxContainerRef.current);
      }
    } catch (error) {
      console.error('Word load failed:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!file.fileUrl) return;
    if (extension === 'txt') {
      downloadTxtFile(file.fileUrl);
    } else if (extension === 'docx') {
      loadWord(file.fileUrl);
    } else if (extension === 'xls' || extension === 'xlsx') {
      loadExcel(file.fileUrl);
    }
  }, [file.fileUrl, extension]);

  // 根据文件类型渲染预览内容 预览txt文件时，需要先下载文件内容
  const renderFilePreview = (): ReactElement => {
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return (
          <div className="flex justify-center">
            <img
              src={file.fileUrl}
              alt={file.fileName}
              className="max-h-[60vh] max-w-full object-contain rounded-lg"
            />
          </div>
        );
      case 'pdf':
        return (
          <iframe
            src={file.fileUrl}
            className="w-full h-[60vh] rounded-lg border"
          />
        );
      case 'audio':
      case 'mp3':
      case 'wav':
        return (
          <div className="flex justify-center">
            <audio controls className="w-full max-w-md">
              <source src={file.fileUrl} type={file.type} />
            </audio>
          </div>
        );
      case 'txt':
        return (
          <div className="flex justify-center">
            <pre>{content}</pre>
          </div>
        );
      case 'xls':
      case 'xlsx':
        return (
          <div className="flex justify-center p-4 overflow-auto">
            {loading ? (
              <Spin />
            ) : (
              <div className="excel-preview" dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </div>
        );
      case 'docx':
        return (
          <div className="flex justify-center p-4 min-h-[200px] bg-white overflow-auto">
            {loading && <Spin />}
            <div ref={docxContainerRef} className="w-full" />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-4">
            <img src={getFileIcon(file)} alt="" className="w-16 h-16 mb-4" />
            <p className="text-gray-700">
              {t('chatPage.chatWindow.previewNotSupported')}
            </p>
          </div>
        );
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <img src={getFileIcon(file)} alt="" className="w-6 h-8 mr-2" />
          <span className="truncate max-w-xs">{file.fileName}</span>
        </div>
      }
      open={!!file.fileUrl}
      onCancel={onClose}
      footer={
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => window.open(file.fileUrl, '_blank')}
        >
          {t('chatPage.chatWindow.download')}
        </Button>
      }
      width="60%"
      centered
      closeIcon={<img src={closeIcon} alt="" className="w-4 h-4" />}
      destroyOnClose
    >
      <div className="overflow-auto max-h-[80vh]">{renderFilePreview()}</div>
    </Modal>
  );
};

export default FilePreview;
