export function buildBookingUrl(psychologistId: string): string {
  const params = new URLSearchParams({ psychologistId });
  return `/app/book-session?${params.toString()}`;
}
