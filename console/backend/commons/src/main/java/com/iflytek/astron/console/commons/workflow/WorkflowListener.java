package com.iflytek.astron.console.commons.workflow;

import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.commons.constant.RedisKeyConstant;
import com.iflytek.astron.console.commons.dto.chat.ChatFileReq;
import com.iflytek.astron.console.commons.dto.workflow.WorkflowEventData;
import com.iflytek.astron.console.commons.entity.chat.ChatFileUser;
import com.iflytek.astron.console.commons.entity.chat.ChatReqRecords;
import com.iflytek.astron.console.commons.service.WssListenerService;
import com.iflytek.astron.console.commons.service.data.ChatDataService;
import com.iflytek.astron.console.commons.util.SseEmitterUtil;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import okhttp3.sse.EventSource;
import okhttp3.sse.EventSourceListener;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author mingsuiyongheng
 */
@Slf4j
@NoArgsConstructor
public class WorkflowListener extends EventSourceListener {
    private WorkflowClient chainClient;
    private String sseId;
    private ChatReqRecords chatReqRecords;
    private StringBuffer thinkingResult = new StringBuffer();
    private StringBuffer finalResult = new StringBuffer();
    private WssListenerService wssListenerService;
    private String sid;
    private boolean isDebug = false;
    private SseEmitter emitter;

    public WorkflowListener(WorkflowClient chainClient, ChatReqRecords records, String sseId,
            WssListenerService wssListenerService,
            boolean isDebug, SseEmitter emitter) {
        this.chainClient = chainClient;
        this.chatReqRecords = records;
        this.sseId = sseId;
        this.wssListenerService = wssListenerService;
        this.isDebug = isDebug;
        this.emitter = emitter;
    }

    /**
     * Method to handle event source
     *
     * @param eventSource Event source object
     * @param id Event unique identifier
     * @param type Event type
     * @param data Event data
     */
    @Override
    public void onEvent(@NotNull EventSource eventSource, String id, String type, @NotNull String data) {
        log.debug("workflow api sse response, sseId:{}, uid:{}, data:{}", sseId, chatReqRecords.getUid(), data);
        // Abort generation
        if (SseEmitterUtil.isStreamStopped(sseId)) {
            // Already started thinking, so record the generated thinking text to chat_reason table
            wssListenerService.getChatRecordModelService().saveThinkingResult(chatReqRecords, thinkingResult, false);
            // Already started outputting, so record the output text to resp table
            wssListenerService.getChatRecordModelService().saveChatResponse(chatReqRecords, finalResult, new StringBuffer(sid), false, 2);
            // Build interruption completion data and attempt to send to client (if still connected)
            JSONObject interruptedData = buildCompleteData(finalResult, thinkingResult, chatReqRecords);
            interruptedData.put("interrupted", true);
            interruptedData.put("reason", "Stream interrupted or client disconnected");
            trySendCompleteAndEnd(emitter, interruptedData, sseId);
            return;
        }

        JSONObject jsonObject = JSONObject.parseObject(data);
        // Try to send data, continue processing data even if client disconnects
        boolean clientConnected = tryServeSSEData(emitter, jsonObject, sseId);
        this.sid = jsonObject.getString("id");
        Integer code = jsonObject.getInteger("code");

        if (!clientConnected) {
            log.info("Client disconnected, but continue processing data to ensure integrity, sseId: {}", sseId);
        }

        // Get output
        JSONArray choices = jsonObject.getJSONArray("choices");
        if (Objects.isNull(choices) || choices.isEmpty()) {
            return;
        }
        JSONObject choice = choices.getJSONObject(0);
        String content = choice.getJSONObject("delta").getString("content");
        // Record main content
        if (StringUtils.isNotBlank(content)) {
            finalResult.append(content);
        }
        // Record thinking process
        String reasoningContent = choice.getJSONObject("delta").getString("reasoning_content");
        if (StringUtils.isNotBlank(reasoningContent)) {
            thinkingResult.append(content);
        }
        processDeBugWorkFlow(jsonObject);

        // Handle error code cases
        if (code != null && code != 0) {
            log.error("Workflow returned error code, sseId: {}, uid: {}, code: {}", sseId, chatReqRecords.getUid(), code);
            String fallbackMessage = getFallbackMessage(code);
            finalResult.append(fallbackMessage);
        }

        String finishReason = choice.getString("finish_reason");
        // End frame processing
        if ("stop".equals(finishReason) || "interrupt".equals(finishReason)) {
            // Record thinking text
            wssListenerService.getChatRecordModelService().saveThinkingResult(chatReqRecords, thinkingResult, false);
            int answerType = 2;
            // Store return result content in database
            String finalResultStr = finalResult.toString();
            try {
                if (WorkflowEventData.WorkflowOperation.INTERRUPT.getOperation().equals(finishReason)) {
                    finalResultStr = processWorkFlowInterrupt(jsonObject, finalResultStr);
                    answerType = 41;
                    log.debug("workflow api format response, sseId:{}, uid:{}, data:{}", sseId, chatReqRecords.getUid(), finalResultStr);
                } else if (WorkflowEventData.WorkflowOperation.STOP.getOperation().equals(finishReason)) {
                    wssListenerService.getRedissonClient().getBucket(StrUtil.format(RedisKeyConstant.MAAS_WORKFLOW_EVENT_ID, chatReqRecords.getUid(), chatReqRecords.getChatId())).delete();
                    wssListenerService.getRedissonClient().getBucket(StrUtil.format(RedisKeyConstant.MAAS_WORKFLOW_EVENT_VALUE_TYPE, chatReqRecords.getUid(), chatReqRecords.getChatId())).delete();
                }
                wssListenerService.getChatRecordModelService().saveChatResponse(chatReqRecords, new StringBuffer(finalResultStr), new StringBuffer(sid), false, answerType);
                trySendCompleteAndEnd(emitter, buildCompleteData(new StringBuffer(finalResultStr), thinkingResult, chatReqRecords), sseId);
            } catch (Exception e) {
                log.error("Current return character count: {}, sseId: {}, uid: {}", finalResultStr.length(), sseId, chatReqRecords.getUid());
                log.error("Exception occurred while storing model data return in database, sseId: {}, uid: {}", sseId, chatReqRecords.getUid(), e);
                trySendCompleteAndEnd(emitter, createErrorResponse(e), sseId);
            }
        }

    }

