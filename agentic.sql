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
