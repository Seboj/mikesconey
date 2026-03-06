---
description: Test your Cortex API connection
---

Test the Cortex API connection by listing available models.

Run this curl command and show the result:

```bash
curl -s https://cortexapi.nfinitmonkeys.com/v1/models \
  -H "Authorization: Bearer $CORTEX_API_KEY" | python3 -m json.tool
```

If `CORTEX_API_KEY` is not set, remind the user to export it:
```bash
export CORTEX_API_KEY="your-key-here"
```

Show whether the connection succeeded (models listed) or failed (auth error, connection refused, etc.).
