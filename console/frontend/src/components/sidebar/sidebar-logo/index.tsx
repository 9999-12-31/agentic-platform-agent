import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import agentLog from '@/assets/imgs/sidebar/agentLog.svg';
import topLogo from '@/assets/imgs/sidebar/topLogo.png';
import agentLogoText from '@/assets/imgs/sidebar/agentLogoText.svg';
import agentLogoTextEn from '@/assets/imgs/sidebar/agent_logo_text_en.svg';
import textLogo from '@/assets/imgs/sidebar/logoText.png';
import { getLanguageCode } from '@/utils/http';

interface SidebarLogoProps {
  isCollapsed: boolean;
  isEnterprise?: boolean;
  enterpriseLogo?: string | undefined;
}

const SidebarLogo = ({
  isCollapsed,
  // TODO:
  isEnterprise = false,
  enterpriseLogo,
}: SidebarLogoProps): ReactElement => {
  const languageCode = getLanguageCode();
  const navigate = useNavigate();

  const handleLogoClick = (): void => {
    navigate('/home');
  };

  if (isEnterprise && enterpriseLogo) {
    return isCollapsed ? (
      <img
        src={enterpriseLogo}
        className="rounded-[6px] cursor-pointer transition-all duration-300 ease-in-out mx-auto"
        alt=""
        style={{
          width: '34px',
          height: '34px',
          opacity: 1,
        }}
        onClick={handleLogoClick}
      />
    ) : (
      <div
        className="flex justify-center h-[25px] w-[190px] cursor-pointer items-center transition-all duration-300 ease-in-out"
        onClick={handleLogoClick}
      >
        <img
          src={enterpriseLogo}
          height={25}
          width={25}
          className="mr-[8px] rounded-[4px] transition-all duration-300 ease-in-out"
          alt=""
        />
        <img
          src={textLogo}
          height={25}
          width={90}
          className="transition-all duration-300 ease-in-out"
          alt=""
        />
      </div>
    );
  }

  return (
    // <img
    //   src={isCollapsed ? agentLog : agentLogoTextEn}
    //   className="w-[190px] cursor-pointer mx-auto"
    //   alt="Astron Agent"
    //   style={{ height: isCollapsed ? '34px' : 'auto' }}
    //   onClick={handleLogoClick}
    // />
    isCollapsed ? (
      <img
        src={topLogo}
        className="w-[190px] cursor-pointer mx-auto"
        alt="Astron Agent"
        style={{ height: isCollapsed ? '44px' : 'auto' }}
        onClick={handleLogoClick}
      />
    ) : (
      <div onClick={handleLogoClick}>
        <img
        src={topLogo}
        className="w-[190px] cursor-pointer mx-auto"
        style={{ height: '56px',width:'56px' }}
        onClick={handleLogoClick}
        />
        <div style={{ textAlign: 'center', fontSize: 'large', fontWeight: "bolder" }}>医院运营管理智能体</div>
      </div>
    )
  );
};

export default SidebarLogo;
