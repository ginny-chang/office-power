# Input

單行欄位、select 與 textarea 共用的欄位元件，靜止時灰底無框，focus 時變白出外環。

## 使用者要提供

- `as`：`"input"`（預設）、`"select"` 或 `"textarea"`。
- 其餘屬性照原生元素傳入：`value`、`onChange`、`placeholder`、`rows`、`disabled`…
- label 由外層提供，通常用 FormField；不用 FormField 時要有 `aria-label`。

## 規則

- 靜止：`surface-2` 底、無框、圓角 `r`、`t-body`、左右 16px。單行欄位與 select 高 `control` 44px。
- Focus：底色變 `surface`、加 `focus-ring`，不加 outline、不改框線。外環畫在最外層的框上。
- Textarea：上下 12px、行高 20px、可垂直拉伸。內容只會有一行的欄位用 input，不用 textarea。
- Select：去掉原生外觀，右邊 16px 處一個 16px 細線 chevron，右內距 40px。
- Placeholder 用 `ink-3`，所以 placeholder 不能是唯一的說明。
- 放在畫布上的篩選欄位用 `surface` 白底，灰疊灰會看不見。

## 不要

- 欄位 focus 不加粗邊框、不換框色。
- 欄位與 focus 的全站規則已經在 `bundle.css`，頁面裡不要另外寫一套。
