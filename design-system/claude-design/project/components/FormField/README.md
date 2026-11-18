# FormField

把 label、欄位與說明或錯誤訊息綁在一起，並自動接好 `id`、`aria-invalid` 與 `aria-describedby`。

## 使用者要提供

- `label`：欄位名稱。補充說明用括號接在後面，例如「開場建議問句（每行一個）」。
- `children`：剛好一個欄位元素（`<input>`、`<select>`、`<textarea>` 或 `Input`）。
- `hint`：可選的說明，顯示在欄位下方。
- `error`：錯誤訊息。有值時取代 `hint`，以 `role="alert"` 宣讀，欄位標成 `aria-invalid`。
- `id`：可選，不給就自動產生。

## 規則

- label 在欄位上方，`t-label`、`ink-2`，與欄位間距 8px。
- 錯誤訊息用白話寫清楚下一步，不直接顯示技術訊息。
- 需要說明的選擇（例如誰可以使用）用 select 加下方 `t-meta` 說明。
- 停用的欄位照樣顯示目前的值，不隱藏。
