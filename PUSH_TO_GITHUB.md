# 推送到 GitHub 的指令

你的 repo：`git@github.com:minjia0725/trip.git`

在專案資料夾 `trip` 裡打開 **終端機**（或 Git Bash），依序執行：

```bash
# 1. 進入專案（若還沒在 trip 資料夾裡）
cd "c:\Users\aa813\OneDrive\桌面\東京\trip"

# 2. 若還沒初始化過，執行（若已初始化會提示已存在，可略過）
git init

# 3. 設定遠端（第一次）
git remote add origin git@github.com:minjia0725/trip.git
# 若已經有 origin 但網址不對，可改為：
# git remote set-url origin git@github.com:minjia0725/trip.git

# 4. 加入所有檔案（.env 會被 .gitignore 排除，不會被加入）
git add .

# 5. 提交
git commit -m "Initial commit: 東京行程規劃 + 登入與 Supabase"

# 6. 推上去（主分支通常是 main 或 master，依你 GitHub 預設）
git branch -M main
git push -u origin main
```

若 GitHub 上已經有檔案（例如有 README），先拉再推：

```bash
git pull origin main --rebase
git push -u origin main
```

若出現 `Permission denied` 或 SSH 錯誤，請確認已設定 SSH key 並加入 GitHub：  
<https://docs.github.com/zh/authentication/connecting-to-github-with-ssh>
