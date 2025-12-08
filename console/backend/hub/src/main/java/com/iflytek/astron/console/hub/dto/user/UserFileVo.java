package com.iflytek.astron.console.hub.dto.user;

import lombok.Data;

@Data
public class UserFileVo {

    /**
     * File ID
     */
    private String fileId;
    /**
     * File URL
     */
    private String fileUrl;
    /**
     * File name
     */
    private String fileName;
    /**
     * File size
     */
    private Long fileSize;
     /**
     * File extension
     */
    private String fileExtension;

}
