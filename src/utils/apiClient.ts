export async function apiFetch(
  url: string,
  method = "GET",
  body?: any,
  options?: { isFormData?: boolean }
) {
  const res = await fetch(url, {
    method,
    body: options?.isFormData ? body : JSON.stringify(body),
    headers: options?.isFormData ? {} : { "Content-Type": "application/json" },
  });
  return res.json();
}
