# GA4 Migration: Client-Side to Server-Side

## Overview

Dual analytics implementation with switchable backend via `VITE_USE_SERVER_ANALYTICS` environment variable.

- **Client-side (default)**: Uses ReactGA directly in the browser
- **Server-side**: Events relayed through backend, then to GA4 via Measurement Protocol

## Architecture

### Client-Side (Current)
```
Browser → ReactGA → GA4 (Measurement ID: G-P5VBZQ69Q9)
```

### Server-Side (New)
```
Browser → POST /api/events → nms_optimizer-service → GA4 Measurement Protocol
```

## Implementation

### Frontend Changes

**New Files:**
- `src/utils/analyticsClient.ts` - Server-side analytics client with client ID management

**Modified Files:**
- `src/hooks/useAnalytics/useAnalytics.ts` - Conditional logic based on `VITE_USE_SERVER_ANALYTICS`
- `src/main.tsx` - Conditional initialization of either ReactGA or analytics client

**No component changes required** - All existing `useAnalytics()` calls work with both implementations.

### Backend Implementation

**New File:**
- `src/analytics.py` - GA4 Measurement Protocol client

**Modified File:**
- `src/app.py` - Added `/api/events` POST endpoint to receive and relay events

## Configuration

### Enable Server-Side Analytics

Add to `.env.development` or `.env.production`:

```
VITE_USE_SERVER_ANALYTICS=true
```

Or via build command:
```bash
VITE_USE_SERVER_ANALYTICS=true npm run build
```

### Backend Setup

Set GA4 credentials in nms_optimizer-service:

```bash
export GA4_MEASUREMENT_ID="G-P5VBZQ69Q9"
export GA4_API_SECRET="your-api-secret"
```

## Benefits of Server-Side

✅ **Privacy**: No GA4 script in browser, no IP tracking at source  
✅ **Ad blockers**: Events sent from server, bypasses client-side blockers  
✅ **Reliability**: Centralized error handling and retry logic  
✅ **Security**: API secret never exposed to client  
✅ **Control**: Can add server-side filtering/sampling before GA4  
✅ **Web Vitals**: Can capture server metrics alongside client metrics  

## Migration Strategy

### Phase 1: Test (Current)
- Both implementations deployed
- Use `VITE_USE_SERVER_ANALYTICS=false` in production
- Server implementation available for testing

### Phase 2: Rollout
- Enable server-side analytics for beta users
- Monitor for discrepancies in event counts
- Verify all event properties captured correctly

### Phase 3: Sunset
- Disable ReactGA if server-side stable
- Remove `src/utils/analytics.ts` and hooks
- Clean up client-side GA4 dependencies

## Event Format

### Client-Side (GA4Event)
```typescript
{
  category: "ui",
  action: "button_clicked",
  label?: "submit_btn",
  value?: 1,
  // ... custom properties
}
```

### Server-Side Conversion
Event `ui_button_clicked` with params:
```json
{
  "category": "ui",
  "action": "button_clicked",
  "label": "submit_btn",
  "value": 1
}
```

## Client ID Management

**Server-side**: Stored in `sessionStorage` as `analytics_client_id`
- Format: `web_{timestamp}_{random}`
- Regenerated per session (security)
- Persists across page reloads within same session

**Client-side**: Managed by ReactGA

## Testing

### Local Development
```bash
# With client-side (default)
npm run dev

# With server-side
VITE_USE_SERVER_ANALYTICS=true npm run dev
```

Monitor backend logs for incoming events:
```bash
python3 -m src.app  # Watch for /api/events POST requests
```

### Verify Events in GA4

1. Go to GA4 admin → Real-time
2. Trigger events in the app
3. Watch Real-time report for incoming events

## Dual-Tracking Mode: Ad Blocker Detection

To measure ad blocker adoption, enable dual-tracking mode which sends events to both client-side and server-side simultaneously:

```bash
VITE_DUAL_ANALYTICS=true npm run build
```

### How it works
1. Every event is sent to both ReactGA (client) and backend (server)
2. Events are tagged with `source: "client"` or `source: "server"`
3. Ad blockers block client-side GA4 script, but server events go through
4. Compare event counts in GA4 to identify blocked events:
   - `server_events - client_events = ad_blocker_users`
   - Calculate percentage: `(blocked_events / server_events) * 100`

### GA4 Reporting
In GA4, create a custom report comparing:
- Events with `source = "server"` (unblocked)
- Events with `source = "client"` (potentially blocked by ad blockers)
- Gap indicates users with ad blockers enabled

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_USE_SERVER_ANALYTICS` | `"false"` | Enable server-side analytics (exclusive with VITE_DUAL_ANALYTICS) |
| `VITE_DUAL_ANALYTICS` | `"false"` | Enable dual-tracking for ad blocker detection (sends to both client & server) |
| `VITE_API_URL` | `http://127.0.0.1:5000` | Backend URL for event submission |
| `GA4_MEASUREMENT_ID` | `G-P5VBZQ69Q9` | GA4 property ID (backend) |
| `GA4_API_SECRET` | (empty) | GA4 API secret (backend, required) |

## Troubleshooting

### Events not appearing in GA4
1. Verify `GA4_API_SECRET` is set on backend
2. Check backend logs: `app.logger` should show "GA4 event sent successfully"
3. Confirm Measurement ID matches your GA4 property
4. Wait 24-48 hours for GA4 to process events

### Events only counting in one implementation
- Check which flag is enabled: `VITE_USE_SERVER_ANALYTICS`
- Verify both client and server are deployed/running
- Events are not sent to both simultaneously (mutually exclusive)

### Network errors in browser console
- Ensure backend `/api/events` endpoint is accessible
- Check CORS configuration in `app.py`
- Verify `VITE_API_URL` points to correct backend
