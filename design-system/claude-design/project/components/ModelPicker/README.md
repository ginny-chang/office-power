# ModelPicker

可搜尋的模型選單，依供應商分組，選項顯示模型名稱與一行說明。

## 使用者要提供

- `value` 與 `onChange(value)`：選中的模型值，例如 `"inherit"` 或 `"openai/gpt-6.1-sol"`。
- `id`：欄位 id，讓外層的 label 對得上，預設 `agent-model`。
- `autoFocus`：開啟時是否直接聚焦搜尋。

## 規則

- 第一個選項永遠是「繼承工作空間預設」，Agent 沒有特別需求就用它。
- 下拉選項只列使用者需要的資訊：名稱與說明，不列模型 id。選中後，欄位下方的摘要列會顯示供應商、名稱與 id。
- 下拉是 popover：`surface` 底、圓角 `r`、`shadow-sheet` 加 1px `line`、內距 8px；選項 hover 與選中 `surface-2`。
- 下拉不能被父層裁切或超出畫面。
- 模型清單寫在 `ModelPicker.jsx` 的 `agentModelGroups`，新增模型改那裡。
