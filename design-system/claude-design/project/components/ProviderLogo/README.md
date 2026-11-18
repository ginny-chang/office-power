# ProviderLogo

外部連線來源的 22px logo，用在專案 Agent 的連線設定與連線卡片上。

## 使用者要提供

- `id`：`github`、`gitlab`、`jira`、`slack`、`drive`、`postgres` 其中之一。其他值不渲染任何東西。

## 規則

- logo 是第三方品牌的原圖，保留原色，不套主題色。GitHub 的黑色 logo 在深色主題上幾乎看不見，目前沒有處理。
- logo 是裝飾，`alt` 為空；旁邊一定寫出服務名稱。
- 新增來源時在 `ProviderLogo.jsx` 的 `marks` 加上 SVG，圖檔放在 `src-projects/logos/`。
