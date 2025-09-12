import { CompanyConfig } from '@/types';
import { ApiService } from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache duration for occupied slots: 2 minutes
const OCCUPIED_SLOTS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

interface CachedOccupiedSlots {
  data: any; // The full API response data
  timestamp: number;
}

class OccupiedSlotsCache {
  private static getCacheKey(barberId: string, date: string): string {
    return `OCCUPIED_SLOTS_${barberId}_${date}`;
  }

  static async getCachedSlots(barberId: string, date: string): Promise<any | null> {
    try {
      const cacheKey = this.getCacheKey(barberId, date);
      const cachedDataStr = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedDataStr) {
        console.log('🔍 No cached occupied slots found for', { barberId, date });
        return null;
      }

      const cachedData: CachedOccupiedSlots = JSON.parse(cachedDataStr);
      const now = Date.now();
      const isExpired = (now - cachedData.timestamp) > OCCUPIED_SLOTS_CACHE_DURATION;

      if (isExpired) {
        console.log('⏰ Cached occupied slots expired for', { barberId, date, age: Math.round((now - cachedData.timestamp) / 1000), seconds: true });
        await AsyncStorage.removeItem(cacheKey); // Clean up expired cache
        return null;
      }

      console.log('✅ Using cached occupied slots for', { barberId, date, age: Math.round((now - cachedData.timestamp) / 1000), seconds: true });
      return cachedData.data;
    } catch (error) {
      console.error('❌ Error getting cached occupied slots:', error);
      return null;
    }
  }

  static async setCachedSlots(barberId: string, date: string, data: any): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(barberId, date);
      const cacheData: CachedOccupiedSlots = {
        data,
        timestamp: Date.now()
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('💾 Cached occupied slots for', { barberId, date });
    } catch (error) {
      console.error('❌ Error caching occupied slots:', error);
    }
  }

  static async clearCache(barberId?: string, date?: string): Promise<void> {
    try {
      if (barberId && date) {
        // Clear specific cache
        const cacheKey = this.getCacheKey(barberId, date);
        await AsyncStorage.removeItem(cacheKey);
        console.log('🗑️ Cleared occupied slots cache for', { barberId, date });
      } else {
        // Clear all occupied slots cache (for debugging/maintenance)
        const allKeys = await AsyncStorage.getAllKeys();
        const occupiedSlotsKeys = allKeys.filter(key => key.startsWith('OCCUPIED_SLOTS_'));
        await AsyncStorage.multiRemove(occupiedSlotsKeys);
        console.log('🗑️ Cleared all occupied slots cache', { count: occupiedSlotsKeys.length });
      }
    } catch (error) {
      console.error('❌ Error clearing occupied slots cache:', error);
    }
  }
}

// Export the cache utility for external use
export { OccupiedSlotsCache };

// Utility function to test cache behavior (for debugging)
export async function testOccupiedSlotsCache(barberId: string, date: string) {
  console.log('🧪 Testing occupied slots cache for', { barberId, date });
  
  // Test 1: First call (should fetch from API)
  console.log('🧪 Test 1: First call (should fetch from API)');
  const slots1 = await generateTimeSlots(date, null, barberId);
  console.log('🧪 First call result:', slots1.length, 'slots');
  
  // Test 2: Second call immediately (should use cache)
  console.log('🧪 Test 2: Second call immediately (should use cache)');
  const slots2 = await generateTimeSlots(date, null, barberId);
  console.log('🧪 Second call result:', slots2.length, 'slots');
  
  // Test 3: Manually clear cache and call again
  console.log('🧪 Test 3: After clearing cache (should fetch from API again)');
  await OccupiedSlotsCache.clearCache(barberId, date);
  const slots3 = await generateTimeSlots(date, null, barberId);
  console.log('🧪 Third call result:', slots3.length, 'slots');
  
  console.log('🧪 Cache test completed');
}

