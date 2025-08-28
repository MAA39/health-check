/**
 * 共有型定義・ユーティリティ
 * iOS (React Native) ↔ watchOS (SwiftUI) 間の通信用
 */

// WatchConnectivity メッセージタイプ
export interface WatchMessage {
  type: 'PING' | 'PONG' | 'HEALTH_DATA' | 'STATUS_UPDATE';
  timestamp: number;
  from: 'iOS' | 'watchOS';
  data?: any;
}

// HealthKit バイタルデータ
export interface VitalData {
  heartRate?: number;          // bpm
  respiratoryRate?: number;    // count/min
  timestamp: Date;
}

// アプリ状態
export interface AppState {
  isWatchConnected: boolean;
  lastHealthUpdate?: Date;
  vitals: VitalData;
}

// ユーティリティ関数
export const formatVitalValue = (value?: number, unit: string = ''): string => {
  return value ? `${value}${unit}` : '-';
};

export const isRecentData = (timestamp: Date, maxAgeMinutes: number = 30): boolean => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes <= maxAgeMinutes;
};
