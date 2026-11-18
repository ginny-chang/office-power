# AgentAvatar

Agent 在任何地方出現時的同一張頭像，依 Agent 的名稱或角色對應到 14 個角色之一。

## 使用者要提供

- `agent`：`{id, name, role, character}`，或只給 id／名稱字串。對應規則寫在 `src-shared/agent-role.js`，例如名稱含「大腦總管」是 NOVA，含「請假」是出勤假勤。
- `size`：邊長，預設 32。
- `round`：圓形；預設是 `r` 圓角方塊。
- `fill`：填滿外層方塊，忽略 `size`。
- `src`：可選，覆蓋預設圖片路徑。預設路徑是網站根目錄的 `bot-avatars/<角色>.png`，圖檔在 Agents 素材裡。

## 規則

- 同一個 Agent 全站同一張頭像，不換成別的圖示或 emoji。
- 頭像是裝飾，`alt` 為空；旁邊一定有 Agent 名稱。
- 大腦總管 NOVA 是白色機器人，負責調度，不能刪除。
- App 類型 icon 與 Chat 的 Agent 圖示可以用 `type-*` 色彩，是全站唯一允許額外色相的地方。
