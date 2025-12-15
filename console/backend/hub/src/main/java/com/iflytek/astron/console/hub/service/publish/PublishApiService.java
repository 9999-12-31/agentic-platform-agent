package com.iflytek.astron.console.hub.service.publish;

import com.iflytek.astron.console.hub.dto.publish.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

/**
 * @author yun-zhi-ztl
 */
public interface PublishApiService {
    Boolean createApp(CreateAppVo createAppVo);

    List<AppListDTO> getAppList();

    BotApiInfoDTO createBotApi(CreateBotApiVo createBotApiVo, HttpServletRequest request);

    BotApiInfoDTO getApiInfo(Long botId);

    Boolean updateApp(UpdateAppVo updateAppVo);

    Boolean deleteApp(String appId);
}
