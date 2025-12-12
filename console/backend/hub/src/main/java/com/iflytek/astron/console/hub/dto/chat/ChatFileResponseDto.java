package com.iflytek.astron.console.hub.dto.chat;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "ChatFileResponseDto", description = "Chat file response DTO")
public class ChatFileResponseDto {

    @Schema(description = "Chat ID")
    private Long chatId;

    @Schema(description = "Child Chat ID")
    private Long childChatId;
 
    @Schema(description = "File ID")
    private String fileId;
 
    @Schema(description = "File URL")
    private String fileUrl;

    @Schema(description = "File name")
    private String fileName;
 
    @Schema(description = "File size")
    private String fileSize;

    @Schema(description = "File extension")
    private String fileExtension;

    @Schema(description = "Create time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}
