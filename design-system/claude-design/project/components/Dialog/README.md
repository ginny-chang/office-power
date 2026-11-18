# Dialog

給短決定用的對話框，例如確認刪除或編輯單一項目，開啟時用原生 `<dialog>` 的 `showModal()`。

## 使用者要提供

- `title`：對話框標題，用 `t-title`。
- `description`：可選的一行說明。
- `children`：內容。
- `footer`：底部按鈕，靠右排成 `[取消 ghost] [主要 primary]`。
- `onClose`：按右上角關閉鈕或 Escape 時呼叫。元件掛載就開啟、卸載就關閉，開關由頁面用條件渲染控制。
- `headerAction`：可選，放在關閉鈕左邊。
- `size`、`className`：可選。

## 規則

- `surface` 底、圓角 `r`、無框、`shadow-sheet`。內距 header 32/32/16、body 左右 32、footer 16/32/32，內部不畫分隔線。
- 固定高度最高 720px，內容超出時 body 自己捲動。
- 遮罩是 `rgba(18,18,20,.2)` 加 `backdrop-filter: blur(4px)`。
- 右上角是 44px、`surface-2` 底的關閉鈕。關閉後焦點回到開啟前的元素。
- 刪除一定先開確認對話框：footer 是 `[取消 ghost] [刪除]`，刪除鈕加 `className="danger"`，會變成 `danger` 紅底白字。

```jsx
<Dialog title="刪除「出勤假勤助理」？" description="刪除後會從 My Board、Chat 與 Runtime 清單移除。" onClose={close}
  footer={<><Button variant="ghost" onClick={close}>取消</Button><Button className="danger" onClick={remove}>刪除</Button></>} />
```

## 不要

- 需要捲動、多欄或多步驟的流程不塞進對話框，改用子頁面。
- Popover 與下拉選單不是對話框：它們用 `shadow-sheet` 加 1px `line`、內距 8px。
