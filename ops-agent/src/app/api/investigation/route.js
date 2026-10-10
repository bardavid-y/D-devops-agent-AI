import { run } from "@openai/agents";
import { Opsagent } from "../../../lib/agent";
import { saveInvestigation } from "../../../lib/db";
import { json, output } from "zod";

export async function POST(request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }
      const toolResults = [];
      try {
        const result = await run(Opsagent, "inestigate order-api", {
          stream: true,
          maxTurns: 6,
          signal: AbortSignal.any([
            request.signal,
            AbortSignal.timeout(60_000),
          ]),
        });
        for await (const event of result) {
          if (event.type !== "run_item_stream_event") {
            continue;
          }
          if (event.item.type === "tool_call_item") {
            const tool = event.item.rawItem.name;
            send({
              type: "tool_called",
              tool,
            });
          }
          if (event.item.type === "tool_call_output_item") {
            send({
              type: "tool_output",
              output: event.item.output,
            });
            toolResults.push({
              output: event.item.output,
            });
          }
        }
        await result.completed;
        if (result.cancelled) {
          throw new Error("החקירה עצרה");
        }
        const report = result.finalOutput;
        send({ type: "report", report });

        await saveInvestigation({ createdAt: new Date(), toolResults, report });
      } catch (error) {
        send({ type: "error", message: error.message });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {"Content-type": "application/x-ndjson"},
  });
}