export async function generateTimeSlots(
  selectedDate?: string, 
  companyConfig?: CompanyConfig | null,
  barberId?: string
): Promise<string[]> {
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
    // If no company config is available or day is closed, return default slots for fallback
    if (!companyConfig) {
      const defaultSlots = generateDefaultTimeSlots(defaultStartHour, defaultEndHour, interval, targetDate, advanceHours);
      
      // Fetch and filter out occupied slots if barberId is provided
      if (barberId && selectedDate) {
        try {
          // First, try to get cached occupied slots
          let occupiedData = await OccupiedSlotsCache.getCachedSlots(barberId, selectedDate);
          
          if (!occupiedData) {
            // Cache miss - fetch from API
            console.log('🌐 Fetching occupied slots from API for default slots', { barberId, selectedDate });
            const occupiedResponse = await ApiService.getBarberOccupiedSlots(barberId, selectedDate);
            
            if (occupiedResponse.success && occupiedResponse.data) {
              occupiedData = occupiedResponse.data;
              // Cache the response for future use
              await OccupiedSlotsCache.setCachedSlots(barberId, selectedDate, occupiedData);
            }
          }
          
          if (occupiedData?.occupied_slots) {
            const occupiedSlots = occupiedData.occupied_slots;
            return filterAvailableTimeSlots(defaultSlots, occupiedSlots);
          }
        } catch (error) {
          console.warn('Failed to fetch occupied slots for default slots, showing all available slots:', error);
          // Continue with unfiltered slots if API call fails
        }
      }
      
      return defaultSlots;
    }
    return []; // No slots available if the day is explicitly closed
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

  // Fetch and filter out occupied slots if barberId is provided
  if (barberId && selectedDate) {
    try {
      // First, try to get cached occupied slots
      let occupiedData = await OccupiedSlotsCache.getCachedSlots(barberId, selectedDate);
      
      if (!occupiedData) {
        // Cache miss - fetch from API
        console.log('🌐 Fetching occupied slots from API for', { barberId, selectedDate });
        const occupiedResponse = await ApiService.getBarberOccupiedSlots(barberId, selectedDate);
        
        if (occupiedResponse.success && occupiedResponse.data) {
          occupiedData = occupiedResponse.data;
          // Cache the response for future use
          await OccupiedSlotsCache.setCachedSlots(barberId, selectedDate, occupiedData);
        }
      }
      
      if (occupiedData?.occupied_slots) {
        const occupiedSlots = occupiedData.occupied_slots;
        return filterAvailableTimeSlots(slots, occupiedSlots);
      }
    } catch (error) {
      console.warn('Failed to fetch occupied slots, showing all available slots:', error);
      // Continue with unfiltered slots if API call fails
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

export function isDateAvailable(date: string, companyConfig?: CompanyConfig | null): boolean {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // If no company config is available, default to weekdays being available
  if (!companyConfig) {
    return !['saturday', 'sunday'].includes(dayOfWeek);
  }
  
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

  console.log('🔍 Filtering time slots:', {
    totalSlots: allSlots.length,
    occupiedCount: occupiedSlots.length,
    allSlots,
    occupiedSlots: occupiedSlots.map(slot => ({
      start: slot.start_time,
      end: slot.end_time,
      duration: slot.duration_minutes
    }))
  });

  const availableSlots = allSlots.filter(slot => {
    // Convert slot time to 24-hour format for comparison
    const slotTime = convertTo24Hour(slot);
    
    // Check if this slot conflicts with any occupied slot
    const isAvailable = !occupiedSlots.some(occupied => {
      // Normalize the start and end times to HH:MM format
      const startTime = normalizeTimeFormat(occupied.start_time);
      const endTime = normalizeTimeFormat(occupied.end_time);
      
      // Check if the slot falls within the occupied time range
      // Example: If occupied is 09:00-09:30, then:
      // - 09:00 AM slot conflicts (09:00 >= 09:00 && 09:00 < 09:30) ✓
      // - 09:15 AM slot conflicts (09:15 >= 09:00 && 09:15 < 09:30) ✓  
      // - 09:30 AM slot is available (09:30 >= 09:00 && 09:30 < 09:30) ✗
      const conflict = slotTime >= startTime && slotTime < endTime;
      
      if (conflict) {
        console.log(`❌ Slot ${slot} (${slotTime}) conflicts with occupied ${startTime}-${endTime}`);
      }
      
      return conflict;
    });
    
    if (isAvailable) {
      console.log(`✅ Slot ${slot} (${slotTime}) is available`);
    }
    
    return isAvailable;
  });

  console.log('📊 Filtering result:', {
    originalSlots: allSlots.length,
    availableSlots: availableSlots.length,
    removedSlots: allSlots.length - availableSlots.length
  });

  return availableSlots;
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

function normalizeTimeFormat(timeString: string): string {
  // Remove seconds if present (e.g., "09:00:00" -> "09:00")
  // Handle both "HH:MM:SS" and "HH:MM" formats
  const timeParts = timeString.split(':');
  const hours = timeParts[0].padStart(2, '0');
  const minutes = timeParts[1].padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

function generateDefaultTimeSlots(
  startHour: number,
  endHour: number,
  interval: number,
  targetDate: Date,
  advanceHours: number
): string[] {
  const slots: string[] = [];
  const now = new Date();
  const isToday = targetDate.toDateString() === now.toDateString();
  const minimumTime = new Date(now.getTime() + (advanceHours * 60 * 60 * 1000));

  // Generate default time slots from startHour to endHour
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
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
  }

  return slots;
}