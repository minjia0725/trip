# Git 檢查結果

## 狀態：Git 有安裝，但終端機「找不到」

- **Git 實際位置**：`C:\Program Files\Git\cmd\git.exe`（已確認存在）
- **版本**：git version 2.53.0.windows.1
- **問題**：目前 Cursor / 終端機的 **PATH 沒有包含 Git**，所以輸入 `git` 會顯示找不到指令。

---

## 解法（擇一即可）

### 方法一：重新開 Cursor 或開新終端機（最簡單）

安裝 Git 時若有勾選「Add to PATH」，**關掉 Cursor 再開一次**，或開一個**新的終端機視窗**，通常就會認得到 `git`。  
再在專案資料夾執行：

```bash
git --version
```

若有顯示版本就代表成功，之後可直接用 `git` 做 push。

---

### 方法二：手動把 Git 加入系統 PATH

1. 按 **Win + R**，輸入 `sysdm.cpl`  Enter。
2. 切到 **「進階」** 分頁 → **「環境變數」**。
3. 在 **「系統變數」** 裡選 **Path** → **「編輯」**。
4. **「新增」** 這兩行（依你實際安裝路徑）：
   - `C:\Program Files\Git\cmd`
   - `C:\Program Files\Git\bin`
5. 確定儲存後，**關掉並重開 Cursor**，再開終端機試 `git --version`。

---

### 方法三：用完整路徑執行（不用改 PATH）

在 PowerShell 裡若要單次執行 git，可以用：

```powershell
& "C:\Program Files\Git\cmd\git.exe" status
```

要 push 時就一樣把 `git` 換成上面這串即可。

---

建議先試 **方法一**（重開 Cursor / 新終端機），多數情況這樣就會好。
