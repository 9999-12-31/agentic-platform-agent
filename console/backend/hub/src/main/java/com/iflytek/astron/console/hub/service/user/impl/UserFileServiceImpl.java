package com.iflytek.astron.console.hub.service.user.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.entity.user.UserInfo;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.hub.dto.user.UserFileVo;
import com.iflytek.astron.console.hub.entity.UserFile;
import com.iflytek.astron.console.hub.mapper.UserFileMapper;
import com.iflytek.astron.console.hub.service.user.UserFileService;

import cn.hutool.core.lang.UUID;

@Service
public class UserFileServiceImpl implements UserFileService {

    @Autowired
    private UserFileMapper userFileMapper;

    @Override
    public UserFileVo saveFile(String uid, UserFileVo vo) {

        UserFile entity = new UserFile();
        entity.setFileId(UUID.fastUUID().toString());
        entity.setUid(uid);
        entity.setFileUrl(vo.getFileUrl());
        entity.setFileName(vo.getFileName());
        entity.setFileSize(vo.getFileSize());
        entity.setFileExtension(getFileExtension(vo.getFileName()));
        entity.setCreateTime(LocalDateTime.now());
        entity.setUpdateTime(LocalDateTime.now());
        int rows = userFileMapper.insert(entity);
        if (rows <= 0) {
            throw new BusinessException(ResponseEnum.BUSINESS_ERROR);
        }
        vo.setFileId(entity.getFileId());
        vo.setCreateTime(entity.getCreateTime());
        vo.setFileExtension(entity.getFileExtension());

        return vo;
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    @Override
    public List<UserFileVo> getAllFiles(String uid, UserFileVo vo) {

        QueryWrapper<UserFile> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("uid", uid);
        if (vo.getFileId() != null) {
            queryWrapper.eq("file_id", vo.getFileId());
        }
        if (vo.getFileExtension() != null) {
            queryWrapper.eq("file_extension", vo.getFileExtension());
        }
        if (vo.getFileName() != null) {
            queryWrapper.like("file_name", vo.getFileName());
        }
        queryWrapper.orderByDesc("create_time");
        queryWrapper.eq("deleted", 0);

        List<UserFile> entities = userFileMapper.selectList(queryWrapper);
        return entities.stream().map(entity -> {
            UserFileVo fileVo = new UserFileVo();
            fileVo.setFileId(entity.getFileId());
            fileVo.setFileUrl(entity.getFileUrl());
            fileVo.setFileName(entity.getFileName());
            fileVo.setFileSize(entity.getFileSize());
            fileVo.setFileExtension(entity.getFileExtension());
            fileVo.setCreateTime(entity.getCreateTime());
            return fileVo;
        }).collect(Collectors.toList());
    }

    @Override
    public Boolean deleteFile(String uid, String fileId) {
        LambdaUpdateWrapper<UserFile> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(UserFile::getUid, uid);
        wrapper.eq(UserFile::getFileId, fileId);
        wrapper.set(UserFile::getDeleted, 1);
        wrapper.set(UserFile::getUpdateTime, LocalDateTime.now());
        int rows = userFileMapper.update(null, wrapper);
        return rows > 0;
    }
}
