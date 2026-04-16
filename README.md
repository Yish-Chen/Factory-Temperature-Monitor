<div align="center">
  <img width="1200" height="475" alt="Factory Temperature Monitor Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Factory Temperature Monitor

工廠烤箱溫度監控儀表板，提供即時溫度總覽、感測器歷史趨勢、異常警報紀錄、門檻設定、主題切換與 OEE 模擬資訊，適合用於展示製造現場監控介面。

## 專案特色

- 即時模擬 18 台烤箱與多支感測器的溫度變化
- 依警告 / 危險門檻自動產生異常警報
- 提供烤箱詳情頁，支援年 / 月 / 日 / 時間維度切換
- 可個別覆寫感測器門檻值
- 支援多種主題樣式與攝氏 / 華氏切換
- 內建 GitHub Pages 部署設定與 PWA 支援

## 技術棧

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Recharts
- Lucide React

## 本機開發

### 需求

- Node.js 20+（建議使用最新版 LTS）

### 啟動步驟

1. 安裝依賴
   ```bash
   npm install
   ```
2. 啟動開發伺服器
   ```bash
   npm run dev
   ```
3. 開啟瀏覽器查看本機畫面

## 驗證指令

```bash
npm run lint
npm run build
```

> 目前專案尚未導入單元測試框架，因此型別檢查與正式建置是主要驗證流程。

## 環境變數

如需調整部署 base path，可建立 `.env.local`：

```bash
VITE_BASE_PATH=/Factory-Temperature-Monitor/
```

一般本機開發可不設定。

## 目錄結構

```text
src/
├─ components/   # 各頁面與主要 UI 模組
├─ lib/          # 全域狀態、工具與假資料
├─ App.tsx       # 頁面骨架與導覽
├─ index.css     # 主題 token 與共用樣式
└─ main.tsx      # 入口點
```

## 部署

專案已包含 GitHub Actions 與 GitHub Pages 設定，推送到主要分支後即可自動建置並部署至：

`https://yish-chen.github.io/Factory-Temperature-Monitor/`

## 開發注意事項

- 目前所有資料皆為前端模擬資料，請勿提交真實工廠資訊或機敏憑證
- 若新增環境變數，請同步更新 `.env.example`
- 若調整 UI 或互動，請確認桌機與行動版版面都可正常使用
