# C10 · Multi-turn Sessions and Message Queues

Runs an in-process serialized queue with authored turn events. It demonstrates admission and attribution, not a durable distributed queue. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- One writer per conversation
- Correlate each accepted user event
- Advance only after settled completion

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3010`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3010
```

## How the app was build

### 1. Reject competing writers before attributing turns

concurrentInput represents a foreign writer. The early conflict result prevents this local demonstration from attributing the same conversation to two writers.

Source: [src/lesson.ts](src/lesson.ts#L15)

```typescript
if (flag(input, "concurrentInput"))
  return report(
    "conflict",
    "Another writer invalidated exclusive turn attribution",
    { turns: 0 },
    ["Admit one writer", "Observe a foreign user event", "Block queue advancement"],
  );
```

### 2. Correlate each admitted message with a receipt

Every message gets a command ID and an accepted-user-event ID. idle/end_turn is authored receipt data here; a real queue would need to observe that settled state before advancing.

Source: [src/lesson.ts](src/lesson.ts#L16)

```typescript
const receipts = messages.map((message, index) => ({
  commandId: `cmd-${index + 1}`,
  userEventId: `user-${index + 1}`,
  message,
  status: "idle/end_turn",
}));
```

### 3. Expose the serialized turn count

The output counts receipts and retains their message bindings. There is no durable queue or provider dispatch in this reducer.

Source: [src/lesson.ts](src/lesson.ts#L17)

```typescript
return report(
  "passed",
  "Serialized each admitted turn in one conversation",
  { turns: receipts.length, receipts },
  [
    "Open one shared stream reader",
    "Send exactly one queued message",
    "Match the accepted user event ID",
    "Confirm reusable idle before advancing",
  ],
);
```

### Check your understanding

Run **Two correlated turns** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "messages": [
      "Remember Aurora",
      "What project?"
    ],
    "concurrentInput": false
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "turns": 2
  }
}
```

Then try **Detect a competing writer**. Its expected outcome is `conflict`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
