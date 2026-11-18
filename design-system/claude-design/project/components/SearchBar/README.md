# SearchBar

左側帶放大鏡的搜尋框，整個包裝層是一個欄位，focus 時由包裝層變白出外環。

## 使用者要提供

- `label`：搜尋框的 `aria-label`，畫面上不顯示。
- `placeholder`、`value`、`onChange`：照原生 `<input type="search">` 傳入。
- `className`：放在畫布上時，由頁面加 class 改成 `surface` 白底。

## 規則

- 高 `control` 44px，放大鏡 16px 在左側 16px 處，文字用 `t-label`。
- 外環只畫在最外層，裡面的 input 不再多一圈。
- 頁面層級的搜尋框放在頁首同一列右下，寬度對齊最右欄。
- 放在卡片裡用預設的 `surface-2`；放在畫布上用 `surface`。
