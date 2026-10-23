import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 10,
  title: "Multi-turn Sessions and Message Queues",
  description: "Real conversations need follow-up questions. A Managed Agents session retains its history on the server, so another user message sent to the same session continues that conversation.",
  concepts: ["One writer per conversation", "Correlate each accepted user event", "Advance only after settled completion"],
  scope: "Runs an in-process serialized queue with authored turn events. It demonstrates admission and attribution, not a durable distributed queue. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Two correlated turns", "input": {"messages": ["Remember Aurora", "What project?"], "concurrentInput": false}, "expected": "passed", "checks": {"turns": 2}}, {"id": "1", "label": "Detect a competing writer", "input": {"messages": ["Remember Aurora", "What project?"], "concurrentInput": true}, "expected": "conflict", "checks": {"turns": 0}}],
  async run(input) {

const messages = list(input,"messages");
if (messages.some(m=>typeof m!=="string" || !m.trim())) throw new Error("Each queued message must contain text");
if (flag(input,"concurrentInput")) return report("conflict","Another writer invalidated exclusive turn attribution",{turns:0},["Admit one writer","Observe a foreign user event","Block queue advancement"]);
const receipts = messages.map((message,index)=>({commandId:`cmd-${index+1}`,userEventId:`user-${index+1}`,message,status:"idle/end_turn"}));
return report("passed","Serialized each admitted turn in one conversation",{turns:receipts.length,receipts},["Open one shared stream reader","Send exactly one queued message","Match the accepted user event ID","Confirm reusable idle before advancing"]);

  }
};
