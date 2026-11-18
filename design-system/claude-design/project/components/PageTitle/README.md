# PageTitle

每頁唯一的大標，放在頁首時是 `t-display`（40/48、字距 -0.02em），包含子頁面。

## 使用者要提供

- `children`：頁面名稱，例如 My Board、NOVA Apps、稽核紀錄。
- 外層的 `.management .page-heading`：元件本身只有 17px、字重 600；放進頁首這兩層 class 裡才會套 `t-display`，規則在 `bundle.css`（來自 `src-shared/management.css`）。
- `icon`：元件支援，但依規則大標前不放 icon，新畫面不要傳。

## 規則

- 大標貼齊頂端，頁首到內容 `sp-6` 24px。
- 頁面層級的搜尋框與新增按鈕放在同一列右側，新增按鈕靠右、對齊內容區右緣。
- 子頁面頁首由上到下：返回連結 `‹ 上一頁名稱`（寫實際頁名，不寫「返回」；`ChevronLeft` 16px、`t-label` 500、`ink-2`、高 28px、下方 16px），接著一列左邊大標、右邊動作按鈕，底部對齊。
- 子頁面的動作由左到右：刪除 → 立即執行等次要動作 → 儲存 → 預覽 → 發佈，間距 8px。

## 不要

- 卡片標題、對話框標題不用它，改用 `t-title`。
