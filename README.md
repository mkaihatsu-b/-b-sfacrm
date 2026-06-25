# B FORCE CRM — Next.js + Supabase + Vercel

## セットアップ手順

### 1. Supabase プロジェクト作成
1. supabase.com → 「New project」を作成（リージョン: Northeast Asia Tokyo）
2. 左サイドバー「SQL Editor」→ supabase/schema.sql の内容を貼り付けて「Run」

### 2. 環境変数を取得
- Settings → API → Project URL と anon public key をコピー

### 3. GitHub にプッシュ
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/あなた/bforce-crm.git
git push -u origin main
```

### 4. Vercel にデプロイ
1. vercel.com → 「Add New Project」→ GitHubリポジトリを選択
2. Environment Variables を追加:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
3. 「Deploy」

### ローカル開発
```bash
npm install
cp .env.local.example .env.local  # 環境変数を設定
npm run dev
```
