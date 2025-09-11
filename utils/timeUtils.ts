import { CompanyConfig } from '@/types';

export function generateTimeSlots(
  selectedDate?: string, 
  companyConfig?: CompanyConfig | null
): string[] {
  const slots: string[] = [];
  
  // Default values if no company config is available
  const defaultStartHour = 9;
  const defaultEndHour = 18;
  const defaultInterval = 30;
  const defaultAdvanceHours = 2;

  // Get configuration values
  const interval = companyConfig?.time_slot_interval || defaultInterval;
  const advanceHours = companyConfig?.booking_advance_hours || defaultAdvanceHours;
  
  // Determine the date for which we're generating slots
  const targetDate = selectedDate ? new Date(selectedDate) : new Date();
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Get working hours for the selected day
  const workingHours = companyConfig?.working_hours?.[dayOfWeek];
  
  if (!workingHours || !workingHours.isOpen) {
    return []; // No slots available if the day is closed
  }

  // Get current time for advance booking check
  const now = new Date();
  const isToday = targetDate.toDateString() === now.toDateString();
  const minimumTime = new Date(now.getTime() + (advanceHours * 60 * 60 * 1000));

  // Generate slots for each shift
  workingHours.shifts.forEach(shift => {
    const [startHour, startMinute] = shift.start.split(':').map(Number);
    const [endHour, endMinute] = shift.end.split(':').map(Number);
    
    // Create start and end times for this shift
    const shiftStart = startHour * 60 + startMinute; // Convert to minutes
    const shiftEnd = endHour * 60 + endMinute; // Convert to minutes
    
    // Generate time slots for this shift
    for (let timeInMinutes = shiftStart; timeInMinutes < shiftEnd; timeInMinutes += interval) {
      const hour = Math.floor(timeInMinutes / 60);
      const minute = timeInMinutes % 60;
      
      // Create the slot time
      const slotDateTime = new Date(targetDate);
      slotDateTime.setHours(hour, minute, 0, 0);
      
      // Check if this slot is far enough in advance for today
      if (isToday && slotDateTime <= minimumTime) {
        continue; // Skip this slot as it's too soon
      }
      
      // Format the time string
      const timeString = slotDateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      slots.push(timeString);
    }
  });

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

export function isDateAvailable(date: string, companyConfig?: CompanyConfig | null): boolean {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Check if the day is open
  const workingHours = companyConfig?.working_hours?.[dayOfWeek];
  if (!workingHours || !workingHours.isOpen) {
    return false;
  }
  
  // Check if it's not a holiday (if holidays are implemented)
  const holidays = companyConfig?.holidays || [];
  const dateString = targetDate.toISOString().split('T')[0];
  if (holidays.includes(dateString)) {
    return false;
  }
  
  return true;
}

export interface OccupiedSlot {
  booking_id: string;
  confirmation_code: string;
  start_time: string;
  end_time: string;
  start_datetime: string;
  end_datetime: string;
  duration_minutes: number;
  status: string;
  services: string;
  customer_name: string;
  cannot_book_before: string;
  cannot_book_after: string;
}

export function filterAvailableTimeSlots(
  allSlots: string[], 
  occupiedSlots: OccupiedSlot[]
): string[] {
  if (!occupiedSlots || occupiedSlots.length === 0) {
    return allSlots;
  }

  return allSlots.filter(slot => {
    // Convert slot time to 24-hour format for comparison
    const slotTime = convertTo24Hour(slot);
    
    // Check if this slot conflicts with any occupied slot
    return !occupiedSlots.some(occupied => {
      const startTime = occupied.start_time;
      const endTime = occupied.end_time;
      
      // Check if the slot falls within the occupied time range
      return slotTime >= startTime && slotTime < endTime;
    });
  });
}

function convertTo24Hour(time12h: string): string {
  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (period === 'PM' && hours !== '12') {
    hours = String(parseInt(hours) + 12);
  } else if (period === 'AM' && hours === '12') {
    hours = '00';
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`;
}