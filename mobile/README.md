# VED — Android (Capacitor)

Оболочка для сайта [vedcompany.ru](https://vedcompany.ru). Без Google Play: собираете APK и ставите на телефон вручную.

- **appId:** `ru.vedcompany.app`
- **Имя:** VED
- **URL:** `https://vedcompany.ru`

## Требования

1. [Node.js](https://nodejs.org/) 18+
2. [Android Studio](https://developer.android.com/studio) (ставит Android SDK и JDK)

Google-аккаунт / Play Console **не нужны**.

## Первый запуск

```bash
cd mobile
npm install
npx cap sync android
```

Если папки `android/` ещё нет:

```bash
npx cap add android
npx cap sync android
```

## Сборка debug APK

### Вариант A — Android Studio

1. Android Studio → **Open** → папка `mobile/android`
2. Дождитесь Gradle Sync
3. **Build → Build Bundle(s) / APK(s) → Build APK(s)** или **Run**
4. APK: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### Вариант B — командная строка

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
cd mobile
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

APK: `android\app\build\outputs\apk\debug\app-debug.apk`

## Как поставить APK на телефон

1. Скопируйте `app-debug.apk` на телефон (USB, Telegram, Google Диск и т.п.).
2. Откройте файл на телефоне.
3. Если система спросит — разрешите **установку из этого источника** / **неизвестные источники** (для Files / Chrome / Telegram — один раз).
4. Подтвердите установку → откройте приложение **VED**.

Интернет на телефоне обязателен: приложение открывает живой сайт.

## Иконка

Заглушка: `assets/icon.png` (тёмный фон). Логотип сайта: `../public/logo.svg`.
Замените на PNG 512x512+ и обновите ресурсы в `android/app/src/main/res/` (mipmap / adaptive icon).

## Смена URL

`capacitor.config.json` → `server.url`, затем `npx cap sync android` и пересборка APK.

## Важно

- WebView-оболочка, не офлайн-каталог.
- Next.js в корне не трогаем — проект в `mobile/`.