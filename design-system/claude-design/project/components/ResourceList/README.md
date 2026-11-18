# ResourceList

簡短項目的清單，每一列是 ResourceRow：icon、名稱、說明、補充資訊與列尾動作。

## 使用者要提供

- `ResourceList`：`label`（清單的 `aria-label`）與 `children`（多個 ResourceRow）。
- `ResourceRow`：
  - `icon`：20px 的 lucide 元件。
  - `title`：名稱，用 `t-body-strong`。
  - `description`：可選的一行說明。
  - `meta`：可選的補充資訊，例如「3 個檔案」，用 `t-meta`。
  - `actions`：列尾的按鈕，用 `size="medium"`；多個動作收進 `MoreHorizontal`。

## 規則

- 列高至少 36px，圓角 `r`；hover 與 active 都是 `surface-2`，同時只有一列 active。
- 清單列本身不是按鈕，不套 44px。
- 分區標題用 `t-meta`、`ink-3`，區塊之間 16px；可收合的分組前面放 chevron。
- 輔助 icon（釘選）：未釘選時不顯示，hover 時顯示 outline，已釘選時實心。
- 人員清單：1px `line` 外框、列之間 `line` 分隔、32px 縮寫頭像、名稱 `t-label` 500、次要資訊 `t-meta`，停用者整列 50% 透明。
- 需要比較欄位時改用 DataTable。
