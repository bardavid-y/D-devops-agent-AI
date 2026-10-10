"use client"
import { useState } from "react";
import { readEvents } from "./read-events";

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
    <main className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-5xl md:text-7xl font-bold mb-4">Ops Agent</h1>
      <p className="text-2xl md:text-3xl text-gray-600 mb-8">AI Agent for investigating bugs!</p>
      
      <button 
        onClick={investigate} 
        disabled={running}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 mb-8"
      >
        {running ? "Investigating..." : "Investigate The Service"}
      </button>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">What the agent is doing?</h2>
        <div className="bg-gray-100 p-4 rounded-lg space-y-4 max-h-96 overflow-y-auto">
          {events.length === 0 && !running && <p className="text-gray-500">No events yet. Start an investigation.</p>}
          {events.map((event, i) => (
            <div key={i} className="border-b border-gray-300 pb-4">
              <span className="font-semibold text-blue-800">
                {event.type === "tool_called"
                  ? `Started: ${event.tool}`
                  : `Returned: ${event.tool}`}
              </span>
              {event.output && (
                <pre className="bg-gray-900 text-green-400 p-3 mt-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(event.output, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Report</h2> 
        {error && <p className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</p>}
        
        {/* The report is displayed inside a nice card with whitespace-pre-wrap to keep line breaks */}
        {report && (
          <div className="bg-white border border-gray-300 shadow-lg rounded-lg p-6">
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-800 text-right" dir="rtl">
              {report}
            </p>
          </div>
        )}
      </div> 
    </main>
  );
}