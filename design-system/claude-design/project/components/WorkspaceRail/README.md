# WorkspaceRail

每個工作區頁面左側的導覽列：logo、主要頁面、Admin 頁面，最下方是萊姆綠的帳號頭像與帳號選單（AccountMenu）。

## 使用者要提供

- `active`：目前頁面的名稱，例如 `"My Board"`、`"Chat"`、`"NOVA Apps"`，對應的項目會標成 `aria-current="page"`。
- 頁面根目錄的 `officepower-app-icon.svg`（Logos 素材裡有），以及導覽連到的各頁 HTML。
- 外層版面：導覽列的寬度與直向排列寫在各頁面自己的樣式裡，這個元件不帶。頁面要提供：

```css
.rail{width:80px;padding:var(--sp-6) 16px;background:var(--frame);display:flex;flex-direction:column;align-items:center}
.rail nav{display:flex;flex-direction:column;gap:4px;margin-top:var(--sp-6)}
.rail img{width:36px}
```

## 規則

- 80px 寬、`frame` 底、`z-index:50`，蓋在子頁面（`z-index:40`）之上，tooltip 才不會被擋住。
- logo 36px 置中，往下 24px 開始是導覽項。
- 導覽項 44px、icon 20px，平常無底色，hover `surface-2`，目前頁是 `action` 底、`on-ink` 字。
- 滑過時右側顯示 `ink` 底 tooltip。
- Admin 頁面（專案 Agent、能力中心、員工名單、用量與費用、Runtime 管理）只對 Admin 顯示，一般使用者整個看不到，不是 disabled。
- 帳號選單只放名稱、Email、檢視身份、「設定」與「登出」，不加 icon；所有身分都一樣。
- 元件會讀 `localStorage` 裡的使用者身分與帳號設定。
