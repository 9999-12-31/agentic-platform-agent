import { ReactElement, useState, useEffect } from 'react';
import collapseGrayIcon from '@/assets/imgs/sidebar/collapseGray.svg';
import SidebarLogo from './sidebar-logo';
import CreateButton from './create-button';
import BottomLogin from './bottom-login';
import PersonalCenter from './personal-center';
import MenuList from './menu-list';
import IconEntry from './icon-entry';
import NoticeModal from './notice-modal';
import useUserStore from '@/store/user-store';
import {getChatHistory, postChatList} from '@/services/chat';
import { getFavoriteList } from '@/services/agent-square';
import { PostChatItem, FavoriteEntry } from '@/types/chat';
import eventBus from '@/utils/event-bus';
import CreateApplicationModal from '@/components/create-application-modal';
import { getMessageCountApi } from '@/services/notification';
import {useUserStoreHook} from "@/hooks/use-user-store";
import {formatHistoryToMessages} from "@/utils";

const PAGE_SIZE = 45;
const DEFAULT_PAGE_INFO = {
  searchValue: '',
  pageIndex: 1,
  pageSize: PAGE_SIZE,
  botType: '',
};

const Sidebar = (): ReactElement => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPersonCenterOpen, setIsPersonCenterOpen] = useState(false);
  const [noticeModalVisible, setNoticeModalVisible] = useState(false);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Shared chat data state
  const [mixedChatList, setMixedChatList] = useState<PostChatItem[]>([]);
  const [favoriteBotList, setFavoriteBotList] = useState<FavoriteEntry[]>([]);
  const getIsLogin = useUserStore.getState().getIsLogin;
  const { isAdmin } = useUserStoreHook();
  // 获取消息数量
  const getMessageCount = async () => {
    const res = await getMessageCountApi();
    setUnreadCount(res);
  };

  // Page info for favorites
  const PAGE_SIZE = 45;
  const pageInfo = {
    searchValue: '',
    pageIndex: 1,
    pageSize: PAGE_SIZE,
    botType: '',
  };

  // 获取对话历史
  const getChatHistoryData = async (id: number): Promise<void> => {
    const res = await getChatHistory(id);
    // 计算新的historyList数据
    const newHistoryList = res.filter((historyItem: any) => historyItem.historyList.length>0)
        .map((historyItem: any) => {return historyItem.historyList[0]});

    setMixedChatList(prevList => prevList.map(chatItem => 
      chatItem.id === id 
        ? { ...chatItem, historyList: newHistoryList }
        : chatItem
    ));
  };

  const getChatList = async () => {
    try {
      const res = await postChatList();
      setMixedChatList(res);
    } catch (error) {
      console.log(error);
    }
  };

  const getFavoriteBotListLocal = async () => {
    try {
      const res = await getFavoriteList(DEFAULT_PAGE_INFO);
      setFavoriteBotList(res.pageList);
    } catch (error) {
      console.log(error);
    }
  };

  const createBot = () => {
    setApplicationModalVisible(true);
  };

  useEffect(() => {
    getChatList();
    getFavoriteBotListLocal();
    getMessageCount();

    eventBus.on('chatListChange', getChatList);
    eventBus.on('favoriteChange', getFavoriteBotListLocal);
    eventBus.on('createBot', createBot);

    return () => {
      eventBus.off('createBot', createBot);
      eventBus.off('chatListChange', getChatList);
      eventBus.off('favoriteChange', getFavoriteBotListLocal);
    };
  }, []);

  return (
    <div
      className={`
        relative bg-white flex flex-col flex-shrink-0 h-full
        pt-[22px] px-4 pb-4
        ${isCollapsed ? 'w-[76px] items-center justify-between' : 'w-[220px]'}
      `}
    >
      <div
        className="
          absolute -right-4 top-1/2 -translate-y-1/2 z-[997] 
          flex items-center justify-center
          w-8 h-8 bg-white rounded-full cursor-pointer
          shadow-[0px_0px_20px_0px_rgba(0,18,70,0.08)]
          hover:bg-[#6356EA] transition-colors duration-300
          group
        "
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <img
          src={collapseGrayIcon}
          alt="collapse"
          className={`
            transform rotate-180 transition-all duration-300 cursor-pointer z-[998]
            group-hover:brightness-0 group-hover:saturate-100 group-hover:invert
            ${isCollapsed ? 'rotate-[360deg]' : 'rotate-180'}
          `}
        />
      </div>
      <div className="flex flex-col h-full">
        <SidebarLogo isCollapsed={isCollapsed} />
        {isAdmin && <CreateButton isCollapsed={isCollapsed} />}
        <MenuList
          isCollapsed={isCollapsed}
          mixedChatList={mixedChatList}
          onRefreshData={(chatListId?:number) => {
            console.log(chatListId);
            getChatList();
            getFavoriteBotListLocal();
            if (chatListId) {
              getChatHistoryData(chatListId)
            }
            

          }}
          onChatHistoryData={getChatHistoryData}
        />
        {/*<IconEntry*/}
        {/*  onMessageClick={() => {*/}
        {/*    setNoticeModalVisible(true);*/}
        {/*  }}*/}
        {/*  isCollapsed={isCollapsed}*/}
        {/*  unreadCount={unreadCount}*/}
        {/*/>*/}
        <BottomLogin
          isCollapsed={isCollapsed}
          isPersonCenterOpen={isPersonCenterOpen}
          setIsPersonCenterOpen={setIsPersonCenterOpen}
        />
        <PersonalCenter
          open={isPersonCenterOpen}
          onCancel={() => {
            setIsPersonCenterOpen(false);
          }}
          mixedChatList={mixedChatList}
          favoriteBotList={favoriteBotList}
          onRefreshData={() => {
            getChatList();
            getFavoriteBotListLocal();
          }}
          onRefreshRecentData={getChatList}
          onRefreshFavoriteData={getFavoriteBotListLocal}
        />
        <NoticeModal
          open={noticeModalVisible}
          onClose={() => {
            setNoticeModalVisible(false);
          }}
          onMessageRead={getMessageCount}
        />
        <CreateApplicationModal
          visible={applicationModalVisible}
          onCancel={() => {
            setApplicationModalVisible(false);
          }}
        />
      </div>
    </div>
  );
};

export default Sidebar;
