# Daily Flow - Lively Wallpaper Deployment Guide

## ✅ Pre-Deployment Checklist

### Required Files

- ✅ `index.html` - Main wallpaper page
- ✅ `LivelyInfo.json` - Wallpaper metadata
- ✅ `LivelyProperties.json` - Settings configuration
- ✅ `README.md` - Documentation

### JavaScript Files

- ✅ `js/script.js` - Task management, calendar
- ✅ `js/weather.js` - Weather widget
- ✅ `js/quote.js` - Quote widget
- ✅ `js/system.js` - System stats integration
- ✅ `js/bg-picker.js` - Custom background picker

### Stylesheets

- ✅ `styles/style.css` - Main styles (Paper theme)
- ✅ `styles/scrollbar.css` - Custom scrollbar
- ✅ `styles/bg-picker.css` - Background picker UI

### Assets

- ✅ `photos/` folder - For background images/videos
- ⚠️ `photos/wallpaper.png` - Default background (currently commented out)

## 🚀 Deployment Steps

### 1. Final Git Commit

```powershell
cd "C:\Users\anirban\Desktop\custom wallpaper"
git add .
git commit -m "Final version ready for Lively Wallpaper"
git push
```

### 2. Install in Lively Wallpaper

**Option A: From Local Folder**

1. Open Lively Wallpaper
2. Click "+" → "Add Wallpaper"
3. Select "Webpage" type
4. Browse to: `C:\Users\anirban\Desktop\custom wallpaper\index.html`
5. Click "OK"

**Option B: From ZIP**

1. Create a ZIP of the entire `custom wallpaper` folder
2. In Lively: Click "+" → "Install from file"
3. Select the ZIP file

### 3. Configure Settings (Right-click wallpaper → Customize)

- **City Name**: Enter your city for weather
- **Quote Refresh Interval**: Choose update frequency
- **Background**: Use the on-screen picker button instead

## 🎨 Using the Background Picker

### In Lively Wallpaper (Recommended)

1. Click the small image icon (bottom-left of task panel)
2. Click "Browse"
3. Select any image or video file
4. Click "Apply"
5. ✅ **Background persists** - Uses real file paths

### File Recommendations

- **Images**: JPG, PNG, GIF, WebP
- **Videos**: MP4, WebM, MKV, MOV (any size works in Lively)
- **Location**: Anywhere on your system

## ⚙️ Features Overview

### Task Management

- Add tasks with deadlines and times
- Create subtasks (click task to expand)
- Check off completed items
- Color-coded urgency badges

### Calendar & Agenda

- Click dates to view tasks
- Visual indicators for task days
- Agenda shows selected date's tasks

### System Monitoring

- Real-time CPU, RAM, GPU, NET stats
- Animated graphs
- Auto-detects Lively Wallpaper data

### Weather Widget

- Auto-updates based on city setting
- Dynamic seasonal backgrounds
- Japanese-themed font

### Quote Widget

- Inspirational quotes
- Configurable refresh interval
- Offline fallback quotes

## 🔧 Troubleshooting

### Background Not Changing

- ✅ **Method 1**: Right-click wallpaper → Customize → Select Background (works now!)
- ✅ **Method 2**: Use the on-screen picker button (bottom-left)
- Both methods support unlimited file sizes in Lively

### Video Not Playing

- Ensure file format is supported (MP4, WebM recommended)
- Check console (F12) for error messages
- Try a smaller video file first

### System Stats Not Showing

- Lively provides stats automatically
- "Demo Mode" activates if no Lively data detected
- Click title to toggle demo mode

### Weather Not Loading

- Check internet connection
- Verify city name is correct
- API may have rate limits

## 📝 Known Limitations

1. **Browser Testing**: Files >5MB won't persist in Live Server testing (localStorage quota)
2. **Quote API**: Requires internet connection
3. **Video Formats**: Some codecs may not be supported by Chromium

> [!NOTE]
> **Fixed**: Lively's native background settings now work properly with unlimited file size support!

## 🎯 Best Practices

### For Best Performance

- Use compressed images (<5MB for web testing)
- Use H.264 codec for videos
- Keep task list under 50 items
- Clear completed tasks regularly

### For Persistence

- Always use the on-screen background picker
- In Lively: Any file size works
- In browsers: Keep files <5MB

## 📦 What's Included

### Core Features

- ✅ Task management with subtasks
- ✅ Calendar with deadline tracking
- ✅ System stats monitoring
- ✅ Weather widget
- ✅ Quote widget
- ✅ Custom background picker

### UI/UX

- ✅ Paper theme design
- ✅ Japanese aesthetic (Potta One font)
- ✅ Modern SVG icons
- ✅ Smooth animations
- ✅ Responsive layout

### Data Persistence

- ✅ Tasks saved to localStorage
- ✅ Background preferences saved
- ✅ Settings persist across sessions

## 🎉 You're Ready

Your Daily Flow wallpaper is production-ready for Lively Wallpaper. Just follow the deployment steps above and enjoy your new productivity dashboard!

For updates or issues, check the GitHub repository.
