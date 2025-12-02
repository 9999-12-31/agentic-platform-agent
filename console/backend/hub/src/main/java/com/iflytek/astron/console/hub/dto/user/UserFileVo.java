package com.iflytek.astron.console.hub.dto.user;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class UserFileVo {
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

    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}
