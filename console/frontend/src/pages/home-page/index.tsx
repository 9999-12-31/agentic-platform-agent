/*
 * @Author: snoopyYang
 * @Date: 2025-09-23 10:14:36
 * @LastEditors: snoopyYang
 * @LastEditTime: 2025-09-23 10:14:45
 * @Description: 首页：智能体广场
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCommonConfig } from '@/services/common';
import {
  getAgentType,
  getAgentList,
  collectBot,
  cancelFavorite,
} from '@/services/agent-square';
import styles from './index.module.scss';
import { Input, message, Popover, Spin, Tooltip } from 'antd';
import classnames from 'classnames';
import eventBus from '@/utils/event-bus';
import { debounce } from 'lodash';
import useChat from '@/hooks/use-chat';
import useUserStore from '@/store/user-store';
import useHomeStore from '@/store/home-store';
import { getLanguageCode } from '@/utils/http';
import { BotType, Bot, SearchBotParam, Banner } from '@/types/agent-square';
import type { ResponseResultPage } from '@/types/global';
import { handleShare } from '@/utils';
import { useLocaleStore } from '@/store/spark-store/locale-store';
import dayjs from 'dayjs';
import chatIcon from '@/assets/imgs/main/chat-bot.svg';
import { getInputsType } from '@/services/flow';

const PAGE_SIZE = 10;

const PAGE_INFO_ORIGIN: SearchBotParam = {
  search: '',
  page: 1,
  pageSize: PAGE_SIZE,
  type: 0,
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const currentLang = getLanguageCode();

  const [bannerList] = useState<Banner[]>([
    // NOTE: isOpen: open new page
    {
      src: '/assets/xfyun-resources/agentRewardBanner.png',
      srcEn: '/assets/xfyun-resources/agentRewardBanner.png',
      url: `${window.location.origin}/activitySummer`,
      isOpen: false,
    },
    {
      src: '/assets/xfyun-resources/banner01-07.28.jpg',
      srcEn: '/assets/xfyun-resources/banner-en02.jpg',
      url: `${window.location.origin}/chat?sharekey=e1e62e4027b882aa7a43d4b25ed4974c&botId=2963659`,
      isOpen: false,
    },
    {
      src: '/assets/xfyun-resources/banner02-07.28.jpg',
      srcEn: '/assets/xfyun-resources/banner-en03.jpg',
      url: `${window.location.origin}/chat?sharekey=b17abc6f0d4a356ed09a9fe1631ffd2c&botId=2958065`,
      isOpen: false,
    },
    {
      src: '/assets/xfyun-resources/banner03-07.28.jpg',
      srcEn: '/assets/xfyun-resources/banner-en04.jpg',
      url: `${window.location.origin}/chat?sharekey=003e4873f478e5f1f9ed82930d0bb4e7&botId=2216831`,
      isOpen: false,
    },
    {
      src: '/assets/xfyun-resources/banner04-07.28.jpg',
      srcEn: '/assets/xfyun-resources/banner-en05.jpg',
      url: `${window.location.origin}/chat?sharekey=9991b23791117619a3c3608a44c1c499&botId=2813049`,
      isOpen: false,
    },
  ]);
  const [botTypes, setBotTypes] = useState<BotType[]>([]);
  const {
    botType,
    botOrigin,
    scrollTop,
    loadingPage,
    searchInputValue,
    setBotType,
    setBotOrigin,
    setLoadingPage,
    setSearchInputValue,
  } = useHomeStore();
  const homeRef = useRef<HTMLDivElement>(null);
  const [pageInfo, setPageInfo] = useState<SearchBotParam>(PAGE_INFO_ORIGIN); // page info
  const [searchLoading, setSearchLoading] = useState<boolean>(false); // is searching
  const [agentList, setAgentList] = useState<Bot[]>([]); // bot list
  const [loading, setLoading] = useState(false); // loading more
  const [hasMore, setHasMore] = useState(true); // has more data
  const onGettingPage = useRef(false);
  const user = useUserStore((state: any) => state.user);
  const { handleToChat } = useChat();
  const [pendingBotTypeChange, setPendingBotTypeChange] = useState<
    number | null
  >(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { locale: localeNow } = useLocaleStore();

  // filter banner by language
  const filteredBanners: Banner[] = bannerList
    .filter((banner: Banner) => currentLang !== 'en' || banner.srcEn)
    .map((banner: Banner) => ({
      ...banner,
      src: currentLang === 'en' ? banner.srcEn : banner.src,
    }));

  // handle banner click
  const handleBannerClick = (item: Banner): void => {
    if (item.url) {
      if (item.isOpen) {
        window.open(item.url, '_blank');
      } else {
        window.location.href = item.url;
      }
    }
  };

  // get agent type list
  const loadAgentTypeList = async (): Promise<void> => {
    setBotTypes([]);
    const res: BotType[] = await getAgentType();
    const botList: BotType[] = [
      {
        typeKey: null,
        typeName: '全部',
        icon: '',
        typeNameEn: null,
      },
      ...res,
    ];
    setBotTypes(botList || []);
    setBotType(botList[0]?.typeKey || null);
    setPageInfo({
      ...pageInfo,
      type: botList[0]?.typeKey || null,
      search: searchInputValue || '',
    });
  };

  // search box prefix icon
  const prefixIcon = (): React.ReactNode => {
    return <img src={require('@/assets/svgs/search.svg')} alt="" />;
  };

  // start search
  const handleStartSearch = (value: string, pageInfo: SearchBotParam) => {
    setBotOrigin('search');
    setSearchLoading(true);
    setAgentList([]);
    setPageInfo({
      ...pageInfo,
      search: value,
      page: 1,
    });
  };
  // switch bot type
  const handleBotTypeChange = async (type: number): Promise<void> => {
    onGettingPage.current = false;
    setAgentList([]);
    setPageInfo({
      ...pageInfo,
      type,
      search: '',
      page: 1,
    });
    setHasMore(true);
    setSearchLoading(true);
    setSearchInputValue('');
    setBotType(type);
  };

  /**
   * load more agent list data
   * @param customPageIndex custom page index
   * @returns
   */
  const loadMore = (customPageIndex?: number): Promise<void> => {
    return new Promise(resolve => {
      setLoading(true);
      const currentPageIndex = customPageIndex || pageInfo.page + 1;
      const newPageInfo = {
        ...pageInfo,
        page: currentPageIndex,
      };
      setPageInfo(newPageInfo);
      resolve(void 0);
    });
  };
  /**
   * load all agent list
   */
  const loadAgentListAll = (): void => {
    getAgentList({ ...pageInfo })
      .then((res: ResponseResultPage<Bot>) => {
        setAgentList(prevList => {
          // 当加载第一页时，清空现有列表，避免重复内容
          const newList = pageInfo.page === 1 ? res.pageData : [...prevList, ...res.pageData];
          setHasMore(res.totalCount > newList.length);
          return newList;
        });
        setSearchLoading(false);
      })
      .catch(err => {
        setSearchLoading(false);
        message.error(err?.msg || t('networkError'));
      })
      .finally(() => {
        setLoading(false);
        onGettingPage.current = false;
      });
  };

  /**
   * collect or cancel collect bot
   * @param item
   * @param e
   */
  const handleCollect = (
    item: Bot,
    e: React.MouseEvent<HTMLDivElement>
  ): void => {
    e.stopPropagation();
    if (!item?.isFavorite) {
      collectBot({
        botId: item.botId,
      })
        .then(() => {
          message.success(t('home.collectionSuccess'));
          eventBus.emit('getFavoriteBotList');
          updateBotList(item.botId, true);
        })
        .catch(err => {
          message.error(err?.msg || t('networkError'));
        });
    } else {
      cancelFavorite({
        botId: item.botId,
      })
        .then(() => {
          message.success(t('home.cancelCollectionSuccess'));
          eventBus.emit('getFavoriteBotList');
          updateBotList(item.botId, false);
        })
        .catch(err => {
          message.error(err?.msg);
        });
    }
  };

  // update bot list
  const updateBotList = (botId: string | number, isFavorite: boolean) => {
    setAgentList((agents: Bot[]) => {
      const currentBot: Bot | undefined =
        agents.find((t: Bot) => t.botId === botId) || ({} as Bot);
      currentBot.isFavorite = isFavorite;
      return [...agents];
    });
  };

  // observer favorite change
  const handleFavoriteChange = (botId: string | number) => {
    if (botId) {
      updateBotList(botId, false);
    }
  };

  useEffect(() => {
    const params = {
      category: 'DOCUMENT_LINK',
      code: 'SparkBotHelpDoc',
    };
    if (user?.login || user?.uid) {
      getCommonConfig(params);
    }
    loadAgentTypeList();
    eventBus.on('favoriteChange', handleFavoriteChange);
    // 监听菜单列表删除对话事件，当当前页面是home页时重新加载agent列表
    const handleRefreshAgentList = () => {
      setPageInfo({
        ...PAGE_INFO_ORIGIN,
        type: botType,
        search: searchInputValue || '',
      });
    };
    eventBus.on('refreshAgentList', handleRefreshAgentList);
    return () => {
      eventBus.off('favoriteChange', handleFavoriteChange);
      // 移除事件监听
      eventBus.off('refreshAgentList', handleRefreshAgentList);
    };
  }, [botType, searchInputValue]);

  const handleSearch = useCallback(
    debounce((value, pageInfo) => {
      handleStartSearch(value, pageInfo);
    }, 500),
    [handleBotTypeChange, handleStartSearch]
  );
  const debouncedSearchRef = useRef(handleSearch);

  // observe scrollTop change, if there is a pending botType change, execute
  useEffect(() => {
    if (pendingBotTypeChange !== null && scrollTop === 0) {
      handleBotTypeChange(pendingBotTypeChange);
      setPendingBotTypeChange(null);
    }
  }, [scrollTop, pendingBotTypeChange]);

  // IntersectionObserver observe sentinel element, implement infinite scroll loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // sentinel element enter or near viewport
          if (
            entry.isIntersecting &&
            !loading &&
            hasMore &&
            !onGettingPage.current &&
            !searchLoading
          ) {
            onGettingPage.current = true;
            loadMore()
              .then(() => {
                setLoadingPage(loadingPage + 1);
              })
              .catch(err => {
                onGettingPage.current = false;
              });
          }
        });
      },
      {
        root: homeRef.current, // homeRef container as root element
        rootMargin: '100px', // before 100px
        threshold: 0, // sentinel element just enter
      }
    );

    // observe sentinel element
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, onGettingPage, searchLoading, loadingPage, loadMore]);

  const handleValueChange = (e: any) => {
    const value = e.target.value;
    setSearchInputValue(value);
    debouncedSearchRef.current(value, pageInfo);
  };

  // share bot
  const handleShareAgent = async (botInfo: Bot): Promise<void> => {
    await handleShare(botInfo.botName, botInfo.botId, t);
  };

  // 渲染助手列表
  const renderCardWrapper = () => {
    return (
      <div className={styles.card_wrapper}>
        {searchLoading ? (
          <div className={styles.loading_wrapper}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {agentList?.length > 0 ? (
              <div className={styles.recent_card_wrapper}>
                <div
                  className={classnames(
                    styles.recent_card_list,
                    styles.recent_recent
                  )}
                >
                  {agentList.map((item: Bot, index: number) => (
                    <div
                      className={styles.recent_card_item}
                      key={index}
                      onClick={() => handleToChat(item?.botId,item.chatId)}
                    >
                      <div className={styles.info}>
                        <div className={styles.bot_info}>
                          <img
                            src={item?.botCoverUrl}
                            alt=""
                            className={styles.bot_avatar}
                          />
                          <div className={styles.bot_info_content}>
                            <div className={styles.title}>
                              <span>{item?.botName}</span>
                              <div onClick={e => e.stopPropagation()}>
                                {/*<div onClick={() => handleShareAgent(item)} />*/}
                                <div
                                  className={classnames({
                                    [styles.collect as string]:
                                      !!item?.isFavorite,
                                  })}
                                  onClick={e => {
                                    handleCollect(item, e);
                                  }}
                                />
                              </div>
                            </div>
                            <Tooltip
                              placement="bottomLeft"
                              title={item?.botDesc}
                              arrow={false}
                              overlayClassName="black-tooltip"
                            >
                              <div className={styles.desc}>{item?.botDesc}</div>
                            </Tooltip>
                          </div>
                        </div>

                        <div className={styles.author}>
                          <div className={styles.author_info}>
                            {/*<img*/}
                            {/*  src={require('@/assets/imgs/home/author.svg')}*/}
                            {/*  alt=""*/}
                            {/*/>*/}
                            {/*<span>*/}
                            {/*  {item?.creator || t('home.officialAssistant')}*/}
                            {/*</span>*/}
                            <span>
                              更新于
                              {dayjs(item?.updateTime).format('YYYY-MM-DD')}
                            </span>
                          </div>
                          {/*<div className={styles.tags}>*/}
                          {/*  {item?.version &&*/}
                          {/*    [1, 5].includes(item?.version) && (*/}
                          {/*      <div className={styles.itag}>*/}
                          {/*        {t('home.instructionType')}*/}
                          {/*      </div>*/}
                          {/*    )}*/}
                          {/*  {item?.version &&*/}
                          {/*    [2, 3, 4].includes(item?.version) && (*/}
                          {/*      <div className={styles.itag}>*/}
                          {/*        {t('home.workflowType')}*/}
                          {/*      </div>*/}
                          {/*    )}*/}
                          {/*</div>*/}
                          <div
                            className="card-chat cursor-pointer flex justify-center items-center mr-2"
                            style={{
                              width: '76px',
                              height: '32px',
                              background: '#F1F0FF',
                              borderRadius: '6px',
                              textAlign: 'center',
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              handleToChat(item.botId,item.chatId);
                            }}
                          >
                            <img src={chatIcon} alt="" />
                            <span
                              className="ml-1 whitespace-nowrap"
                              style={{ color: '#222529', fontSize: '14px' }}
                            >
                              {t('agentPage.agentPage.chat')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* observer sentinel element */}
                  <div ref={sentinelRef} style={{ height: '1px' }} />
                </div>
              </div>
            ) : (
              <div className={styles.good_card_list}>
                <div className={styles.empty_state}>
                  <img src={'/assets/xfyun-resources/组1@2x.png'} alt="" />
                  <span
                    onClick={() => {
                      eventBus.emit('createBot');
                    }}
                  >
                    {t('home.noRelatedSearchResults')}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  useEffect(() => {
    loadAgentListAll();
  }, [pageInfo]);

  return (
    <div className={styles.homeWrapper} ref={homeRef}>
      <div className={styles.home}>
        <div className={styles.all_agent}>
          <div className={styles.all_agent_title}>
            <div className={styles.all_agent_title_left}>
              {botTypes.map((item: BotType) => (
                <div
                  key={item.typeKey}
                  className={classnames(styles.bot_type_item, 'relative', {
                    [styles.activeTab as string]: botType === item.typeKey,
                  })}
                  onClick={() => {
                    handleBotTypeChange(item.typeKey);
                  }}
                >
                  {localeNow === 'en' ? item.typeNameEn : item.typeName}
                </div>
              ))}
            </div>
            <div className={styles.all_agent_title_right}>
              <Input
                placeholder={t('home.searchPlaceholder')}
                value={searchInputValue}
                onChange={e => {
                  handleValueChange(e);
                }}
                prefix={prefixIcon()}
              />
            </div>
          </div>
          {renderCardWrapper()}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
