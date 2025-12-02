package com.iflytek.astron.console.hub.service.user.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.iflytek.astron.console.hub.dto.user.UserFileVo;
import com.iflytek.astron.console.hub.entity.UserFile;
import com.iflytek.astron.console.hub.mapper.UserFileMapper;
import com.iflytek.astron.console.hub.service.user.UserFileService;

@Service
public class UserFileServiceImpl implements UserFileService {

    @Autowired
    private UserFileMapper userFileMapper;

    @Override
    public UserFileVo saveFile(String uid, UserFileVo vo) {
        UserFile entity = new UserFile();
        entity.setUid(uid);
        entity.setFileUrl(vo.getFileUrl());
        entity.setFileName(vo.getFileName());
        entity.setFileSize(vo.getFileSize());
        userFileMapper.insert(entity);
        return vo;
    }
    
}