    /**
     * Try to send SSE data, detect client connection status
     *
     * @param emitter SseEmitter object
     * @param dataObj Data object to send
     * @param streamId Stream identifier
     * @return true if client is still connected, false if client is disconnected
     */
    private boolean tryServeSSEData(SseEmitter emitter, JSONObject dataObj, String streamId) {
        if (emitter == null) {
            log.warn("SseEmitter is null, unable to send data, streamId: {}", streamId);
            return false;
        }

        try {
            String jsonData = dataObj.toJSONString();
            emitter.send(SseEmitter.event().name("data").data(jsonData));
            return true;
        } catch (org.springframework.web.context.request.async.AsyncRequestNotUsableException e) {
            log.warn("Client connection disconnected, streamId: {}, continue background data processing", streamId);
            return false;
        } catch (IOException e) {
            log.error("Failed to send SSE data, streamId: {}, error: {}", streamId, e.getMessage());
            return false;
        } catch (IllegalStateException e) {
            log.debug("SseEmitter completed, streamId: {}", streamId);
            return false;
        } catch (Exception e) {
            log.error("Unexpected error occurred while sending SSE data, streamId: {}", streamId, e);
            return false;
        }
    }

    /**
     * Handle interrupt response return
     *
     * @param jsonObject LLM return data
     * @param backValue Main message
     */
    private String processWorkFlowInterrupt(JSONObject jsonObject, String backValue) {
        WorkflowEventData eventData = jsonObject.getObject("event_data", WorkflowEventData.class);
        // Cache event ID, wait for second phase use
        wssListenerService.getRedissonClient().<String>getBucket(StrUtil.format(RedisKeyConstant.MAAS_WORKFLOW_EVENT_ID, chatReqRecords.getUid(), chatReqRecords.getChatId())).set(eventData.getEventId(), Duration.ofDays(1));
        String tag = WorkflowEventData.WorkflowValueType.getTag(eventData.getValue().getType());
        wssListenerService.getRedissonClient().<String>getBucket(StrUtil.format(RedisKeyConstant.MAAS_WORKFLOW_EVENT_VALUE_TYPE, chatReqRecords.getUid(), chatReqRecords.getChatId())).set(tag, Duration.ofDays(1));
        Map<String, String> displayOperation = WorkflowEventData.WorkflowOperation.getDisplayOperation(eventData.isNeedReply());
        // Interrupt scenario: First frame returns intelligent answer type tag and operation tag
        SseEmitterUtil.sendData(emitter, displayOperation);
        SseEmitterUtil.sendData(emitter, eventData.getValue());
        return JSON.toJSONString(eventData.getValue().withMessage(backValue));
    }

