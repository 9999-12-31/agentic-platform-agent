# -*- coding: utf-8 -*-
import httpx
import uuid
from datetime import datetime
def main(input):
    """
    根据自然语言文本查询数据，返回 queryResults 和 queryColumns。
    """
    chat_id = 1
    agent_id = 67
    base_url = "http://172.19.230.209:9080"
    headers = {"appid": "chatbi_assist", "content-type": "application/json"}
    SUCCESS_CODES = {0, 200}

    with httpx.Client(base_url=base_url, headers=headers, timeout=300) as client:
        try:
            query_text=input
            # 解析
            resp = client.post(
                "/api/chat/query/parse",
                json={"queryText": query_text, "chatId": chat_id, "agentId": agent_id},
            )
            resp.raise_for_status()
            data = resp.json()["data"]
            if resp.json().get("code") not in SUCCESS_CODES:
                return {
                    "success": False,
                    "uuid": str(uuid.uuid4()),
                    "currentTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "error": f"解析失败: {resp.json().get('msg')}",
                }

            query_id = data["queryId"]
            parse_id = data["selectedParses"][0]["id"]

            # 执行
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
            result = resp.json()
            if result.get("code") not in SUCCESS_CODES:
                return {
                    "success": False,
                    "uuid": str(uuid.uuid4()),
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "error": f"执行失败: {result.get('msg')}"
                }

            data = result["data"]
            
            # 过滤 queryColumns，只保留指定字段
            queryColumns = []
            for column in data.get("queryColumns", []):
                queryColumns.append({
                    "name": column.get("name"),
                    "type": column.get("type"),
                    "nameEn": column.get("nameEn"),
                    "showType": column.get("showType")
                })
            
            return {
                "success": True,
                "uuid": str(uuid.uuid4()),
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "data": {
                    "queryResults": data.get("queryResults", []),
                    "queryColumns": queryColumns,
                },
            }

        except Exception as e:
            return {
                "success": False,
                "uuid": str(uuid.uuid4()),
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "error": f"请求异常: {str(e)}"
            }