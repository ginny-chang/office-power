# DataTable

需要比較欄位的資料用表格，外層可橫向捲動，沒有資料時顯示一句空狀態。

## 使用者要提供

- `caption`：表格名稱，給螢幕閱讀器，也當捲動區的 `aria-label`。
- `columns`：`{key, label, render?}` 的陣列。`render(row)` 回傳該格內容，例如狀態標籤或按鈕。
- `rows`：資料陣列。
- `getKey`：可選，預設用 `row.id`。
- `empty`：沒有資料時的文字，預設「沒有符合的資料」。

## 規則

- 放在白卡片裡。列裡的按鈕用 `size="medium"`。
- 數字欄位用 `tabular-nums`；金額單位寫在欄名後面，例如「費用（USD）」。
- 可展開的表格：整列可點，前面放 chevron，展開時底色 `surface-2`；列尾的外部連結不觸發展開。
- 狀態欄一律是文字加顏色，不只靠顏色。
- 短的項目清單改用 ResourceList，不用表格。