    /**
     * Callback method invoked by event source listener when connection fails
     *
     * @param eventSource Event source object
     * @param t Thrown exception
     * @param response HTTP response object
     */
    @Override
    public void onFailure(@NotNull EventSource eventSource, Throwable t, Response response) {
        log.error(".....MaasListener failed to establish connection with chain-sse....., sseId: {}, uid: {}, chatId: {}", sseId, chatReqRecords.getUid(), chatReqRecords.getChatId(), t);
        // Close current websocket connection
        if (chainClient != null) {
            chainClient.closeSse();
        }
        trySendCompleteAndEnd(emitter, createErrorResponse(new Exception("Connection exception")), sseId);
    }

    /**
     * Try to send completion signal and end SSE connection
     *
     * @param emitter SseEmitter object
     * @param completeData Completion data
     * @param streamId Stream identifier
     */
    private void trySendCompleteAndEnd(SseEmitter emitter, JSONObject completeData, String streamId) {
        if (emitter == null) {
            log.warn("SseEmitter is null, unable to send completion signal, streamId: {}", streamId);
            return;
        }

        specialPreProcess(completeData);

        try {
            // Try to send completion data
            emitter.send(SseEmitter.event().name("complete").data(completeData.toJSONString()));
            log.debug("Completion data sent successfully, streamId: {}", streamId);
        } catch (org.springframework.web.context.request.async.AsyncRequestNotUsableException e) {
            log.info("Client connection disconnected, unable to send completion data, but data has been saved, streamId: {}", streamId);
        } catch (Exception e) {
            log.warn("Failed to send completion data, but data has been saved, streamId: {}, error: {}", streamId, e.getMessage());
        }

        try {
            // Try to send end signal and complete connection
            String endData = "{\"end\":true,\"timestamp\":" + System.currentTimeMillis() + "}";
            emitter.send(SseEmitter.event().name("end").data(endData));
            emitter.complete();
            log.debug("SSE connection ended normally, streamId: {}", streamId);
        } catch (org.springframework.web.context.request.async.AsyncRequestNotUsableException e) {
            log.info("Client connection disconnected, unable to send end signal, streamId: {}", streamId);
        } catch (IllegalStateException e) {
            log.debug("SseEmitter completed, streamId: {}", streamId);
        } catch (Exception e) {
            log.warn("Exception occurred while ending SSE connection, streamId: {}, error: {}", streamId, e.getMessage());
        }


    }

    /**
     * 对工作流特定输出 保存URL,同时移除该输出内容
     * Pattern：save file url:http...
     * @param completeData
     */
    private void specialPreProcess(JSONObject completeData) {
        // 对特定输出格式的工作流 保存输出的URL
        try {
            String finalResultStr = completeData.getString("finalResult");
            if (finalResultStr == null) return ;

            // 正则提取 工作流输出的第一个符合题意的
            // 提取规则 前缀
            Pattern urlPattern = Pattern.compile("save file url:https?://[^\\s]*\\.[a-zA-Z]{1,10}");
            Matcher matcher = urlPattern.matcher(finalResultStr);
            String matchedUrl = null;
            if (matcher.find()) {
                matchedUrl = matcher.group(); // 或 matcher.group(1) 如果用了捕获组
            }

            if (matchedUrl != null) {
                String finalUrl = matchedUrl.replaceAll("save file url:", "");
                saveUrlToChatFile(finalUrl);
                // 移除工作流关于url的输出
                completeData.put("finalResult", finalResultStr.replace(matchedUrl, ""));
            }
        } catch (Exception e) {
            log.error("Error extracting or saving URL from completeData", e);
        }
    }

