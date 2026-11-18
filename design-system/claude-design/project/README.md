Office Power 是企業內部的「AI 員工」工作區。員工在這裡和各部門的 AI Agent 對話、查看 Agent 正在做什麼、使用 Agent 做出來的小工具（NOVA Apps），並設定定期執行的排程。使用者大多是非技術的一般員工（Normal User），少數是管理者（Admin）；一般使用者也能新增與設定 Agent、調整 App、管理排程。

介面的核心工作是讓人一眼看出「我的 Agent 現在在做什麼、哪裡需要我」，並讓設定像填一張簡單的表單。視覺語言是柔和、留白多的 soft card：`canvas` 淡灰畫布上放 `surface` 白卡片，`action` 代表目前或主要，`lime` 是唯一的品牌點綴色。遇到這裡沒寫到的情況，往更安靜、更少、更一致的方向決定，不要發明新樣式。

## 設計原則

1. **`action` 代表目前選取或主要動作。** 導覽目前頁、分段控制的選中項、primary 按鈕用 `action` 底、`on-ink` 字，其他狀態不用這個底色。
2. **一次只亮一個。** 清單同時只有一列 active；hover 與 active 都用 `surface-2`。
3. **灰色是靜止，白色是正在編輯。** 欄位平常 `surface-2` 底無框，focus 時變 `surface` 並出現 `focus-ring`。
4. **沒有變更就不能儲存。** 儲存鈕在內容沒變時是 disabled，有變更才變成可按的 primary。
5. **同一件事全站同一個樣子。** 同一個動作用同一個 icon、同一個按鈕層級、同一個文案。
6. **長流程用頁面，不用 modal。** 需要捲動、多欄或多步驟的流程是子頁面；對話框只給短的決定，例如確認刪除、編輯單一項目。
7. **狀態不只靠顏色。** 狀態一律是文字或 icon 加顏色。

## 顏色

寫新樣式時只用 token，不寫死色碼。唯二允許寫死的介面色碼是黑色 hover `#2c2c30` 與紅色確認鈕 hover `#b8262b`。

- **畫布與表面**：頁面底色 `canvas`，導覽列 `frame`，卡片、對話框、popover 與 focus 中的欄位 `surface`。`surface-2` 是全站唯一的選取與滑過底色，也是欄位靜止底色；`surface-3` 給灰色元件上的 hover 與 disabled 按鈕。
- **文字**：標題與內文 `ink`；次要文字、label 與說明 `ink-2`；placeholder 與 disabled `ink-3`。`ink-2` 放在 `canvas` 上只有 4.4:1，畫布上的重要文字用 `ink`。`ink-3` 對白底只有 2.5:1，不能寫要讀懂才能操作的文字。
- **線條**：清單分隔與 hairline 用 `line`；刪除鈕外框、未選取選項外框、虛線新增卡用 `line-strong`。卡片沒有邊框。
- **可點擊**：`action` 是 primary 按鈕、選中分段、導覽目前項目的底色，上面的字一律 `on-ink`。圖表長條、tooltip、toast、對話泡泡這類不可點擊的深色塊用 `ink`。
- **品牌點綴**：`lime` 配 `lime-ink`，給數量 badge、帳號頭像、進度強調卡、「已選 N 項」、已完成的 Timeline 步驟。一個區塊最多一個萊姆綠焦點，不當按鈕底色，不大面積鋪滿。`lime-strong` 只給圖表的折線與比例條。
- **狀態**：`danger`／`danger-soft` 只給刪除、失敗與數值下降。`mint`／`mint-strong`／`mint-ink` 給成功、已完成與數值上升。`lavender` 系列給處理中與資訊類的次要標記。`peach`、`rose` 只留給既有元件，新畫面不主動引入。
- **NOVA App 類型**：`type-*` 六組（奶油、萊姆、薄荷、水藍、薰衣草、蜜桃）只給 App 類型 icon、類型標籤與 Chat 的 Agent 圖示。App 類型 icon 的 `top`→`bottom` 漸層是全站唯一可以用漸層與額外色相的地方。

## 外觀主題

四套主題用同一組 token 覆寫，角色不變：簡約淺色（預設）、簡約深色、科技淺色、科技深色。主題只換顏色，圓角、間距、字級都不變。

