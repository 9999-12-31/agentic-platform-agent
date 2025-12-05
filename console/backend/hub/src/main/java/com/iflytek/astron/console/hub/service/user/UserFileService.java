package com.iflytek.astron.console.hub.service.user;

import java.util.List;

import com.iflytek.astron.console.hub.dto.user.UserFileResponseDto;
import com.iflytek.astron.console.hub.dto.user.UserFileVo;

public interface UserFileService {
    /**
     * Save user file
     *
     * @param uid User ID
     * @param vo  User file information
     * @return UserFileResponseDto containing file information
     */
    UserFileResponseDto saveFile(String uid, UserFileVo vo);

    /**
     * Get all user files
     *
     * @param uid User ID
     * @param vo  User file information
     * @return List of UserFileResponseDto containing file information
     */
    List<UserFileResponseDto> getAllFiles(String uid, UserFileVo vo);

    /**
     * Delete user file
     *
     * @param uid     User ID
     * @param fileId  File ID
     * @return Boolean indicating success or failure
     */
    Boolean deleteFile(String uid, String fileId);
}
