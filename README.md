# 語言的魔力 · 30 天換框練習 PWA

一個依據 Robert Dilts《**Sleight of Mouth: The Magic of Conversational Belief Change**》（《語言的魔力》）設計的 30 天每日換框（Reframing）手機練習 App。以書中經典的 **14 種語言魔術回應模式**為骨幹，帶 NLP 學員把「換框」從知識，練成反射。

## ✦ 特色

- **30 天結構化課程**：地基 → 14 式單式精修 → 情境演練 → 組合技 → 教學實作 → 結業。
- **14 式語言魔術**：意圖、重新定義、後果、向下細分、向上歸類、類比、改變框架大小、另一個結果、世界模型、現實檢驗、反例、準則層次、反身自用、超越框架。每式皆附書中示範與「句型起手式」。
- **以你自己的信念練習**：第 1 天輸入一個限制性信念，後續每一式都套在它上面練。
- **互動練習欄**：每日筆記自動儲存（localStorage），可在「我的」頁回顧彙整。
- **進度追蹤**：完成天數、連續天數（streak）、練習筆記數，30 天日曆總覽。
- **PWA**：可安裝到手機桌面、**離線可用**、全螢幕原生體驗。
- **清新放鬆視覺**：配色取自參考圖五色（玫瑰、紫、藍、靛、綠），淺色基底、柔和圓角。

## 📁 檔案結構

```
reframe-30-pwa/
├── index.html          # App 外殼
├── styles.css          # 樣式（五色配色系統）
├── data.js             # 30 天課程 + 14 式內容
├── app.js              # 邏輯：路由、渲染、進度、儲存
├── manifest.json       # PWA manifest
├── service-worker.js   # 離線快取
├── icons/              # App 圖示（192 / 512 / maskable）
└── README.md
```

## 🚀 部署到 GitHub Pages

1. 建立一個新的 GitHub repository（例如 `reframe-30`）。
2. 把本資料夾所有檔案上傳（含 `icons/`）：
   ```bash
   git init
   git add .
   git commit -m "30-day reframing PWA"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/reframe-30.git
   git push -u origin main
   ```
3. 到 repo 的 **Settings → Pages**，Source 選 `main` branch、`/ (root)`，儲存。
4. 等一兩分鐘，網址會是 `https://<你的帳號>.github.io/reframe-30/`。
5. 用手機打開該網址 → 瀏覽器選單「加入主畫面」，即成為可離線使用的 App。

> 所有路徑皆為相對路徑（`./`），放在子目錄的 GitHub Pages 也能正常運作。

## 🖥️ 本機預覽

因為用到 Service Worker，需透過 HTTP 伺服器（不能直接雙擊開檔）：

```bash
# 任選一種
npx serve .
# 或
python -m http.server 8000
```

然後開 `http://localhost:8000`。

## 🎨 自訂配色

五個主色定義在 `styles.css` 最上方的 `:root`：

```css
--c-rose:#AE696C; --c-purple:#994FA8; --c-blue:#3D31D0;
--c-indigo:#4213A9; --c-green:#16A11A;
```

14 式的配色會自動依序循環這五色。

## 📝 內容調整

所有課程文字都集中在 `data.js`：
- `PATTERNS`：14 式的定義、心法、句型、書中示範。
- `DAYS`：30 天的每日內容（標題、概念、範例、練習、挑戰）。

修改文字後重新整理即可，無需建置流程。

---

內容依據 Robert Dilts《Sleight of Mouth》(1999) 整理，僅供 NLP 教學與個人練習使用。
