import React, { useState } from 'react';
import LoadingAnimate from '@/constants/lottie-react/chat-loading.json';
import Lottie from 'lottie-react';
import { useTranslation } from 'react-i18next';
import { MessageListType } from '@/types/chat';
import MarkdownRender from '@/components/markdown-render';

const DeepThinkProgress: React.FC<{
  answerItem?: MessageListType;
}> = ({ answerItem }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  if (!answerItem?.reasoning) {
    return null;
  }
  const thinkComplete = Boolean(answerItem.message || answerItem.sid);
  const renderThinkText = () => {
    return (
      <div className="flex relative">
        <div className="w-auto flex mr-2.5 flex-col items-center">
          {!thinkComplete ? (
            <div className="flex justify-center">
              <Lottie
                animationData={LoadingAnimate}
                loop={true}
                className="w-[26px] h-[26px]"
                rendererSettings={{
                  preserveAspectRatio: 'xMidYMid slice',
                }}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center w-full h-7">
              <img
                src="/assets/xfyun-resources/scaasc.svg"
                alt=""
                className="w-[13px] h-[13px] flex-shrink-0"
              />
            </div>
          )}

          <div className="w-0.5 h-full flex-1 bg-[#dfdfdf]" />
        </div>
        <div className="pt-1 pb-2.5 min-h-10 reasoning-markdown">
          <MarkdownRender
            content={answerItem?.reasoning}
            isSending={!thinkComplete}
          />
        </div>
      </div>
    );
  };
  return (
    <div
      className={`text-sm text-[#838a95] my-2.5 ${
        !open ? 'h-6 overflow-hidden' : ''
      }`}
    >
      <div
        className="w-full h-6 cursor-pointer flex items-center pb-2.5 select-none tracking-wider"
        onClick={() => {
          setOpen(!open);
        }}
      >
        {t('chatPage.deepThinkProgress.title')}
        <img
          src="/assets/xfyun-resources/vasvasavs.svg"
          alt=""
          className={`w-2 h-auto ml-1 transition-transform duration-200 ${
            !open ? 'rotate-180' : ''
          }`}
        />
      </div>
      {renderThinkText()}
      {thinkComplete ? (
        <div className="flex items-center">
          <img
            src="/assets/xfyun-resources/scaasc.svg"
            alt=""
            className="mr-2.5"
          />
          {t('chatPage.deepThinkProgress.endTip')}
        </div>
      ) : null}
    </div>
  );
};

export default React.memo(DeepThinkProgress);


