package com.iflytek.astron.console.hub.service.user;

import java.util.List;

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

    /**
     * Get all user files
     *
     * @param uid User ID
     * @param vo  User file information
     * @return List of UserFileVo containing file information
     */
    List<UserFileVo> getAllFiles(String uid, UserFileVo vo);

    /**
     * Delete user file
     *
     * @param uid     User ID
     * @param fileId  File ID
     * @return Boolean indicating success or failure
     */
    Boolean deleteFile(String uid, String fileId);
}
