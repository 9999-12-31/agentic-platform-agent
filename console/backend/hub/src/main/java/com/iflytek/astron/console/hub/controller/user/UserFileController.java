package com.iflytek.astron.console.hub.controller.user;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.commons.util.RequestContextUtil;
import com.iflytek.astron.console.hub.dto.user.UserFileResponseDto;
import com.iflytek.astron.console.hub.dto.user.UserFileVo;
import com.iflytek.astron.console.hub.service.user.UserFileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/user-file")
@Tag(name = "User File")
@Slf4j
@RequiredArgsConstructor
public class UserFileController {

    private final UserFileService userFileService;

    /**
     * Handles the request mapping for saving files
     *
     * @param vo Request body containing file information
     * @return Result of saving the file, including file information
     */
    @PostMapping(path = "/save-file")
    @Operation(summary = "Save File")
    public ApiResult<UserFileResponseDto> saveFile(@RequestBody UserFileVo vo) {
        String uid = RequestContextUtil.getUID();
         return ApiResult.success(userFileService.saveFile(uid, vo));
    }

    @PostMapping(path = "/get-all-files")
    @Operation(summary = "Get All Files")
    public ApiResult<List<UserFileResponseDto>> getAllFiles(@RequestBody UserFileVo vo) {
        String uid = RequestContextUtil.getUID();
         return ApiResult.success(userFileService.getAllFiles(uid, vo));
    }

    @DeleteMapping(path = "/delete-file")
    @Operation(summary = "Delete File")
    public ApiResult<Boolean> deleteFile(@RequestParam("fileId") String fileId) {
        String uid = RequestContextUtil.getUID();
        return ApiResult.success(userFileService.deleteFile(uid, fileId));
    }
}
