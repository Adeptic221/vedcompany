# VED — следующие шаги

Обновлено: 2026-08-13 (вечер)

## Сделано сегодня (1–3)

1. **Сервер документов** — загрузка на сервер (Blob / GitHub / local), видно менеджеру в `/admin/clients`
2. **Админка менеджера** — `/admin/clients`, `/admin/orders` (стадии), `/admin/chats`
3. **Resend** — код готов; на Vercel нужны `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`

Также: слот «Реквизиты (ИП / ООО)» в документах клиента.

## Env на Vercel (обязательно проверить)

```
RESEND_API_KEY=...
EMAIL_FROM=VED Services <noreply@ваш-домен>
APP_URL=https://vedcompany.ru
BLOB_READ_WRITE_TOKEN=...   # желательно для файлов
GITHUB_TOKEN=...            # уже есть для users/catalog
```

## Дальше

4. ООО и реквизиты VED на сайт
5. Ступенчатая маржа услуг
6. Живой каталог Carapis
7. SMS-восстановление пароля