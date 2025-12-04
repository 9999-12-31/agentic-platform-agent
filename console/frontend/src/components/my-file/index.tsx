import { ReactElement } from 'react';
import { DeleteOutlined } from '@ant-design/icons';

// 文件类型图标映射
const fileTypeIcons: Record<string, string> = {
  xlsx: 'https://img.icons8.com/color/48/000000/microsoft-excel-2019.png',
  pdf: 'https://img.icons8.com/color/48/000000/pdf.png',
  doc: 'https://img.icons8.com/color/48/000000/microsoft-word-2019.png',
  txt: 'https://img.icons8.com/color/48/000000/txt.png',
};

// 文件数据接口
interface FileItem {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

// 模拟文件数据
const mockFiles: FileItem[] = [
  // 近30天
  { id: '1', name: '医院绩效考核等级评审材料', type: 'xlsx', date: '2025/10/29', size: '17.7 KB' },
  { id: '2', name: '医院绩效考核等级评审材料', type: 'pdf', date: '2025/10/29', size: '17.7 KB' },
  { id: '3', name: '医院绩效考核等级评审材料', type: 'doc', date: '2025/10/29', size: '17.7 KB' },
  { id: '4', name: '医院绩效考核等级评审材料', type: 'txt', date: '2025/10/29', size: '17.7 KB' },
  // 更早
  { id: '5', name: '医院绩效考核等级评审材料', type: 'xlsx', date: '2025/10/29', size: '17.7 KB' },
  { id: '6', name: '医院绩效考核等级评审材料', type: 'pdf', date: '2025/10/29', size: '17.7 KB' },
  { id: '7', name: '医院绩效考核等级评审材料', type: 'doc', date: '2025/10/29', size: '17.7 KB' },
  { id: '8', name: '医院绩效考核等级评审材料', type: 'txt', date: '2025/10/29', size: '17.7 KB' },
];

const MyFile = (): ReactElement => {
  // 将文件分为近30天和更早两部分
  const recentFiles = mockFiles.slice(0, 4);
  const earlierFiles = mockFiles.slice(4);

  // 处理删除文件
  const handleDelete = (id: string) => {
    console.log('Delete file:', id);
    // 实际项目中这里应该调用API删除文件
  };

  // 渲染单个文件项
  const renderFileItem = (file: FileItem) => {
    return (
      <div key={file.id} className="w-64 bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <img 
              src={fileTypeIcons[file.type] || fileTypeIcons.txt} 
              alt={file.type} 
              className="w-10 h-10 mr-2" 
            />
            <div className="flex flex-col">
              <div className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                {file.name}.{file.type}
              </div>
              <div className="text-xs text-gray-500">{file.date}</div>
            </div>
          </div>
          <DeleteOutlined 
            className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
            onClick={() => handleDelete(file.id)}
          />
        </div>
        <div className="text-xs text-gray-500">{file.size}</div>
      </div>
    );
  };

  return (
    <div className="p-4 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">我的文件</h2>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="输入文件名"
            className="border border-gray-300 rounded-l-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button className="bg-blue-500 text-white px-3 py-1 rounded-r-md text-sm hover:bg-blue-600 transition-colors">
            搜索
          </button>
          <button className="ml-2 bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors">
            新增文件
          </button>
        </div>
      </div>

      {/* 近30天 */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">近30天</h3>
        <div className="grid grid-cols-4 gap-4">
          {recentFiles.map(renderFileItem)}
        </div>
      </div>

      {/* 更早 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">更早</h3>
        <div className="grid grid-cols-4 gap-4">
          {earlierFiles.map(renderFileItem)}
        </div>
      </div>
    </div>
  );
};

export default MyFile;
