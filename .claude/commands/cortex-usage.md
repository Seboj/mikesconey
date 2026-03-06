---
description: Check your Cortex API usage and limits
---

Check current API usage and rate limits for your Cortex API key.

Run both commands and show the results:

```bash
echo "=== Usage ==="
curl -s https://cortexapi.nfinitmonkeys.com/api/usage \
  -H "Authorization: Bearer $CORTEX_API_KEY" | python3 -m json.tool

echo "=== Limits ==="
curl -s https://cortexapi.nfinitmonkeys.com/api/usage/limits \
  -H "Authorization: Bearer $CORTEX_API_KEY" | python3 -m json.tool
```

Show a summary of:
- Total requests made
- Tokens used (prompt + completion)
- Current rate limits (RPM, TPM)
- How close to limits (percentage if available)
