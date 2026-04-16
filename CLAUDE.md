# CLAUDE.md

## Working Agreement
- 先理解 `src/App.tsx`、`src/lib/store.tsx`、`src/components/*` 的角色，再修改畫面或狀態邏輯。
- 以最小必要變更完成需求，優先延續既有結構與資料模型。
- 專案目前沒有 API 與資料庫；任何新功能都應預設在前端本地運作，除非需求明確要求整合外部服務。

## Repo Overview
- `src/App.tsx`：頁面切換、側欄與全域警報 toast。
- `src/lib/store.tsx`：全域狀態、模擬更新、規則與主題設定。
- `src/lib/mockData.ts`：初始烤箱、感測器與規則假資料。
- `src/components/Dashboard.tsx`：烤箱總覽卡片。
- `src/components/OvenDetail.tsx`：單台烤箱的歷史圖表與門檻設定。
- `src/components/Alarms.tsx`：警報歷史與測試警報。
- `src/components/Settings.tsx`：主題、單位與全域規則設定。
- `src/index.css`：主題 token、共用元件樣式與動畫。

## Build / Validation Commands
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`

## Coding Style
- 使用 React function components、hooks、TypeScript type/interface。
- 優先維持單一職責：畫面邏輯留在 component，共用狀態留在 store。
- 沿用現有 Tailwind class 與 CSS custom properties；新增樣式優先補到 `src/index.css` 的共用 token。
- 除非必要，不新增額外套件、不更換狀態管理方案、不導入測試框架。

## Naming Conventions
- Component / type：PascalCase
- function / variable / state：camelCase
- 事件處理器以 `handle...` 命名
- 布林 state 以 `is...`、`has...` 開頭

## Error Handling
- 對找不到資料的情況採早返回。
- 對瀏覽器 API 或非關鍵功能採 `try/catch` 保護，失敗時不中斷主要監控流程。
- 對使用者輸入先做 `Number(...)` 轉換與邏輯檢查，再回寫 state。
- 若 hook 使用情境錯誤，直接丟出明確錯誤。

## Testing Expectations
- 修改前先確認現有 `lint` / `build` 狀態。
- 修改後至少重新執行 `npm run lint` 與 `npm run build`。
- UI 變更需做手動巡檢：總覽、烤箱詳情、警報、設定、主題切換與行動版側欄。

## Security Notes
- 僅能使用假資料，不放入真實工廠資訊或機敏設定。
- 不新增或暴露 API key、token、內部端點。
- 不信任未驗證輸入；任何未來外部資料都需先標準化再渲染。

## Prohibited Changes
- 不保留或重新加入 Google AI Studio / Gemini 相關範本內容。
- 不為了視覺修改而破壞資料更新、警報產生或 GitHub Pages 部署設定。
- 不任意更改 public path、PWA 設定或 build 指令語意。

## Repo-specific Notes
- README 應描述工廠溫度監控產品本身，而非模板來源。
- 若新增環境變數，需同步更新 `.env.example` 與 README。
- 任何影響字串顯示的改動，優先維持繁體中文介面一致性。
