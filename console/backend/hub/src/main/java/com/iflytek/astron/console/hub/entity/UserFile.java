package com.iflytek.astron.console.hub.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_file")
@Schema(name = "UserFile", description = "User file table")
public class UserFile {

    @TableId(type = IdType.AUTO)
    @Schema(description = "Non-business primary key")
    private Long id;

    @Schema(description = "Owner UID")
    private String uid;

    @Schema(description = "File ID")
    private String fileId;

    @Schema(description = "File URL")
    private String fileUrl;

    @Schema(description = "File name")
    private String fileName;

    @Schema(description = "File size")
    private Long fileSize;

    @Schema(description = "File extension")
    private String fileExtension;

    @Schema(description = "Create time")
    private LocalDateTime createTime;

    @Schema(description = "Update time")
    private LocalDateTime updateTime;

    @TableLogic(value = "0", delval = "1")
    @Schema(description = "Logical delete flag: 0 not deleted, 1 deleted")
    private Integer deleted;
}
