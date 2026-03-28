import requests
url = "https://api.siliconflow.cn/v1"
payload = {
    "model": "Pro/zai-org/GLM-4.7",
    "messages": [
        {
            "role": "user",
            "content": "你是什么模型"
        }
    ]
}
headers = {
    "Authorization": "sk-cdlmuyofgrzahxhkkiqrkijerqpukdhsdmsxfcngqjbjruru",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(response.text)