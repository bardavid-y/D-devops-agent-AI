
export async function readEvents(response, onEvent) {
  if (!Response.ok) {
    onEvent({ type: "error", massage: `השרת החזיר HTTP${response.status}` });
    return;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");

    for (const line of lines) {
      onEvent(JSON.parse(line));
    }
  }
}