- `action` 依主題是黑、亮橘、鈷藍、青藍；上面的字一律 `on-ink`。
- `lime` 在簡約淺色是萊姆綠，兩個深色主題是白色，科技淺色是淡藍；上面的字一律 `lime-ink`。
- 深色主題裡 `ink` 變成淺色；簡約深色的正向數字用 `mint-strong`。
- 新樣式一律用 token，不寫死 `#fff` 或白底，主題才會跟著換。
- 主題由 `<html data-theme="…">` 決定，值是 `soft-light`、`soft-dark`、`tech-light`、`tech-dark`。

## 字體排印

`Manrope` 排英文與數字，`Noto Sans TC` 排中文，fallback `PingFang TC`。字型由 Google Fonts 載入，`bundle.css` 已經引入。

- 全站只有 6 級字：`t-display` 40、`t-figure` 32、`t-title` 17、`t-body` 與 `t-body-strong` 14、`t-label` 13、`t-meta` 12。不寫 10、11、15、18、24 這類字級；12px 是下限。
- 層次靠字重與位置，不靠一直放大。字重只用到 500，600 只給 badge 和頭像縮寫。
- 只有 `t-display` 有 -0.02em 字距，`t-figure` 的大數字也用 -0.02em；標題不加字距。
- 數字用 `font-variant-numeric: tabular-nums`。
- 欄位 label 在欄位上方，`t-label`、`ink-2`，間距 8px。補充說明用括號接在 label 後，例如「開場建議問句（每行一個）」。
- 寫 CSS 時用 `font: var(--t-body)` 這類簡寫，`bundle.css` 提供了 `--t-display` 到 `--t-meta`。

## 間距

全部落在 4px 格線上，不確定時選較大的那一階。

- 4px：黏在一起的東西，例如標題與副標、分段控制的按鈕之間。
- `sp-2` 8px：元件內部、icon 與文字、label 與欄位、按鈕之間。
- 12px：textarea 上下、中尺寸按鈕左右、列表列內。4px 與 12px 沒有 token，直接寫。
- `sp-4` 16px：相關群組之間、欄位左右內距、卡片網格 gap、清單分區之間。
- `sp-6` 24px：卡片內距、頁面四周、雙欄卡片之間、頁首與內容之間。
- `sp-8` 32px：大型內容卡與對話框內距。

## 形狀、高度與層次

- 全站只有一種圓角 `r` 12px：卡片、按鈕、欄位、對話框、標籤、頭像。例外只有圓形的狀態燈號、進度點與進度條細線。不做 pill。
- 控制項只有三種高度：`control` 44px 給所有輸入框與大按鈕，`control-md` 36px 給卡片與表格列裡的按鈕，`control-sm` 28px 給密集清單列與文字返回連結。
- 層次靠白卡在灰畫布上產生。`shadow-card` 幾乎看不見；`shadow-float` 給浮在場景上的面板、泡泡與 tooltip；`shadow-sheet` 給對話框、下拉選單與 popover（下拉與 popover 再加 `0 0 0 1px` `line`）。
- 欄位 focus 的唯一樣式是 `focus-ring`，畫在最外層的框上。按鈕與連結的鍵盤 focus 是 `outline: 2px solid var(--ink); outline-offset: 2px`。
- 對話框遮罩是 `rgba(18,18,20,.2)` 加 `backdrop-filter: blur(4px)`。

## 動態

hover 與狀態轉場用 `.2s var(--ease)`，`--ease` 是 `cubic-bezier(.2,.7,.2,1)`。轉場只改顏色與底色，不做彈跳或大位移。

## Icon

圖庫是 `lucide-react`，線寬 1.5。只有四種尺寸：16px（按鈕、清單、搜尋，預設）、20px（導覽列、卡片圖示）、24px（歡迎畫面）、32px（空狀態）。同一個意思全站同一個 icon，對照表在 Icons 元件，並以 `OfficePower.Icons` 匯出。大標與卡片標題前不放 icon。Agent 圖示的 emoji 不受字級與 icon 尺寸限制。

## 元件

- 元件在 `window.OfficePower`，讀 `bundle.css` 裡的 `--op-*` 變數，這些變數已經對應到上面的 token。改主題或改 token 就好，不要直接改 `--op-*`。
- 每個元件的說明列出頁面要提供什麼。WorkspaceRail 需要頁面提供導覽列的外層版面；AgentAvatar 與 WorkspaceRail 需要網站根目錄有對應的圖檔。
- 刪除按鈕不是元件的一個 variant，寫法見 Button 與 Dialog。
