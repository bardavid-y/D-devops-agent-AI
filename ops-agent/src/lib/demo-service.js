//const BASE_URL = process.env.const_BASE_URL || "http://backend:5000";
const BASE_URL = "http://host.docker.internal:5000";

export async function callDemoService(path) {
  const Started = Date.now();

  try {
    const response = await fetch(BASE_URL + path, {
      signal: AbortSignal.timeout(3000),
    });
    const body = await response.json();
    console.log(body);

    return { httpStatus: response.status, ms: Date.now() - Started, body };
  } catch (error) {
    return {
      error: `${error.name} ${error.message}`,
      ms: Date.now() - Started,
    };
  }
}
