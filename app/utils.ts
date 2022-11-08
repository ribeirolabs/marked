export function secondsToDate(time: number) {
  return new Date(Date.now() + time * 1000);
}
