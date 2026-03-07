# AXI PRO MAX - منصة الفيديوهات القصيرة الذكية

هذا المشروع هو منصة متطورة للفيديوهات القصيرة مدعومة بالذكاء الاصطناعي (Veo 2.0) وتخزين سحابي ضخم.

## 🚀 كيفية نقل المشروع إلى GitHub (خطوة بخطوة)

اتبع هذه الخطوات بدقة لنقل الكود الخاص بك:

1. **إنشاء مستودع (Repository)**:
   - اذهب إلى [GitHub](https://github.com/) وسجل دخولك.
   - اضغط على زر **New** لإنشاء مستودع جديد باسم `axi-pro-max`.
   - اترك الإعدادات كما هي واضغط **Create repository**.

2. **تنفيذ الأوامر في Terminal**:
   افتح الـ Terminal في بيئة العمل الحالية ونفذ الأوامر التالية بالترتيب:
   ```bash
   git init
   git add .
   git commit -m "الإصدار الاحترافي من AXI PRO MAX"
   git branch -M main
   git remote add origin https://github.com/USERNAME/axi-pro-max.git
   git push -u origin main
   ```
   *(ملاحظة: استبدل USERNAME باسم مستخدم GitHub الخاص بك)*

3. **الربط مع Firebase App Hosting**:
   - اذهب إلى [Firebase Console](https://console.firebase.google.com/).
   - اختر مشروعك الحالي.
   - من القائمة الجانبية، اختر **App Hosting**.
   - اضغط على **Connect to GitHub** واتبع التعليمات لاختيار المستودع الذي رفعته.

## ✨ الميزات التقنية الحالية
- **الذكاء الاصطناعي (Veo 2.0)**: توليد فيديوهات سينمائية من الأفكار النصية.
- **رفع 100MB**: دعم رفع فيديوهات عالية الجودة من الهاتف مباشرة إلى Firebase Storage مع شريط تقدم.
- **أمان عالي**: نظام تسجيل دخول متكامل مرتبط بقاعدة بيانات Firestore.

---
تم التطوير بواسطة AXI AI Engine.