    private void saveUrlToChatFile(String fileUrl) {
        // 随机生成uuid
        String fileBusinessKey = UUID.randomUUID().toString();
        String uid = chatReqRecords.getUid();
        ChatDataService chatDataService = wssListenerService.getChatDataService();

        try {
            log.info("Saving URL to chatFileUser: {}", fileUrl);
            ChatFileUser chatFileUser = ChatFileUser.builder()
                    .fileId(null)
                    .fileName("报告解析" + fileBusinessKey + ".md")
                    .uid(chatReqRecords.getUid())
                    .fileUrl(fileUrl)
                    .fileSize(100L)
                    .createTime(LocalDateTime.now())
                    .updateTime(LocalDateTime.now())
                    .clientType(1)
                    .deleted(0)
                    .businessType(16)
                    .display(1)
                    .fileStatus(2)
                    .extraLink(null)
                    .fileBusinessKey(fileBusinessKey)
                    .documentType(1)
                    .collectOriginFrom(null)
                    .icon(null)
                    .fileIndex(chatDataService.getFileUserCount(uid) + 1)
                    .build();

            Long chatFileUserId = chatDataService.createChatFileUser(chatFileUser).getId();
            // Bind chatFileUser and chatFileReq
            String fileId = "agent_" + chatFileUserId;
            chatDataService.setFileId(chatFileUserId, fileId);

            ChatFileReq chatFileReq = ChatFileReq.builder()
                    .fileId(fileId)
                    .chatId(chatReqRecords.getChatId())
                    .uid(uid)
                    .reqId(chatReqRecords.getId())  // 如果id为null 则会在聊天输入框中显示 且 可以取消绑定
                    .createTime(LocalDateTime.now())
                    .updateTime(LocalDateTime.now())
                    .clientType(1)
                    .businessType(16)
                    .build();
            chatDataService.createChatFileReq(chatFileReq);
            log.info("Save success URL to chatFileUser And ChatFileReq : {}", fileUrl);
        } catch (Exception e) {
            log.error("Error saving URL to chatFileUser: {}", fileUrl, e);
        }

    }

    /**
     * Function to handle debug workflow
     *
     * @param jsonObject Input JSON object
     */
    private void processDeBugWorkFlow(JSONObject jsonObject) {
        // debug url has special handling for end frames, for detailed processing please consult Institute
        if (isDebug) {
            JSONObject node = Optional.ofNullable(jsonObject)
                    .map(obj -> obj.getJSONObject("workflow_step"))
                    .map(step -> step.getJSONObject("node"))
                    .orElse(null);
            if (node == null) {
                return;
            }
            String nodeFinishReason = node.getString("finish_reason");
            if (!"stop".equals(nodeFinishReason)) {
                return;
            }
            JSONObject ext = node.getJSONObject("ext");
            if (ext == null) {
                return;
            }
            Integer answerMode = ext.getInteger("answer_mode");
            if (!Integer.valueOf(0).equals(answerMode)) {
                return;
            }
            String nodeId = node.getString("id");
            if (StringUtils.isBlank(nodeId) || !nodeId.startsWith("node-end")) {
                return;
            }
            JSONObject outputs = node.getJSONObject("outputs");
            if (outputs == null) {
                return;
            }
            String outString = JSON.toJSONString(outputs);
            if (StringUtils.isNotEmpty(outString)) {
                finalResult.append(outString);
            }
        }
    }

    /**
     * Build complete data JSON object
     *
     * @param finalResult StringBuffer of final result
     * @param thinkingResult StringBuffer of thinking process
     * @param chatReqRecords Chat request record object
     * @return JSONObject containing complete data
     */
    private JSONObject buildCompleteData(StringBuffer finalResult, StringBuffer thinkingResult, ChatReqRecords chatReqRecords) {
        JSONObject completeData = new JSONObject();
        completeData.put("finalResult", finalResult.toString());
        completeData.put("thinkingResult", thinkingResult.toString());
        completeData.put("timestamp", System.currentTimeMillis());

        if (chatReqRecords != null) {
            completeData.put("chatId", chatReqRecords.getChatId());
            completeData.put("reqId", chatReqRecords.getId());
        }

        return completeData;
    }

    /**
     * Get fallback message based on error code
     *
     * @param code Error code
     * @return Fallback message
     */
    private String getFallbackMessage(Integer code) {
        if (code == null) {
            return "Service exception, please try again later";
        }

        return switch (code) {
            case 20201 -> "Corresponding Flow ID not found";
            case 20202 -> "Flow ID is invalid";
            case 20204 -> "Workflow not published";
            case 20207 -> "Workflow is in draft status";
            case 20303 -> "Model request failed";
            case 20350 -> "Authorization error: Daily flow control exceeded. Exceeded the daily maximum access limit";
            case 11202 -> "Authorization error: Second-level flow control exceeded. Second-level concurrency exceeded authorization limit";
            case 11203 -> "Authorization error: Concurrent flow control exceeded. Concurrent connections exceeded authorization limit";
            default -> "Service exception, please try again later";
        };
    }

    /**
     * Create error response object
     *
     * @param e Exception object passed in
     * @return JSONObject containing error information
     */
    private JSONObject createErrorResponse(Exception e) {
        JSONObject errorResponse = new JSONObject();
        errorResponse.put("code", -1);
        errorResponse.put("message", e.getMessage());
        return errorResponse;
    }

    public StringBuffer getThinkingResult() {
        return thinkingResult;
    }

    public StringBuffer getFinalResult() {
        return finalResult;
    }
}
