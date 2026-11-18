# Badge

一兩個字的狀態標籤，顏色有意義，旁邊一定有文字。

## 使用者要提供

- `tone`：`neutral`（預設）、`primary`、`success`、`warning`、`danger`。
- `children`：標籤文字，例如「已完成」「連線失敗」。

## 三種標記

- **狀態標籤**：`<Badge tone="…">`。高 24px、左右 8px、`t-meta`、圓角 `r`。已完成與上升用 `success`，失敗與下降用 `danger`，待命用 `neutral`。
- **數量 badge**：不用這個元件，直接寫 `<span class="op-badge">3</span>`（不帶 tone class）。`lime` 底、`lime-ink` 字、高 24px、600 12px，只表示數量。
- **狀態燈號**：8px 圓點，無光暈，旁邊一定有文字。成功 `mint-strong`、失敗 `danger`、停用 `ink-3`。

## 較上期比較

全站同一規則：上升是 `mint` 底、`mint-ink` 字，下降是 `danger-soft` 底、`danger` 字，都帶箭頭；持平或沒有資料是灰色並寫文字。費用增加也顯示綠色，這是目前的決定。

## 注意

在簡約淺色主題下，`success`、`warning`、`danger` 三個 tone 讀的是 `src-shared/ui/tokens.css` 的舊色值，還沒對應到 `mint` 與 `danger`；其他三個主題已經對應。新畫面要和 DESIGN.md 完全一致時，狀態標籤直接用 `mint`／`mint-ink` 與 `danger-soft`／`danger`。

## 不要

- 不用顏色單獨表示狀態。
- `danger` 只給刪除、失敗與數值下降。
