# Daily Flow 🌊

**Active Productivity Dashboard for Lively Wallpaper**

> A wallpaper that doesn't just sit there. It helps you get things done.

![Preview](preview.gif)

## 🚀 Features

- **Productivity System**: Integrated To-Do list, Agenda, and Deadline tracking.
- **Live System Stats**: Real-time CPU, GPU, RAM, and Network monitoring.
- **Dynamic Weather**: Auto-locates your city or lets you set it manually.
- **Customizable**: Change the background, city, and colors directly from Lively settings.
- **Resilient**: Includes an "Auto-Demo" mode so the graph never looks broken.

---

## 📥 How to Install (Read Carefully!)

Because this wallpaper uses **Hardware Stats**, standard import methods might block the data connection. **Follow these steps exactly:**

1. **Download** the Source Code (ZIP) or Clone this repo.
2. Open **Lively Wallpaper**.
3. Click the **+ (Add Wallpaper)** button.
4. Click **Browse** ("Choose a file").
5. **CRITICAL STEP**: Select the **`LivelyInfo.json`** file inside the folder.
    - *Do NOT just select `index.html` or drag the folder.*
    - *Selecting the JSON ensures the "--system-information" argument is loaded.*
6. Click **OK/Open**.

You should see the wallpaper load. If the stats are white, it is working!

### ⚠️ Troubleshooting "Demo Mode"

If the graphs say **"(Demo)"** in gold text, it means Lively is not sending real data.
**Fix:**

1. **Remove** the wallpaper from Lively.
2. **Restart** Lively (Exit from tray).
3. **Add it again**, making sure to select **`LivelyInfo.json`**.

---

## 🛠️ Usage

- **Add Task**: Type in the box and press Enter. (Tasks are saved automatically).
- **Set Deadline**: Click "Select Deadline" to pick a date on the calendar.
- **Customize**: Right-click the wallpaper in Lively -> **Customize Wallpaper**.
  - Change Background Image (supports any image in `photos/` folder).
  - Set City Name for Weather.

## 📜 License

MIT License. Free to use and modify.
Created by **Anirban B. (Spider)**.
[aniplay.eu.org](https://aniplay.eu.org)
