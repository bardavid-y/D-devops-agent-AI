"use client"
import { useState } from "react";
import { readEvents } from "./read-events";
import { json } from "zod";


export default function HomePage() {
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState([]);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  async function investigate() {
    setRunning(true);
    setEvents([]);
    setReport("");
    setError("");

    try {
      const response = await fetch("/api/investigation", { method: "POST" });

      await readEvents(response, (event) => {
        if (event.type === "report") setReport(event.report);
        else if (event.type === "error") setError(event.message);
        else setEvents((prev) => [...prev, event]);
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <main>
      <h1 className="text-7xl">Ops Agent</h1>
      <p className="text-3xl">AI Agent for investigating bugs!</p>
      <button onClick={investigate} disabled={running}>
        {running ? "invetagatin ... " : "invastigin The Service"}
      </button>
      <h2>What thr egint is doing ?</h2>
      
      {events.map((event, i) => (
        <div key={i}>
          {event.type === "tool_called"
            ? `${event.tool} started`
            : `${event.tool} returned`}
          {event.output && <pre>{JSON.stringify(event.output, null, 2)}</pre>}
        </div>
      ))}
    <h2>Report</h2> 
    {error && <p>{error}</p>}
    {/* Add whitespace-pre-wrap so the newlines (\n) work properly! */}
    <p className="whitespace-pre-wrap">{report}</p>
    
    {/* {error && <p>{error}</p>}
    <p>{report}</p>  */}
    </main>
  );
}
