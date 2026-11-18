# Card

畫布上的白卡片，代表一個可以操作的獨立物件。

## 使用者要提供

- `children`：卡片內容。標題用 `t-title`，說明用 `t-body` 加 `ink-2`。
- `as`：外層標籤，預設 `article`；整張可點時用 `a` 或 `button`。
- `className` 與其他屬性照原生元素傳入。

## 規則

- `surface` 底、圓角 `r`、無框、`shadow-card`。內距 `sp-6` 24px；大型內容卡 `sp-8` 32px；精簡清單卡 `sp-4` 16px。
- 層次靠白卡放在 `canvas` 上產生，不靠陰影。
- 整張卡片可點就進詳細頁，卡片上不放「編輯」；額外動作收進右上角 `MoreHorizontal`。
- 卡片網格 gap `sp-4` 16px。
- 卡片標題只有文字，不加 icon。
- 「新增」卡：`surface` 底、`line-strong` 虛線、`Plus` 與文字左右並排，icon 無底色。

## 不要

- 單一數字、一個標題或一句話不做成卡片。
- 不在白卡片裡再疊白卡片做層次，不給卡片加邊框。
