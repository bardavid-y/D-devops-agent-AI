
// export async function readEvents(response, onEvent) {
//   if (!Response.ok) {
//     onEvent({ type: "error", massage: `השרת החזיר HTTP${response.status}` });
//     return;
//   }
//   const reader = response.body.getReader();
//   const decoder = new TextDecoder();

//   let buffer = "";
//   while (true) {
//     const { value, done } = await reader.read();
//     if (done) break;

//     buffer += decoder.decode(value, { stream: true });
//     const lines = buffer.split("\n");

//     for (const line of lines) {
//       onEvent(JSON.parse(line));
//     }
//   }
// }
//----- The Fix ------------
export async function readEvents(response, onEvent) {
  // תיקון 1: r קטנה במילה response ו-message במקום massage
  if (!response.ok) {
    onEvent({ type: "error", message: `השרת החזיר HTTP ${response.status}` });
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

    // תיקון 2: שולפים את החלק האחרון (שכנראה עדיין לא מושלם) ומשאירים אותו ב-buffer
    buffer = lines.pop();

    for (const line of lines) {
      // מוודאים שהשורה לא ריקה
      if (line.trim()) {
        try {
          onEvent(JSON.parse(line));
        } catch (error) {
          console.error("Failed to parse JSON line:", line, error);
        }
      }
    }
  }

  // בסיום ה-Stream, אם נשאר משהו ב-buffer ננסה לקרוא גם אותו
  if (buffer.trim()) {
    try {
      onEvent(JSON.parse(buffer));
    } catch (error) {
      console.error("Failed to parse final JSON:", buffer, error);
    }
  }
}