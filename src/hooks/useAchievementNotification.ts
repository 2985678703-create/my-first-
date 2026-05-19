import { useCallback } from 'react';
import { create } from 'zustand';
import { AchievementRarity } from '../data/achievements';

interface AchievementNotification {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  timestamp: number;
}

interface NotificationState {
  notifications: AchievementNotification[];
  addNotification: (notification: { name: string; description: string; icon: string; rarity: AchievementRarity }) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = `ach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id, timestamp: Date.now() }
      ].slice(-3),
    }));
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },
  
  clearAll: () => {
    set({ notifications: [] });
  },
}));

export function useAchievementNotifications() {
  const { notifications, addNotification, removeNotification, clearAll } = useNotificationStore();
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}
