package com.iflytek.astron.console.commons.service;

import com.iflytek.astron.console.commons.service.data.ChatDataService;
import lombok.Getter;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Getter
public class WssListenerService {

    @Autowired
    private ChatRecordModelService chatRecordModelService;

    @Autowired
    private RedissonClient redissonClient;

    @Autowired
    private ChatDataService chatDataService;

    public ChatRecordModelService getChatRecordModelService() {
        return chatRecordModelService;
    }

    public RedissonClient getRedissonClient() {
        return redissonClient;
    }

    public ChatDataService getChatDataService() {
        return chatDataService;
    }

}
