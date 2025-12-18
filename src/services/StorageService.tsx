import AsyncStorage from '@react-native-async-storage/async-storage';

export default class StorageService {
  /**
   * Save string, object, number, or boolean
   */
  static async saveItem(key: string, value: string | number | boolean | object): Promise<void> {
    try {
      const toStore = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, toStore);
    } catch (error: any) {
      console.error('Error saving data:', error);
      // Log more details about the error for debugging
      if (error?.message) {
        console.error('Error message:', error.message);
      }
      if (error?.code) {
        console.error('Error code:', error.code);
      }
      // Note: Not re-throwing to maintain backward compatibility
      // If you need error handling, check the return value or use a different method
    }
  }

  /**
   * Retrieve and parse value (supports string, boolean, number, object)
   */
  static async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        try {
          return JSON.parse(value) as T; // Handles boolean, number, object
        } catch {
          return value as unknown as T; // If plain string
        }
      }
      return null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  /**
   * Remove a single key
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  /**
   * Clear all storage
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
