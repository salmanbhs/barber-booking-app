// Simple event emitter for app-wide state changes
type EventCallback = (...args: any[]) => void;

class SimpleEventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return;
    
    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error('Error in event callback:', error);
      }
    });
  }
}

export const AppEvents = new SimpleEventEmitter();

// Event constants
export const EVENTS = {
  USER_NAME_UPDATED: 'USER_NAME_UPDATED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  AUTH_STATE_CHANGED: 'AUTH_STATE_CHANGED',
} as const;
