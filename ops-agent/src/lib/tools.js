import { tool } from "@openai/agents";
import { z } from "zod";
import { callDemoService } from "./demo-service";

// Tool 1: check_service_health
export const check_service_health = tool({
  name: "check_service_health",
  description: "Check the order api/health request GET /api/orders",
  parameters: z.object({}),
  
  async execute() {
    console.log("check_service_health");
    try {
      const health = await callDemoService("/health");
      const order = await callDemoService("/api/orders");
      
      return { health, order };
    } catch (error) {
      return { status: "crashed", error: error.message };
    }
  }
});

// Tool 2: get_recent_logs
export const get_recent_logs = tool({
  name: "get_recent_logs",
  description: "Returns the last 20 line of orders api , newest first",
  parameters: z.object({}),

  async execute() {
    console.log("get_recent_logs");
    try {
      const result = await callDemoService("/logs");
      
      // Safety Check 1: Did the server return an HTML error instead of JSON?
      if (result && result.error) {
        return { 
          status: "failed", 
          reason: "Could not fetch logs because the service returned an error", 
          details: result.error 
        };
      }

      // Extract the array depending on how your backend wraps it
      const logsArray = Array.isArray(result) ? result : (result?.body || []);

      // Safety Check 2: Verify it is actually an array before using .map()
      if (!Array.isArray(logsArray)) {
        return { 
          status: "failed", 
          reason: "Expected an array of logs but got something else", 
          raw_data: result 
        };
      }

      // Safely map the logs
      return logsArray.map((line) => {
        const messageText = (line && typeof line.message === 'string') 
          ? line.message.slice(0, 200) 
          : "No message available";

        return {
          ...line,
          message: messageText,
        };
      });

    } catch (error) {
      return { 
        status: "crashed", 
        error: error.message 
      };
    }
  }
});

// Tool 3: get_prodaction_info 
// (Spelled exactly as you defined it in agent.js to match the tools array)
export const get_prodaction_info = tool({
  name: "get_prodaction_info",
  description: "Inspect the production environment, deployment, configuration, runtime, and infrastructure.",
  parameters: z.object({}),

  async execute() {
    console.log("get_prodaction_info");
    try {
      const info = await callDemoService("/info");
      
      // If the service is totally down, return fallback environment context so the AI still has clues
      if (info && info.error) {
        return {
          environment: "production",
          runtime: "Node.js",
          deployment: "latest",
          status: "API unreachable",
          api_error: info.error
        };
      }
      
      return info;
    } catch (error) {
      return { 
        environment: "production", 
        status: "crashed",
        error: error.message 
      };
    }
  }
});