# Icons

同一個意思全站只用同一個 lucide icon，`OfficePower.Icons` 收的就是這張對照表。

| 意思 | Icon | 意思 | Icon |
|---|---|---|---|
| 編輯 | `Pencil` | 新增 | `Plus` |
| 儲存 | `Check` | 用量與費用 | `Wallet` |
| 稽核紀錄 | `ScrollText` | 監控紀錄 | `SquareActivity` |
| 設定 | `Settings` | 送出、下一步 | `ArrowRight` |
| 發佈 | `Globe` | 上一步、返回 | `ChevronLeft` |
| 下一題 | `ChevronRight` | 更多 | `MoreHorizontal` |
| 開啟 App | `ArrowUpRight` | 搜尋 | `Search` |
| 刪除 | `Trash2` | 立即執行 | `Play` |
| 重新執行 | `RotateCw` | 釘選 | `Pin` |
| 放大預覽 | `Maximize2` | | |

## 使用者要提供

- `size`：只有四種。16px 是預設，用在按鈕、清單、搜尋；20px 用在導覽列與卡片圖示；24px 用在歡迎畫面；32px 用在空狀態。
- 顏色跟著文字走（`currentColor`），未選取的 icon 用 `ink-2`。

## 規則

- 線寬 1.5，`bundle.css` 已經對 `svg.lucide` 設好。
- 大標與卡片標題前面不放 icon。
- 對照表以外的 icon 直接從 `lucide-react` 匯入；同一個意思已經在表裡就不要換別的。
- Agent 圖示的 emoji 不受字級與 icon 尺寸限制。
