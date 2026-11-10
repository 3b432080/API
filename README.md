# 勤益社團一站通｜互動式網頁設計期中專題

瀏覽社團、線上報名，並用**本機執行的 AI**（LM Studio）詢問社團資訊。
純前端、不需 Node.js、不需建置，雙擊或用本機伺服器開啟即可。

## 檔案結構
```
index.html                 頁面（語意化結構＋報名表單＋Vue 模板）
assets/css/style.css       樣式與 RWD
assets/js/components.js    Vue 元件：BaseTag / ClubCard / EventItem / ChatBubble / FieldMessage
assets/js/app.js           主程式：篩選、表單驗證、本地 AI 串接
data/clubs.js              模擬資料（社團、活動）
docs/                      需求拆解表、Prompt 紀錄、自我檢核對照
```

## 本機執行
```bash
# 在專案資料夾執行（Python）
python -m http.server 5500
# 然後開啟 http://localhost:5500
```
也可以用 VS Code 的 Live Server。頁面會從 jsDelivr 載入固定版本的 Vue（vue@3.4.38），需要網路；
離線展示時，把 `vue.global.prod.js` 下載到 `assets/js/`，再改 `index.html` 的 `<script src>`。

## 啟用 AI 小幫手（LM Studio）
1. 開啟 LM Studio，載入一個**對話模型**（例如 Qwen3 4B Q4_K_M，Context Length 4096）
2. Developer → Start server（預設 `127.0.0.1:1234`），Server Settings 開啟 **Enable CORS**
3. 網頁「AI 小幫手」→ 按「取得模型清單」→ 選模型 → 提問

常見問題：
- 連不上：檢查 Server 是否啟動、位址埠號、Enable CORS
- 部署在 GitHub Pages（https）時：Chrome／Edge 通常允許呼叫 `127.0.0.1`，Safari 可能擋；
  展示時建議改用本機伺服器開啟
- 回答空白或很慢：換小模型、縮短上下文、關閉其他佔用顯示卡的程式

## 部署到 GitHub Pages
1. 把整個資料夾推到 GitHub Repository
2. Settings → Pages → Source 選 `main` 分支、`/ (root)`
3. 把公開網址填進期中考表單與 `docs/03_期中自我檢核對照.md`

## 已知限制
- 沒有後端：報名資料不會儲存，重新整理即清空
- 名額與資料為靜態模擬，AI 不能查詢即時名額
