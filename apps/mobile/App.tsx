/**
 * ヘルスチェックアプリ - メインコンポーネント
 * React Native (iOS) + watchOS (SwiftUI) 連携
 * 
 * 機能:
 * - iOS <-> watchOS 通信 (WatchConnectivity)
 * - HealthKit データ読み取り (心拍数・呼吸数)
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
} from 'react-native';

// WatchConnectivity import
import WatchConnectivity from 'react-native-watch-connectivity';

// HealthKit import
import {
  requestAuthorization,
  queryQuantitySamples,
  HKQuantityTypeIdentifier,
} from '@kingstinct/react-native-healthkit';

type VitalData = {
  heartRate?: number;
  respiratoryRate?: number;
  timestamp?: Date;
};

function App(): JSX.Element {
  const [connectionLog, setConnectionLog] = useState<string>('Ready');
  const [vitals, setVitals] = useState<VitalData>({});
  const [isConnected, setIsConnected] = useState(false);

  // WatchConnectivity 初期化
  useEffect(() => {
    const messageSubscription = WatchConnectivity.addListener(
      'message',
      (message: any) => {
        console.log('Watch -> iOS:', message);
        setConnectionLog(prev => `${prev}\nWatch->iOS: ${JSON.stringify(message)}`);
        
        if (message.type === 'PONG') {
          setIsConnected(true);
        }
      },
    );

    // WatchConnectivity 有効化
    WatchConnectivity.activate();
    
    return () => {
      messageSubscription.remove();
    };
  }, []);

  // Watch への PING 送信
  const sendPingToWatch = () => {
    const pingMessage = {
      type: 'PING',
      timestamp: Date.now(),
      from: 'iOS',
    };
    
    WatchConnectivity.sendMessage(pingMessage);
    setConnectionLog(prev => `${prev}\niOS->Watch: PING sent`);
  };

  // HealthKit データ読み取り
  const readHealthData = async () => {
    try {
      // 権限要求
      await requestAuthorization({
        read: [
          HKQuantityTypeIdentifier.heartRate,
          HKQuantityTypeIdentifier.respiratoryRate,
        ],
        write: [],
      });

      // 心拍数取得
      const heartRateData = await queryQuantitySamples({
        type: HKQuantityTypeIdentifier.heartRate,
        unit: 'count/min',
        limit: 1,
        sort: 'desc',
      });

      // 呼吸数取得
      const respiratoryData = await queryQuantitySamples({
        type: HKQuantityTypeIdentifier.respiratoryRate,
        unit: 'count/min',
        limit: 1,
        sort: 'desc',
      });

      const newVitals: VitalData = {
        heartRate: heartRateData[0]?.quantity,
        respiratoryRate: respiratoryData[0]?.quantity,
        timestamp: new Date(),
      };

      setVitals(newVitals);
      
      // Watch にデータ送信
      if (isConnected) {
        WatchConnectivity.sendMessage({
          type: 'HEALTH_DATA',
          data: newVitals,
        });
      }
      
    } catch (error) {
      console.error('HealthKit Error:', error);
      Alert.alert('エラー', 'HealthKit データの読み取りに失敗しました');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>ヘルスチェック</Text>
          <Text style={styles.subtitle}>React Native + watchOS</Text>
        </View>

        {/* Watch 接続状態 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Watch 接続</Text>
          <View style={styles.connectionStatus}>
            <Text style={[styles.statusText, {color: isConnected ? '#4CAF50' : '#FF5722'}]}>
              {isConnected ? '✅ 接続中' : '⚠️ 未接続'}
            </Text>
          </View>
          <Button title="Watch に PING 送信" onPress={sendPingToWatch} />
        </View>

        {/* HealthKit データ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❤️ ヘルスデータ</Text>
          <View style={styles.vitalsContainer}>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>心拍数</Text>
              <Text style={styles.vitalValue}>
                {vitals.heartRate ? `${vitals.heartRate} bpm` : '-'}
              </Text>
            </View>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>呼吸数</Text>
              <Text style={styles.vitalValue}>
                {vitals.respiratoryRate ? `${vitals.respiratoryRate} /分` : '-'}
              </Text>
            </View>
          </View>
          {vitals.timestamp && (
            <Text style={styles.timestamp}>
              最終更新: {vitals.timestamp.toLocaleTimeString('ja-JP')}
            </Text>
          )}
          <Button title="HealthKit データ読み取り" onPress={readHealthData} />
        </View>

        {/* 接続ログ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 接続ログ</Text>
          <ScrollView style={styles.logContainer}>
            <Text style={styles.logText} selectable>
              {connectionLog}
            </Text>
          </ScrollView>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  connectionStatus: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  vitalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    margin: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  vitalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
  },
  logContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    maxHeight: 150,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
});

export default App;
