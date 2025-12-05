package com.iflytek.astron.console.hub.controller.chat;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.dto.chat.ChatFileReq;
import com.iflytek.astron.console.commons.entity.chat.ChatFileUser;
import com.iflytek.astron.console.commons.entity.chat.ChatList;
import com.iflytek.astron.console.commons.entity.chat.ChatTreeIndex;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.commons.service.data.ChatDataService;
import com.iflytek.astron.console.commons.service.data.ChatListDataService;
import com.iflytek.astron.console.commons.util.RequestContextUtil;
import com.iflytek.astron.console.hub.dto.chat.ChatFileResponseDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@Tag(name = "Chat File")
@RequestMapping("/chat-file")
public class ChatFileController {

    @Autowired
    private ChatDataService chatDataService;

    @Autowired
    private ChatListDataService chatListDataService;

    @GetMapping("/all/{chatId}/{childChatId}")
    @Operation(summary = "Get Chat File by chatId")
    public ApiResult<List<ChatFileResponseDto>> getAllChatFile(@PathVariable Long chatId,
            @PathVariable(required = false) Long childChatId) {
        String uid = RequestContextUtil.getUID();
        // Check if chatId belongs to uid
        ChatList chatList = chatListDataService.findByUidAndChatId(uid, chatId);
        if (chatList == null) {
            return ApiResult.error(ResponseEnum.CHAT_REQ_NOT_BELONG_ERROR);
        }
        List<ChatTreeIndex> chatTreeIndexList = chatListDataService.getListByRootChatId(chatId, uid);
        // filter by isDelete = 0
        chatTreeIndexList.removeIf(e -> e.getIsDelete() == 1);

        List<ChatFileResponseDto> chatFileResponseDtoList = new ArrayList<>();
        if (chatTreeIndexList.isEmpty()) {
            return ApiResult.success(chatFileResponseDtoList);
        }

        // 如果 childChatId 存在，则只保留 chatTreeIndexList 中与之相同的 childChatId，否则保留所有
        if (childChatId != null) {
            chatTreeIndexList.removeIf(e -> !childChatId.equals(e.getChildChatId()));
        }

        for (ChatTreeIndex e : chatTreeIndexList) {
            // Get all bound file information under this ChatId
            List<ChatFileReq> chatFileReqList = chatDataService.getFileList(uid, e.getChildChatId());
            if (chatFileReqList == null || chatFileReqList.isEmpty()) {
                continue;
            }
            for (ChatFileReq chatFileReq : chatFileReqList) {
                ChatFileUser chatFileUser = chatDataService.getByFileIdAll(chatFileReq.getFileId(),
                        chatFileReq.getUid());
                if (chatFileUser == null) {
                    continue;
                }
                ChatFileResponseDto chatFileResponseDto = new ChatFileResponseDto();
                chatFileResponseDto.setChatId(chatId);
                chatFileResponseDto.setChildChatId(e.getChildChatId());
                chatFileResponseDto.setFileId(chatFileUser.getFileId());
                chatFileResponseDto.setFileName(chatFileUser.getFileName());
                chatFileResponseDto.setFileSize(chatFileUser.getFileSize());
                chatFileResponseDto.setFileUrl(chatFileUser.getFileUrl());
                chatFileResponseDto.setFileExtension(getFileExtension(chatFileUser.getFileName()));
                chatFileResponseDtoList.add(chatFileResponseDto);
            }
        }

        return ApiResult.success(chatFileResponseDtoList);
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
