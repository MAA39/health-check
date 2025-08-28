# ヘルスチェック

React Native + watchOS ヘルスケア連携アプリ

## 🎯 目的

- **成功体験の積み重ね** - 確実に「動く」アプリ開発
- **iOS ↔ Apple Watch 連携** - WatchConnectivity による双方向通信
- **HealthKit データ読取** - 心拍数・呼吸数の取得と表示

## 🏗️ アーキテクチャ

```
health-check/
├── apps/
│   ├── mobile/          # React Native (iOS)
│   └── watch/           # watchOS (SwiftUI) - Xcodeで追加
├── packages/
│   └── shared/          # 共通型定義・ユーティリティ
└── [設定ファイル群]
```

## 🛠️ 技術スタック

- **モノレポ**: Turborepo + pnpm
- **iOS**: React Native 0.81 + TypeScript
- **watchOS**: SwiftUI (Xcodeターゲット追加)
- **通信**: WatchConnectivity (react-native-watch-connectivity)
- **HealthKit**: @kingstinct/react-native-healthkit

## 🚀 セットアップ

### 前提条件

- Node.js 18+
- pnpm 8+
- Xcode 16.1+
- Apple Developer Program 登録済み
- iPhone + Apple Watch (実機テスト推奨)

### 初期セットアップ

```bash
# リポジトリクローン
git clone https://github.com/MAA39/health-check.git
cd health-check

# 依存関係インストール
pnpm install

# React Native アプリセットアップ
cd apps/mobile
npx react-native@latest init HealthCheck --directory . --template react-native-template-typescript

# iOS 依存関係
cd ios && pod install && cd ..

# HealthKit & WatchConnectivity インストール
pnpm add @kingstinct/react-native-healthkit react-native-watch-connectivity
cd ios && pod install && cd ..
```

### watchOS ターゲット追加

1. `apps/mobile/ios/HealthCheck.xcworkspace` を Xcode で開く
2. **File > New > Target > watchOS > Watch App for iOS App**
3. Product Name: `HealthCheckWatch`
4. SwiftUI Interface 選択
5. ビルド・実行で動作確認

## 🔧 開発コマンド

```bash
# iOS アプリ起動 (実機推奨)
pnpm dev:ios --device

# 型チェック
pnpm typecheck

# リント
pnpm lint

# 全体ビルド
pnpm build
```

## ✅ 成功条件チェックリスト

- [ ] iOS アプリが実機で起動
- [ ] watchOS アプリが Apple Watch で起動  
- [ ] WatchConnectivity で PING/PONG 通信成功
- [ ] HealthKit 権限取得 → 心拍数・呼吸数読取成功
- [ ] iOS ↔ Watch でヘルスデータ共有

## 📱 主要機能

### 1. Watch接続状態表示
- WatchConnectivity セッション状態
- PING/PONG テスト機能

### 2. HealthKit データ読取
- 心拍数 (bpm)
- 呼吸数 (count/min)  
- 最終更新時刻表示

### 3. 接続ログ
- iOS ↔ Watch 通信履歴
- デバッグ用メッセージ表示

## 🔍 トラブルシューティング

### WatchConnectivity が届かない
- `WCSession.activate()` のタイミング確認
- `isReachable` と `transferUserInfo` の使い分け
- 実機での動作確認（シミュレータは不安定）

### HealthKit "Not Authorized"  
- Xcode の Signing & Capabilities で HealthKit 追加確認
- Info.plist の Usage Description キー確認
- Watch アプリ側の設定も必要

### ビルドエラー
```bash
# キャッシュクリア
watchman watch-del-all
rm -rf $TMPDIR/metro-* node_modules ios/Pods
pnpm install && cd ios && pod install
```

## 📈 次の拡張計画

- [ ] ライブ心拍モニタリング (HKWorkoutSession)
- [ ] データ履歴・グラフ表示
- [ ] 通知・アラート機能
- [ ] iCloud 同期

---

**🎉 成功体験を積み重ねて、次のステップへ！**
