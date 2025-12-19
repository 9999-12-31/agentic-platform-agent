# -*- coding: utf-8 -*-
import httpx
import uuid
from datetime import datetime

def main(input):
    """
    根据自然语言文本查询数据，返回结构化结果及字段分类信息。
    """
    chat_id = 1
    agent_id = 67
    base_url = "http://172.19.230.209:9080"
    headers = {"appid": "chatbi_assist", "content-type": "application/json"}
    SUCCESS_CODES = {0, 200}

    with httpx.Client(base_url=base_url, headers=headers, timeout=300) as client:
        try:
            query_text = input

            # 第一步：解析自然语言
            resp = client.post(
                "/api/chat/query/parse",
                json={"queryText": query_text, "chatId": chat_id, "agentId": agent_id},
            )
            resp.raise_for_status()
            parse_resp_json = resp.json()
            if parse_resp_json.get("code") not in SUCCESS_CODES:
                return {
                    "success": False,
                    "uuid": str(uuid.uuid4()),
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "error": f"解析失败: {parse_resp_json.get('msg')}",
                }

            data = parse_resp_json["data"]
            query_id = data["queryId"]
            parse_id = data["selectedParses"][0]["id"]

            # 第二步：执行查询
            resp = client.post(
                "/api/chat/query/execute",
                json={
                    "queryText": query_text,
                    "agentId": agent_id,
                    "chatId": chat_id,
                    "queryId": query_id,
                    "parseId": parse_id,
                },
            )
            resp.raise_for_status()
            execute_resp_json = resp.json()
            if execute_resp_json.get("code") not in SUCCESS_CODES:
                return {
                    "success": False,
                    "uuid": str(uuid.uuid4()),
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "error": f"执行失败: {execute_resp_json.get('msg')}"
                }

            raw_data = execute_resp_json["data"]

            # 过滤 queryColumns，只保留必要字段
            queryColumns = []
            for column in raw_data.get("queryColumns", []):
                queryColumns.append({
                    "name": column.get("name"),
                    "type": column.get("type"),
                    "nameEn": column.get("nameEn"),
                    "showType": column.get("showType")
                })

            # === 字段分类逻辑 ===
            category_fields = []
            number_fields = []
            category_field_values = {}
            number_field_values = {}

            # 按 showType 分离字段
            for column in queryColumns:
                if column["showType"] == "CATEGORY":
                    category_fields.append(column)
                elif column["showType"] == "NUMBER":
                    number_fields.append(column)

            # 初始化值容器
            for field in category_fields:
                category_field_values[field["name"]] = []
            for field in number_fields:
                number_field_values[field["name"]] = []

            # 填充每行数据到对应字段值列表
            for item in raw_data.get("queryResults", []):
                for field in category_fields:
                    en_name = field["nameEn"]
                    value = item.get(en_name)
                    category_field_values[field["name"]].append(value)
                for field in number_fields:
                    en_name = field["nameEn"]
                    value = item.get(en_name)
                    number_field_values[field["name"]].append(value)

            # === 判断数据展示类型 ===
            if len(category_fields) == 0:
                data_show_type = 1  # 无维度（仅数值，如总和、平均值）
            elif len(category_fields) == 1:
                data_show_type = 2  # 单维度：适合柱状图、饼图等
            else:
                data_show_type = 3  # 多维度：适合交叉表、热力图等

            # === 返回结果 ===
            return {
                "success": True,
                "uuid": str(uuid.uuid4()),
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "data": {
                    "queryResults": raw_data.get("queryResults", []),
                    "queryColumns": queryColumns
                },
                "chartData": {
                    "data_show_type": data_show_type,
                    "categoryFields": category_fields,
                    "numberFields": number_fields,
                    "categoryFieldValues": category_field_values,
                    "numberFieldValues": number_field_values,
                }
            }

        except Exception as e:
            return {
                "success": False,
                "uuid": str(uuid.uuid4()),
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "error": f"请求异常: {str(e)}"
            }