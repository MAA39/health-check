/*
 * ヘルスチェック watchOS - メインビュー
 * WatchConnectivity + HealthKit 対応
 * 
 * 注意: このファイルは参考用です
 * 実際は Xcode で watchOS ターゲット追加時に生成されます
 */

import SwiftUI
import WatchConnectivity

struct ContentView: View {
    @StateObject private var connectivity = WatchConnectivityManager()
    
    var body: some View {
        VStack(spacing: 12) {
            // ヘッダー
            Text("ヘルスチェック")
                .font(.headline)
                .foregroundColor(.blue)
            
            // iOS接続状態
            HStack {
                Circle()
                    .fill(connectivity.isConnected ? Color.green : Color.red)
                    .frame(width: 8, height: 8)
                Text(connectivity.isConnected ? "接続中" : "未接続")
                    .font(.caption)
            }
            
            // バイタルデータ表示
            if let vitals = connectivity.latestVitals {
                VStack(spacing: 4) {
                    HStack {
                        Text("❤️ \(vitals.heartRate ?? 0, specifier: "%.0f") bpm")
                            .font(.caption2)
                    }
                    HStack {
                        Text("🫁 \(vitals.respiratoryRate ?? 0, specifier: "%.0f") /分")
                            .font(.caption2)
                    }
                }
            } else {
                Text("データなし")
                    .font(.caption2)
                    .foregroundColor(.gray)
            }
            
            // PING送信ボタン
            Button("PING送信") {
                connectivity.sendPingToiOS()
            }
            .buttonStyle(.borderedProminent)
            .font(.caption2)
        }
        .padding()
    }
}

// WatchConnectivity管理クラス
class WatchConnectivityManager: NSObject, WCSessionDelegate, ObservableObject {
    @Published var isConnected = false
    @Published var latestVitals: VitalData?
    
    override init() {
        super.init()
        if WCSession.isSupported() {
            WCSession.default.delegate = self
            WCSession.default.activate()
        }
    }
    
    func sendPingToiOS() {
        guard WCSession.default.isReachable else { return }
        
        let message: [String: Any] = [
            "type": "PONG",
            "timestamp": Date().timeIntervalSince1970,
            "from": "watchOS"
        ]
        
        WCSession.default.sendMessage(message, replyHandler: nil) { error in
            print("Watch -> iOS send error: \(error.localizedDescription)")
        }
    }
    
    // MARK: - WCSessionDelegate
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            self.isConnected = activationState == .activated && session.isReachable
        }
    }
    
    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.isConnected = session.isReachable
        }
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        DispatchQueue.main.async {
            if let type = message["type"] as? String {
                switch type {
                case "PING":
                    // iOSからのPINGに対してPONGを返す
                    self.sendPingToiOS()
                case "HEALTH_DATA":
                    // HealthKitデータを受信
                    if let data = message["data"] as? [String: Any] {
                        self.latestVitals = VitalData(
                            heartRate: data["heartRate"] as? Double,
                            respiratoryRate: data["respiratoryRate"] as? Double,
                            timestamp: Date()
                        )
                    }
                default:
                    break
                }
            }
        }
    }
}

// バイタルデータ構造体
struct VitalData {
    let heartRate: Double?
    let respiratoryRate: Double?
    let timestamp: Date
}

#Preview {
    ContentView()
}
