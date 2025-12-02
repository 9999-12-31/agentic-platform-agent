package com.iflytek.astron.console.hub.service.user;

import com.iflytek.astron.console.hub.dto.user.UserFileVo;

public interface UserFileService {
    /**
     * Save user file
     *
     * @param uid User ID
     * @param vo  User file information
     * @return UserFileVo containing file information
     */
    UserFileVo saveFile(String uid, UserFileVo vo);
}
