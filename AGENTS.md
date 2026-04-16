# AGENTS.md

## 專案總覽
- 本專案為 React 19 + TypeScript + Vite 的前端儀表板，模擬工廠烤箱溫度監控、警報紀錄、感測器歷史曲線與主題切換。
- 主要資料流由 `src/lib/store.tsx` 集中管理，透過 Context 提供烤箱、警報、規則、單位與主題狀態。
- 介面由 `src/App.tsx` 組裝，主頁面分為總覽、警報紀錄、單台烤箱詳情、系統設定四個區塊。
- 專案目前未接入後端 API，所有資料皆來自 `src/lib/mockData.ts` 與前端定時模擬更新。

## 建置與測試指令
- 安裝依賴：`npm install`
- 開發模式：`npm run dev`
- 型別檢查：`npm run lint`
- 正式建置：`npm run build`
- 本 repo 目前沒有獨立測試框架；若有修改，至少需執行 `npm run lint` 與 `npm run build`。

## 程式碼樣式
- 使用 TypeScript 與函式型 React component。
- 優先沿用既有的命名、檔案結構、Tailwind utility 與 CSS 變數寫法。
- 樣式集中在 `src/index.css` 與 component 內的 Tailwind class，不要引入新的 UI framework。
- 只做必要且聚焦的修改，避免順手重構未涉入區塊。

## 命名規則
- Component、type、context interface 使用 PascalCase。
- hook、函式、state、變數使用 camelCase。
- 常數陣列與固定選項可使用 `const` + camelCase，延續現有寫法。
- 檔名與預設匯出的 React component 維持一致，例如 `Dashboard.tsx` 對應 `Dashboard`。

## Error Handling Pattern
- 對瀏覽器能力或可能失敗的互動採用防禦式寫法，例如 `try/catch` 包住音效播放。
- Context hook 必須在 provider 內使用，違規時直接 `throw new Error(...)`。
- 對缺失資料採早返回（early return），例如找不到烤箱時直接顯示 fallback。
- 表單與數值輸入需先轉型、檢查，再寫回狀態，避免將非法值直接送入 store。

## 測試指引與要求
- 變更 UI 或狀態邏輯後，至少手動驗證：
  - 儀表板切頁與區域篩選
  - 烤箱詳情頁切換感測器、時間檢視、門檻設定
  - 警報頁測試推播
  - 設定頁主題與溫度單位切換
- 每次完成修改後至少執行：
  - `npm run lint`
  - `npm run build`
- 若新增功能含明確分支邏輯，應一併補上可驗證該邏輯的測試或最少的手動驗證步驟。

## 安全考量
- 本專案目前為純前端模擬系統，不應加入真實工廠資料、帳密、金鑰或內網位址。
- 不要將 secrets、token、憑證寫入程式碼、README、範例環境檔或截圖。
- 若未來接入 API，需先驗證輸入、避免直接信任外部資料，並確保 UI 不顯示敏感資訊。
- 避免新增不必要依賴；若可用現有工具完成，優先沿用。

## 禁止事項
- 不要重新引入 Google AI Studio、Gemini API 或與本專案無關的 AI 範本設定。
- 不要任意改動 `src/lib/store.tsx` 的核心資料流，除非需求直接相關。
- 不要移除既有 lint / build 指令或為了通過驗證而刪改無關程式碼。
- 不要在未評估響應式版面下大幅破壞桌機與行動版可用性。

## 其他 repo 特定規則
- `vite.config.ts` 的 `base` 需維持支援 GitHub Pages 部署。
- 專案主要語言以繁體中文 UI 為主，新增文案請維持一致語氣。
- 目前沒有後端服務；若新增資料來源，需先在文件中說明啟動方式與環境需求。
- 若修改 README，內容應以本專案用途為核心，不保留第三方範本敘述。
