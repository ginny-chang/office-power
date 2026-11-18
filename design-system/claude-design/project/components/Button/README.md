# Button

全站唯一的按鈕元件，三個層級搭配大中小三種尺寸。

## 層級

| 層級 | 寫法 | 用在 |
|---|---|---|
| Primary | `variant="primary"` | 區域裡最重要的動作：儲存、發佈、新增、送出。一個區域只有一個。 |
| Secondary | 不寫 `variant`（預設） | 次要但明確的動作：立即執行、上一題、重新執行。白底、1px `ink` 框。 |
| Tertiary | `variant="ghost"` | 取消、關閉。無底無框，hover 時 `surface-2`。不帶 icon。 |
| Plain | `variant="plain"` | 不套高度與外框的裸按鈕，只給分段控制、清單列這類自己決定尺寸的地方。 |

Primary 的底色是 `action`，字是 `on-ink`。黑色主題的 hover 是 `#2c2c30`，其他主題由主題決定。

## 尺寸

| 尺寸 | 寫法 | 高度 | 用在 |
|---|---|---|---|
| 大 | 不寫 `size` | `control` 44px | 頁首動作、表單與對話框底部、和輸入框並排 |
| 中 | `size="medium"` | `control-md` 36px | 卡片和表格列裡：重新執行、卡片的 ⋯、列操作 |
| 小 | `size="small"` | `control-sm` 28px | 密集清單列裡：釘選、分組的「+」 |

## 使用者要提供

- `children`：按鈕文字。頁首與表單的動作在文字前放 16px icon（`OfficePower.Icons`），間距 8px；tertiary 不放 icon。
- `iconOnly` 加 `aria-label`：純圖示按鈕，寬高等於該尺寸的高度。
- `loading`：顯示轉圈並停用，`aria-busy` 會自動設好。
- `disabled`：內容沒有變更時的儲存、還沒填完的表單。不降透明度、不隱藏。
- 其餘屬性（`onClick`、`type`、`form`…）照原生 `<button>` 傳入，`type` 預設是 `button`。

## 刪除按鈕

這個元件沒有刪除層級。`variant="danger"` 目前被 `tokens.css` 覆蓋成和 primary 一樣的外觀，程式裡也沒有地方使用，不要拿它做刪除。

- 頁面上的刪除鈕：`surface` 底、`danger` 字、1px `line-strong` 框，hover `danger-soft`，前面放 `Trash2`。按下一定先開確認對話框。
- 確認對話框裡的刪除：`danger` 紅底白字，hover `#b8262b`。寫法見 Dialog。

## 不要

- 不新增按鈕層級或第四種高度。
- 不用 `lime` 或其他顏色當按鈕底色。
- 連到另一頁的文字連結叫「前往」，它是跟文字同高的連結，不是按鈕。
- 對話框 footer 一律靠右：`[取消 ghost] [主要 primary]`。
