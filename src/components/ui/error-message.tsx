export function ErrorMessage({ error }: { error?: string[] | string }) {
  if (!error) return null;

  const message = Array.isArray(error) ? error[0] : error;
  if (!message) return null;

  return <p className="mt-2 text-sm text-rose-300">{message}</p>;
}
