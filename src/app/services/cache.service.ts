import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheService<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private readonly TTL = 1000 * 60 * 15; // 15 minutes

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > this.TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}
