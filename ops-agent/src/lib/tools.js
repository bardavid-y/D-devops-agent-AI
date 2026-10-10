// fiest tool : check_service_health
// secoond tool : get_recent_logs
//third tool : get_prodaction_info

//
import { tool } from "@openai/agents";
import { z } from "zod";
import { callDemoService } from "./demo-service";

export const check_service_health = tool ({
name:"check_service_health",
descriptions:"Check the order api/health request GET /api/orders",
parameters: z.object({}),

async execute() {
    console.log("check_service_health");
    const health = await callDemoService("/health");
    const order = await callDemoService("/api/orders");
    
    return{ health, order};
}

});

export const get_recent_logs = tool ({
name:"get_recent_logs",
descriptions:"Returns the last 20 line of orders api , newest first",
parameters: z.object({}),

async execute() {
    console.log("get_recent-logs");
    const result = await callDemoService("/logs");
    if (!result.body) return result;

 return result.body.map((line) => ({
      ...line,
      message: line.message.slice(0, 200),
    }));
    
}
});

export const get_prodaction_info = tool ({
name:"get_recent-logs",
descriptions:"Returns Wich version running",
parameters: z.object({}),

async execute() {
    console.log("get_recent-logs");

}
});