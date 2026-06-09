import { authenticate } from "@mindw1n/webnative-core/windows/api/authenticate";

export function getPlatform() {
  return "Windows";
}

export async function getBackendStatus() {
  const base = "Backend status: <span>";
  let status = "";

  try {
    const data = await authenticate();

    const response = await fetch(`http://127.0.0.1:${data.port}`, {
      method: "GET",
      headers: {
        "X-API-Key": data.key,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    if (response.error) status = "unauthorized";

    status = "online";
  } catch (e) {
    console.error(e);
    status = "offline";
  }

  return base + status + "</span>";
}
