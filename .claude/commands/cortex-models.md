---
description: List available Cortex models
---

List all models available on the Cortex server.

```bash
curl -s https://cortexapi.nfinitmonkeys.com/v1/models \
  -H "Authorization: Bearer $CORTEX_API_KEY" \
  | python3 -c "import sys,json; data=json.load(sys.stdin); [print(f'  {m[\"id\"]}') for m in data.get('data',[])]"
```

If `CORTEX_API_KEY` is not set, remind the user to set it.

Show the model IDs and note which one is the default.
