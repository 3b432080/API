# 元件清單與 W10 元件化 Prompt

## 步驟一：圈出重複區塊（依 index.html 實際內容）
| 重複區塊 | 重複次數 | 元件名稱 | props | 對應老師範例 |
|---|---|---|---|---|
| 社團卡片 | 8（`v-for` 產生） | ClubCard | club、selected | 興趣卡片 HobbyCard |
| 活動項目 | 3 | EventItem | event | 作品卡片 ProjectCard |
| 技術／社團標籤 | 每張卡片 2 個，共 16 | BaseTag | title、content | 技術標籤 BaseTag |
| 對話泡泡 | 動態 | ChatBubble | role、text | 額外元件 |
| 欄位提示訊息 | 5 處 | FieldMessage | msg、ok | 額外元件 |

不拆的區塊：導覽列（只出現一次）、各 `section` 標題（結構不同）。

## 步驟一 Prompt
```
這是我的網頁HTML（貼上 index.html）,請幫我找出畫面裡有哪些重複出現、適合拆成元件的區塊,並列出建議的元件名稱
```

## 步驟二 Prompt（套用到本專題）
```
請幫我把社團卡片區塊拆成一個 Vue 3 元件 ClubCard，用 props 接收社團資料與是否被選取，並在主頁面示範怎麼呼叫並傳入多筆不同的模擬資料
請幫我把活動項目區塊拆成一個 Vue 3 元件 EventItem，用 props 接收活動資料，並在主頁面示範怎麼呼叫並傳入三筆不同的模擬資料
請幫我把標籤區塊拆成一個 Vue 3 元件 BaseTag，用 props 接收標題與內容，並在社團卡片中使用
```
> 繳交時請換成你實際貼給 AI 的 Prompt 與 AI 的回覆。

## 檔案位置
- 元件：`assets/js/components.js`
- 傳入模擬資料並呼叫：`index.html`（`<club-card v-for ...>`、`<event-item v-for ...>`）、資料在 `data/clubs.js`
