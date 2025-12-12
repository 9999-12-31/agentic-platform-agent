-- 新增用户账号类型字段
ALTER TABLE astron_console.user_info ADD account_type tinyint DEFAULT 0 NULL COMMENT 'Account type: 0 user, 9 admin';

-- 修改智能体广场分类
UPDATE astron_console.bot_type_list SET show_index=0 WHERE id=4;
UPDATE astron_console.bot_type_list SET show_index=0 WHERE id=5;
UPDATE astron_console.bot_type_list SET show_index=0 WHERE id=6;
UPDATE astron_console.bot_type_list SET show_index=0 WHERE id=7;
UPDATE astron_console.bot_type_list SET show_index=0 WHERE id=8;
UPDATE astron_console.bot_type_list SET show_index=0 WHERE id=9;
UPDATE astron_console.bot_type_list SET show_index=1 WHERE id=10;
INSERT INTO astron_console.bot_type_list (id,type_key,type_name,order_num,show_index) VALUES (1,1,'运营管理分析',1,1);
INSERT INTO astron_console.bot_type_list (id,type_key,type_name,order_num,show_index) VALUES (2,2,'科室评价',2,1);

-- chat_tree_index 增加字段 is_delete tinyint
ALTER TABLE astron_console.chat_tree_index ADD COLUMN is_delete TINYINT DEFAULT 0 COMMENT 'Whether deleted: 0 not delete, 1 delete'  AFTER child_chat_id;

-- 用户文件存储表
CREATE TABLE `user_file`
(
    `id`                  bigint       NOT NULL AUTO_INCREMENT,
    `uid`                 varchar(128) NOT NULL COMMENT 'Owner UID',
    `file_id`             varchar(128) NOT NULL COMMENT 'File ID',
    `file_url`            varchar(1024)         DEFAULT NULL COMMENT 'File URL',
    `file_name`           varchar(128)          DEFAULT NULL COMMENT 'File name',
    `file_size`           bigint                DEFAULT NULL COMMENT 'File size',
    `file_extension`      varchar(64)           DEFAULT NULL COMMENT 'File extension',
    `create_time`         datetime              DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`         datetime              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `deleted`             tinyint      NOT NULL DEFAULT '0' COMMENT 'Whether deleted: 0 not deleted, 1 deleted',
    PRIMARY KEY (`id`),
    KEY                   `user_file_uid_IDX` (`uid`) USING BTREE,
    KEY                   `user_file_file_id_IDX` (`file_id`) USING BTREE,
    KEY                   `user_file_deleted_IDX` (`deleted`) USING BTREE,
    KEY                   `user_file_create_time_IDX` (`create_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='User file information';

-- 工作流文件存储节点
INSERT INTO astron_console.config_info (id, category, code, name, value, is_valid, remarks, create_time, update_time) VALUES(1, 'WORKFLOW_NODE_TEMPLATE', '1,2', '基础节点', '{"idType":"oss","nodeType":"基础节点","aliasName":"文件存储","description":"上传文件到对象存储并返回下载URL","data":{"nodeMeta":{"nodeType":"基础节点","aliasName":"文件存储"},"nodeParam":{"filename":"","file_bytes":""},"inputs":[{"id":"","name":"input","schema":{"type":"","value":{"type":"ref","content":{}}}}],"outputs":[{"id":"","name":"filename","schema":{"type":"string","default":""}},{"id":"","name":"download_url","schema":{"type":"string","default":""}}],"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/iteration-icon.png"}}', 1, '文件存储', '2000-01-01 00:00:00', '2025-12-12 06:24:34');