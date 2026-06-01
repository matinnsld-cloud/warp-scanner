# 🚀 Warp Scanner

یک اسکنر سریع و قدرتمند برای تست Warp Endpoints کلودفلر

## ✨ ویژگی‌ها

- ✅ اسکن **16 کانال همزمان** برای سرعت بالا
- ✅ تست **Ping/Latency** برای هر اندپوینت
- ✅ اندازه‌گیری **سرعت دانلود** بر حسب KB/s
- ✅ فیلتر خودکار IP‌های **سالم** (بالای 100 KB/s)
- ✅ **Timeout 3 ثانیه** برای هر اتصال
- ✅ خروجی **فایل متنی** مرتب‌شده
- ✅ نمایش **Top 10** سریع‌ترین اندپوینت‌ها

## 📋 رنج‌های IP

```
162.159.192.0/24
162.159.193.0/24
162.159.195.0/24
162.159.204.0/24
188.114.96.0/24
188.114.97.0/24
188.114.98.0/24
188.114.99.0/24
```

## 🔌 پورت‌های پیش‌فرض

```
854, 859, 864, 878, 880, 890, 891, 894, 903, 908, 928, 934, 939, 942, 943, 945,
946, 955, 968, 987, 988, 1002, 1010, 1014, 1018, 1070, 1074, 1180, 1387, 1843,
2371, 2506, 3138, 3476, 3581, 3854, 4177, 4198, 4233, 5279, 5956, 7103, 7152,
7156, 7281, 7559, 8319, 8742, 8854, 8886
```

## 🚀 نصب و اجرا

### نیازمندی‌ها
- Node.js 14+
- npm

### مراحل

1. **کلون کردن**
```bash
git clone https://github.com/matinnsld-cloud/warp-scanner.git
cd warp-scanner
```

2. **نصب dependencies**
```bash
npm install
```

3. **اجرا**
```bash
npm start
```

## 📊 خروجی

اسکنر یک فایل `results-[timestamp].txt` ایجاد می‌کند:

```
Warp Endpoint Scanner Results
Generated: 2024-01-15T10:30:45.123Z
Total Found: 245
========================================

IP:PORT | Latency(ms) | Speed(KB/s)
----------------------------------------
162.159.192.1:8886 | 45ms | 2450 KB/s
162.159.192.5:8854 | 52ms | 2340 KB/s
188.114.96.10:7281 | 38ms | 2210 KB/s
...
```

## ⚙️ تنظیمات

میتوانی این متغیرها را در `warp-scanner.js` تغییر دهی:

```javascript
const TIMEOUT = 3000;          // Timeout (ms)
const MIN_SPEED = 100;         // حداقل سرعت (KB/s)
const CONCURRENT = 16;         // تعداد اسکن همزمان
const TEST_SIZE = 1024 * 100;  // سایز تست (bytes)
```

## 📈 خروجی Console

```
🚀 Warp Endpoint Scanner Started

📊 Configuration:
   - IP Ranges: 8 ranges
   - Ports: 50 ports
   - Timeout: 3000ms
   - Min Speed: 100 KB/s
   - Concurrent: 16

📍 Generating IP addresses...
✅ Total IPs to scan: 2048

🔍 Starting scan (102400 tasks)...

📊 Progress: 100% (102400/102400) - 45.2s

✅ Scan Complete!

📈 Statistics:
   - Total scanned: 102400
   - Found: 245
   - Success rate: 0.24%
   - Time: 45.2s

💾 Results saved to: results-1705315845123.txt

🏆 Top 10 Fastest Endpoints:

1. 162.159.192.1:8886 - 2450 KB/s (45ms)
2. 162.159.192.5:8854 - 2340 KB/s (52ms)
...
```

## 🔧 استفاده در BPB Panel

فایل `results-[timestamp].txt` را می‌توانی در **BPB Panel Settings** → **Warp Endpoints** استفاده کنی.

## 📝 لایسنس

MIT

## 👨‍💻 نویسنده

matinnsld-cloud

---

**نکته**: این اسکنر برای اهداف شخصی و تحقیقی طراحی شده است.
