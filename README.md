# Ziko Connect — Zero-Cost Signaling & WorldWave Relay Server

## 1. স্থানীয় নেটওয়ার্কে (Same Wi-Fi) ২ টি ডিভাইসে টেস্ট করার উপায়:
১. আপনার পিসির কমান্ড প্রম্পটে যান এবং প্রজেক্টের `server/` ফোল্ডারে যান:
   ```bash
   cd server
   npm install
   npm start
   ```
২. পিসির IPv4 IP বের করুন (যেমন `ipconfig` রান করে `192.168.1.100`)।
৩. উভয় ফোনেই Ziko Connect অ্যাপে সিগন্যালিং URL হিসেবে `ws://192.168.1.100:8080` কানেক্ট করবেন।

---

## 2. বিনামূল্যে ইন্টারনেটে (Oracle Cloud Free Tier / Render / Railway) হোস্ট করার উপায় ($0 Cost):
১. **Render.com / Railway.app** বা **Oracle Cloud Always Free Tier**-এ ফ্রি অ্যাকাউন্ট খুলুন।
২. এই `server/` ফোল্ডারটি GitHub-এ পুশ করে বিনামূল্যে Web Service হিসেবে ডিপ্লয় করুন।
৩. ডিপ্লয় হলে আপনি বিনামূল্যে SSL ওয়েবসকেট URL পাবেন: `wss://your-app.onrender.com`
৪. অ্যাপের `SignalingService`-এ এই URL টি বসালেই সম্পূর্ণ বিনামূল্যে বিশ্বজুড়ে ২ টি ভিন্ন ৪জি/৫জি মোবাইলের মধ্যে E2EE চ্যাট, WebRTC অডিও/ভিডিও কল এবং WorldWave লাইভ কাজ শুরু করবে!
