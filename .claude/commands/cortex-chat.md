---
description: Send a chat message to Cortex
---

Send a quick chat completion to Cortex. Use the message from the user's argument, or default to "Hello! What model are you?".

Parse the arguments for optional flags:
- `--pool POOL_NAME` — target a specific pool (default: `default`)
- `--model MODEL_NAME` — use a specific model (default: server's model, currently Qwen/Qwen3-14B)

Examples:
- `/cortex-chat Hello` — basic message, default pool and model
- `/cortex-chat --pool high-priority What is Cortex?` — target a pool
- `/cortex-chat --model Qwen/Qwen3-14B Explain AI` — specify a model
- `/cortex-chat --pool batch --model Qwen/Qwen3-14B Summarize this` — both

Build and run a curl command like:

```bash
curl -s https://cortexapi.nfinitmonkeys.com/v1/chat/completions \
  -H "Authorization: Bearer $CORTEX_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Cortex-Pool: POOL_NAME" \
  -d '{
    "messages": [{"role": "user", "content": "THE_MESSAGE"}],
    "model": "MODEL_NAME",
    "max_tokens": 500
  }'
```

- Only include the `X-Cortex-Pool` header if `--pool` was specified.
- Only include `"model"` in the JSON body if `--model` was specified.
- If no message text was provided (only flags), default to "Hello! What model are you?".

Show the model's response. If there's an error, show the error and suggest checking the API key.

After showing the response, remind the user:
- **Pool**: defaults to `default`. Set with `--pool NAME` if your admin gave you access to another pool.
- **Model**: defaults to server's model. Set with `--model NAME`. List available models with `/cortex-models`.
