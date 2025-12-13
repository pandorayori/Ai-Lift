import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../services/storageService.js';
import { WorkoutLog } from '../types.js';

type StorageShape = Record<string, string>;

const createMockStorage = () => {
  const store: StorageShape = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    }
  } as Storage;
};

beforeEach(() => {
  (globalThis as any).localStorage = createMockStorage();
});

test('getProfile merges defaults into stored profile values', () => {
  const key = 'ai_lift_profile_test_user';
  const cachedProfile = {
    name: 'Alex',
    weight: 82,
    height: 185,
    language: 'en'
  };

  globalThis.localStorage.setItem(key, JSON.stringify(cachedProfile));

  const profile = storage.getProfile('test_user');

  assert.equal(profile.name, 'Alex');
  assert.equal(profile.id, 'test_user');
  assert.ok(profile.strength_records.length > 0, 'default strength records should be present');
});

test('saveWorkoutLog updates existing logs instead of duplicating them', () => {
  const userId = 'test_user';
  const log: WorkoutLog = {
    id: 'log-1',
    user_id: userId,
    name: 'Push Session',
    date: new Date('2024-06-01').toISOString(),
    duration_minutes: 45,
    total_volume: 150,
    exercises: []
  };

  storage.saveWorkoutLog(userId, log);
  storage.saveWorkoutLog(userId, { ...log, total_volume: 200 });

  const logs = storage.getWorkoutLogs(userId);

  assert.equal(logs.length, 1);
  assert.equal(logs[0].total_volume, 200);
});
