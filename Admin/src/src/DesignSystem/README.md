# نظام تصميم يدنين

المصدر الوحيد للألوان والخطوط والمسافات في كل مشاريع الموقع (الأدمن، وبعدين موقع العملاء).

## الملفات

- **tokens.css** — كل المتغيرات (ألوان، خطوط، مسافات، زوايا). متلمسش الملف ده إلا لو بتغيّر هوية البراند نفسها.
- **base.css** — reset أساسي + classes جاهزة (أزرار، حقول، كروت، بادجات، جداول). ده اللي تستورده في أي صفحة جديدة.

## التثبيت

**1. ضيف الخطوط** في `Admin/index.html` (وبعدين `Clinte/index.html` لما نوحّد الموقع كله) جوه `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap">
```

**2. استورد `base.css` مرة واحدة بس**، في أول سطر بـ `Admin/src/main.jsx`:

```jsx
import './DesignSystem/base.css'
```

(تلقائيًا بيجيب `tokens.css` معاه عن طريق `@import`).

## قواعد الاستخدام

- **ماتكتبش قيم لون أو خط يدويًا** (زي `#3B2436` أو `"IBM Plex Sans Arabic"`) في أي ملف CSS جديد. استخدم المتغير بدلها: `var(--color-plum)`, `var(--font-body)`.
- **الألوان:**
  - `--color-plum` للأزرار الأساسية والعناصر المهمة.
  - `--color-gold` للتمييز بس (أرقام، حالة نشطة)، مش كلون خلفية كبير.
  - `--color-sage` للنجاح، `--color-clay` للخطر/التنبيه.
- **الخطوط:** `--font-display` (Aref Ruqaa) لعناوين كبيرة واسم البراند بس. كل نص تاني `--font-body`.
- **الزوايا:** `--radius-sm` هو الافتراضي لكل حاجة (أزرار، كروت، حقول). متستخدمش استدارة زيادة عن كده إلا للبادجات (`--radius-full`).

## الكلاسات الجاهزة

| الكلاس | الاستخدام |
|---|---|
| `.ds-display` | نص كبير بخط البراند |
| `.ds-page-title` / `.ds-page-sub` | عنوان الصفحة وتحته سطر فرعي |
| `.btn .btn-primary` / `.btn-secondary` / `.btn-danger` | أزرار |
| `.field` | حاوية حقل إدخال مع label |
| `.card` | كارت بسيط بحدود خفيفة |
| `.badge .badge-gold` / `.badge-success` / `.badge-danger` / `.badge-neutral` | بادج حالة أو دور |
| `.table` | جدول بيانات |
| `.state` | رسالة فاضي/تحميل/خطأ |

## مثال سريع

```jsx
<div className="card">
  <h2 className="ds-page-title">المستخدمون</h2>
  <p className="ds-page-sub">إدارة حسابات الموظفين والعملاء</p>

  <span className="badge badge-gold">أدمن</span>

  <button className="btn btn-primary">إضافة مستخدم</button>
</div>
```

كل صفحة جديدة (الطلبات، المستخدمين) المفروض تبني على الكلاسات دي بدل ما تعمل تنسيق جديد من الصفر.