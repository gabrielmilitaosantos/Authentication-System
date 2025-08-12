function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function calculateTimeLeft(expirationTime: number): number {
  const now = Date.now();
  const timeLeft = Math.floor((expirationTime - now) / 1000);
  return Math.max(0, timeLeft);
}

export { formatTime, calculateTimeLeft };
