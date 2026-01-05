import {
  ReactElement,
  useEffect,
  useRef,
  MutableRefObject,
  useState,
} from 'react';
import type {
  MessageListType,
  BotInfoType,
  Option,
  UploadFileInfo,
} from '@/types/chat';
import recommendIcon from '@/assets/imgs/chat/recommend.svg';
import rightArrowIcon from '@/assets/imgs/chat/right-arrow.svg';
import LoadingAnimate from '@/constants/lottie-react/chat-loading.json';
import { Progress, Skeleton, Modal } from 'antd';
import useUserStore from '@/store/user-store';
import useChatStore from '@/store/chat-store';
import Lottie from 'lottie-react';
import DeepThinkProgress from './deep-think-progress';
import MarkdownRender from '@/components/markdown-render';
import useBindEvents from '@/hooks/search-event-bind';
import SourceInfoBox from './source-info-box';
import UseToolsInfo from './use-tools-info';
import WorkflowNodeOptions from './workflow-node-options';
import FilePreview from './file-preview';
import ResqBottomButtons from './resq-bottom-buttons';
import { useTranslation } from 'react-i18next';
import FileGridDisplay from './file-grid-display';
const MessageList = (props: {
  messageList: MessageListType[];
  botInfo: BotInfoType;
  isDataLoading: boolean;
  botNameColor: string;
  handleSendMessage: (params: {
    item: string;
    fileUrl?: string;
    callback?: () => void;
  }) => void;
  chatType: string;
  vmsInteractionCmpRef: any;
}): ReactElement => {
  const {
    messageList,
    botInfo,
    isDataLoading,
    botNameColor,
    handleSendMessage,
    chatType,
    vmsInteractionCmpRef,
  } = props;
  const { t } = useTranslation();
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const answerPercent = useChatStore((state: any) => state.answerPercent); //回答进度条
  const isLoading = useChatStore(state => state.isLoading); //是否正在加载
  const streamId = useChatStore(state => state.streamId); //流式回复id
  const workflowOperation = useChatStore(state => state.workflowOperation); //工作流操作
  const { user } = useUserStore();
  const lastClickedQA: MutableRefObject<MessageListType | null> =
    useRef<MessageListType | null>(null);
  const { bindTagClickEvent } = useBindEvents(lastClickedQA);
  const [previewFile, setPreviewFile] = useState<UploadFileInfo>(); //预览文件
  const [inputExample, setInputExample] = useState<string[]>([]);
  const [prologue, setPrologue] = useState<string>('');
  // 选中的选项状态
  const [selectedOptionId, setSelectedOptionId] = useState<{
    id: number;
    option: { id: string };
  } | null>(null);

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');

  // 处理放大按钮点击事件
  const handleZoomIn = (content: string) => {
    setModalContent(content);
    setModalVisible(true);
  };

  // 关闭弹窗
  const handleModalClose = () => {
    setModalVisible(false);
    setModalContent('');
  };

  // 处理节点选项点击
  const handleNodeClick = (option: Option, messageId: number) => {
    setSelectedOptionId({ id: messageId, option });
    handleSendMessage({
      item: JSON.stringify(option),
    });
  };

  useEffect((): void => {
    bindTagClickEvent();
    scrollAnchorRef.current?.scrollIntoView();
  }, [messageList.length, streamId]);

  useEffect((): void => {
    let advancedConfig: any = {};
    if (botInfo?.inputExample?.length > 0) {
      setInputExample(
        botInfo.inputExample?.filter(item => item.length > 0)?.slice(0, 3)
      );
    } else {
      try {
        advancedConfig = JSON.parse(botInfo?.advancedConfig || '{}');
        const inputExample = advancedConfig?.prologue?.inputExample;
        setInputExample(
          inputExample?.filter((item: string) => item.length > 0)?.slice(0, 3)
        );
      } catch (error) {
        setInputExample([]);
      }
    }
    setPrologue(
      botInfo.prologue ||
        advancedConfig?.prologue?.prologueText ||
        botInfo.botDesc ||
        ''
    );
  }, [botInfo]);

  useEffect(() => {
    // console.log('isLoading   '+isLoading);
    // console.log('answerPercent   '+answerPercent);
  }, [isLoading, answerPercent]);

  //渲染全新开始
  const renderRestart = (): ReactElement => {
    return (
      <div className="flex items-center w-full mx-5 text-[#c4c4c8]">
        <div className="flex-1 h-[1px] bg-[#e3e4e9]" />
        <div className="px-4 py-1.5">{t('chatPage.chatWindow.freshStart')}</div>
        <div className="flex-1 h-[1px] bg-[#e3e4e9]" />
      </div>
    );
  };

  // 渲染Header和推荐内容的函数 - 在column-reverse中需要反序渲染
  const renderHeaderAndRecommend = (): ReactElement => (
    <>
      {(inputExample?.length > 0 || prologue?.length > 0) && (
        <div className="p-6 pb-5 rounded-2xl bg-white/50 mt-8 w-[inherit]">
          <div className="text-lg font-medium text-gray-800 w-full">
            <MarkdownRender content={`👋Hi，${prologue}`} isSending={false} />
          </div>
          {inputExample?.map((item: string, index: number) => (
            <div
              className="h-12 flex items-center mb-2 bg-white border border-[#e4eaff] rounded-xl px-4 cursor-pointer text-sm font-normal transition-all duration-200 ease-in-out hover:border-[#6356EA]"
              key={index}
              onClick={() =>
                handleSendMessage({
                  item: item,
                })
              }
            >
              <img src={recommendIcon} alt="" className="w-[18px] h-[18px]" />
              <span className="flex-1 mx-3 truncate">{item}</span>
              <img
                src={rightArrowIcon}
                alt=""
                className="w-4 h-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
              />
            </div>
          ))}
        </div>
      )}

      {chatType === 'text' && (
        <div className="flex flex-col items-center justify-center mt-10 min-h-[116px]">
          {isDataLoading ? (
            <>
              <Skeleton.Avatar active size={88} style={{ borderRadius: 12 }} />
              <Skeleton.Input
                active
                size="small"
                style={{ width: 120, marginTop: 8 }}
              />
            </>
          ) : (
            <>
              <img
                src={botInfo.avatar}
                alt="avatar"
                className="w-[88px] h-[88px] rounded-xl"
              />
              <span
                className={`text-2xl font-[PingFang SC] font-medium mt-2 text-[${botNameColor}] leading-9`}
              >
                {botInfo.botName}
              </span>
            </>
          )}
        </div>
      )}
    </>
  );

  //渲染问题

  const renderReq = (item: MessageListType): ReactElement => {
    return (
      <div
        key={item.id}
        className="max-w-[90%] text-white py-2.5 flex flex-row-reverse leading-[1.4] ml-auto h-auto"
      >
        <img src={user?.avatar} alt="" className="h-9 w-9 rounded-full ml-4" />
        <div className="bg-[#6356EA] rounded-[12px_0px_12px_12px] p-[14px_19px] relative max-w-full">
          <div className="text-base font-normal text-white leading-[25px] whitespace-pre-wrap w-auto break-words">
            {item.message}
          </div>
          {item?.chatFileList && (
            <FileGridDisplay files={item?.chatFileList} autoAdjustCols />
          )}
        </div>
      </div>
    );
  };

  //渲染回复
  const renderResp = (
    item: MessageListType,
    messageIndex: number
  ): ReactElement => {
    const showLoading = !item.sid && (isLoading || !!answerPercent);
    const workflowContent = item?.workflowEventData?.content;
    const messageContent = workflowContent ? workflowContent : item.message;
    const isLastMessage = messageIndex === messageList.length - 1; //是否是最后一条消息
    const containsIframe = messageContent?.includes('<iframe'); //判断是否包含iframe
    
    if (isLastMessage) {
      console.log('item    ' + !item.sid);
      console.log('isLoading   ' + isLoading);
      console.log('answerPercent   ' + !!answerPercent);
      console.log('showLoading   ' + showLoading);
    }
    return (
      <div
        className="mt-[14px] w-[inherit] max-w-full"
        onClick={() => (lastClickedQA.current = item)}
      >
        <div className="flex w-full mb-3">
          <img
            src={botInfo.avatar}
            alt="avatar"
            className="w-9 h-9 rounded-full mr-4 object-cover"
          />
          <div className="bg-white rounded-[0px_12px_12px_12px] p-[14px_19px] w-auto text-[#333333] max-w-full min-w-[10%] relative">
            {showLoading && (
              <div className="flex items-center w-auto max-w-xs mb-2">
                <Lottie
                  animationData={LoadingAnimate}
                  loop={true}
                  className="w-[30px] h-[30px] mr-1"
                  rendererSettings={{
                    preserveAspectRatio: 'xMidYMid slice',
                  }}
                />
                <span className="text-sm text-gray-500">
                  {t('chatPage.chatWindow.answeringInProgress')}
                </span>
                {!!answerPercent && (
                  <Progress
                    percent={answerPercent}
                    size="small"
                    strokeColor="#6178FF"
                    className="ml-2 flex-1"
                  />
                )}
              </div>
            )}

            {/* 使用工具 */}
            <UseToolsInfo
              allToolsList={item?.tools || []}
              loading={!isLoading && !!streamId}
            />
            {/* 思考链 */}
            <DeepThinkProgress answerItem={item} />
            {/* 回答内容 */}
            <div className="relative">
              <MarkdownRender
                content={messageContent}
                isSending={!!streamId && !item.sid}
              />
              {/* 放大按钮 */}
              {containsIframe && (
                  <button
                      className="absolute top-0 right-5 text-gray-600 p-1 rounded-full transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止事件冒泡
                        handleZoomIn(messageContent);
                      }}
                      title="放大查看"
                  >
                    {/*<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"*/}
                    {/*     strokeLinecap="round" strokeLinejoin="round">*/}
                    {/*  <circle cx="11" cy="11" r="8"></circle>*/}
                    {/*  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>*/}
                    {/*  <line x1="11" y1="8" x2="11" y2="14"></line>*/}
                    {/*  <line x1="8" y1="11" x2="14" y2="11"></line>*/}
                    {/*</svg>*/}
                    <svg width="16" height="16" t="1767574964361" className="icon" viewBox="0 0 1024 1024" version="1.1"
                         xmlns="http://www.w3.org/2000/svg" p-id="3802" >
                      <path
                          d="M853.333333 0h-682.666666C75.093333 0 0 75.093333 0 170.666667v682.666666C0 948.906667 75.093333 1024 170.666667 1024h682.666666c95.573333 0 170.666667-75.093333 170.666667-170.666667v-682.666666C1024 75.093333 948.906667 0 853.333333 0zM955.733333 853.333333c0 54.613333-47.786667 102.4-102.4 102.4h-682.666666c-54.613333 0-102.4-47.786667-102.4-102.4v-682.666666C68.266667 116.053333 116.053333 68.266667 170.666667 68.266667h682.666666c54.613333 0 102.4 47.786667 102.4 102.4v682.666666z"
                          fill="#777777" p-id="3803"></path>
                      <path
                          d="M402.773333 573.44L204.8 771.413333V648.533333c0-20.48-13.653333-34.133333-34.133333-34.133333s-34.133333 13.653333-34.133334 34.133333v204.8c0 20.48 13.653333 34.133333 34.133334 34.133334h204.8c20.48 0 34.133333-13.653333 34.133333-34.133334s-13.653333-34.133333-34.133333-34.133333H252.586667l197.973333-197.973333c13.653333-13.653333 13.653333-34.133333 0-47.786667-13.653333-13.653333-34.133333-13.653333-47.786667 0zM853.333333 136.533333h-204.8c-20.48 0-34.133333 13.653333-34.133333 34.133334s13.653333 34.133333 34.133333 34.133333h122.88L573.44 402.773333c-13.653333 13.653333-13.653333 34.133333 0 47.786667 13.653333 13.653333 34.133333 13.653333 47.786667 0L819.2 252.586667v122.88c0 20.48 13.653333 34.133333 34.133333 34.133333s34.133333-13.653333 34.133334-34.133333v-204.8c0-20.48-13.653333-34.133333-34.133334-34.133334z"
                          fill="#777777" p-id="3804"></path>
                    </svg>
                  </button>
              )}
            </div>
            <WorkflowNodeOptions
                message={item}
                isLastMessage={isLastMessage}
                workflowOperation={workflowOperation}
                selectedOptionId={selectedOptionId}
                onOptionClick={handleNodeClick}
            />
          </div>
        </div>
        {item?.sid && <SourceInfoBox traceSource={item?.traceSource}/>}
        {item?.sid && (
            <ResqBottomButtons
                message={item}
                isLastMessage={isLastMessage}
                chatType={chatType}
            />
        )}
      </div>
    );
  };

  return (
      <div
          className={`relative w-full flex flex-col flex-1 overflow-hidden scrollbar-hide  `}
      >
        <div
            className="w-full flex flex-col-reverse items-center overflow-y-auto min-h-0  pl-6"
            style={{
              scrollbarWidth: 'none',
            }}
        >
          <div
              className={`w-full flex flex-col-reverse items-center max-w-[960px] min-h-min scrollbar-hide m-[0_auto] ${
                  chatType === 'text' ? 'pr-0' : 'pr-52'
              }`}
          >
            <div ref={scrollAnchorRef}/>

            {/* 直接渲染消息列表 */}
            {messageList
                .slice()
                .reverse()
                .map((item: MessageListType, index: number) => {
                  const actualIndex = messageList.length - 1 - index; // 计算真实的消息索引
                  return (
                      <div className="w-[inherit]" key={actualIndex}>
                        {item?.reqType === 'USER' && renderReq(item)}
                        {item?.reqType === 'BOT' && renderResp(item, actualIndex)}
                  {/*{item?.reqType === 'START' && renderRestart()}*/}
                </div>
              );
            })}

          {renderHeaderAndRecommend()}
        </div>
      </div>
      <FilePreview
        file={previewFile || ({} as UploadFileInfo)}
        onClose={() => setPreviewFile({} as UploadFileInfo)}
      />
      {/* iframe放大弹窗 */}
      <Modal
        title=""
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={'90%'}
        style={{ top: 20 }}
        styles={{
          body: {
            height: 'calc(100vh - 100px)',
            overflowY: 'auto',
          },
        }}
      >
        <div className="iframe-preview-container p-4">
          <MarkdownRender content={modalContent} isSending={false} />
          {/*<div style={{height:'2000px'}}>455555</div>*/}
        </div>
      </Modal>
    </div>
  );
};

export default MessageList;
