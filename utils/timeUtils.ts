export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const startHour = 9;
  const endHour = 18;
  const interval = 30;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = new Date(2024, 0, 1, hour, minute);
      const timeString = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      slots.push(timeString);
    }
  }

  return slots;
}

export function formatDateTime(date: string, time: string): string {
  const dateObj = new Date(date);
  return `${dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })} at ${time}`;
}