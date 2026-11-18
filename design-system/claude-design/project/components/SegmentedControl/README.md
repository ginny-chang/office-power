# SegmentedControl

切換同一頁的主要檢視，例如最新排程與歷史排程、我的 Apps 與 Apps 市集。

白色條裡並排 44px 的按鈕，間距 4px，選中的是 `action` 底、`on-ink` 字。數量用 `t-meta` 接在文字後。

## 使用者要提供

- `label`：整組的 `aria-label`。
- `items`：`{value, label, icon?, count?}` 的陣列。`icon` 是 16px 的 lucide 元件。
- `value` 與 `onChange(value)`：目前選中的值，由頁面保管。

## 規則

- 只用來切換主要檢視。面板裡切換內容的子分頁是純文字加底線，不用這個元件。
- 篩選與狀態篩選用 select，靠右排列，每個 160px，不用分段控制。
- 放在畫布上，白色條本身就和 `canvas` 分得開，不另外加框。
