# 🌿 井戸端Farm Bot

空き家の植物管理を近隣住民と共有するLINE Botです。

---

## デプロイ手順

### 1. GitHubにアップロード

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/idoubata-farm-bot.git
git push -u origin main
```

### 2. Vercelにデプロイ

1. https://vercel.com にアクセスしてGitHubアカウントでログイン
2. 「Add New Project」→ GitHubのリポジトリを選択
3. 「Environment Variables」に以下を追加：

| 変数名 | 値 |
|---|---|
| `LINE_CHANNEL_SECRET` | LINE Developersのチャネルシークレット |
| `LINE_CHANNEL_ACCESS_TOKEN` | チャネルアクセストークン（長期） |

4. 「Deploy」ボタンを押す
5. デプロイ完了後、URLが発行される（例：`https://idoubata-farm-bot.vercel.app`）

### 3. LINE DevelopersにWebhook URLを登録

1. LINE Developersコンソール → Messaging API設定タブ
2. Webhook URL欄に入力：`https://あなたのURL.vercel.app/webhook`
3. 「検証」ボタンを押して「成功」が表示されればOK
4. 「Webhookの利用」をオンにする

---

## 使い方（LINEグループに追加後）

| 送るメッセージ | Botの反応 |
|---|---|
| 「水やりしました」 | 💧 水やり記録 |
| 「ミントを収穫」 | 🌿 収穫記録 |
| 「草取りしました」 | 🌾 雑草除去記録 |
| 写真を送る | 📸 写真受信確認 |
| 「バジル元気です」 | 📋 状態記録 |
| 「ヘルプ」 | 使い方一覧を表示 |

---

## ローカルでのテスト方法

```bash
cp .env.example .env
# .envにキーを入力してから：
node index.js
```

ngrokを使うとローカルでもWebhookをテストできます：
```bash
npx ngrok http 3000
# 発行されたURLをLINE DevelopersのWebhook URLに設定
```
