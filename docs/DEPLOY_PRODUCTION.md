# Production Deploy Guide (Neon + Render + Vercel)

Этот гайд под ваш проект `sales-dashboard-saas`.

## 1. Что где деплоим

- PostgreSQL: Neon
- API (`apps/api`): Render Web Service
- Frontend (`apps/web`): Vercel

## 2. Подготовка

1. Убедитесь, что проект уже в GitHub.
2. Убедитесь, что локально всё работает (`npm run dev`).

## 3. Neon: создать production БД

1. Зайдите в Neon Console и создайте новый проект.
2. Откройте `Connect` и скопируйте connection string в формате `postgresql://...`.
3. Сохраните строку как `DATABASE_URL`.

Важно:
- Для хостинга обычно используется строка с `sslmode=require`.
- Секреты не публикуйте в Git.

## 4. Применить SQL-схему в Neon

Нужно один раз создать таблицы из `apps/api/sql/init.sql`.

Вариант A (через SQL Editor в Neon):
1. Откройте SQL Editor.
2. Вставьте содержимое `apps/api/sql/init.sql`.
3. Выполните запрос.

Вариант B (через `psql` локально):
```powershell
psql "<ВАШ_DATABASE_URL>" -f apps/api/sql/init.sql
```

## 5. Render: деплой API

Вариант A (рекомендую): через `render.yaml` из репозитория.

1. В Render Dashboard: `New -> Blueprint`.
2. Подключите репозиторий `sales-dashboard-saas`.
3. Render подхватит [`render.yaml`](../render.yaml).
4. Заполните переменные:
   - `DATABASE_URL` = строка Neon
   - `CLIENT_ORIGIN` = позже поставим URL фронтенда
   - `JWT_SECRET` = сгенерируется автоматически
   - `JWT_EXPIRES_IN` = `7d`

После deploy получите URL API, например:
`https://sales-dashboard-api.onrender.com`

Проверка:
- `https://.../api/health` должен вернуть `{"status":"ok","db":"connected"}`.

## 6. Vercel: деплой frontend

1. В Vercel: `Add New -> Project`.
2. Выберите этот же GitHub репозиторий.
3. Настройки проекта:
   - Root Directory: `apps/web`
   - Framework Preset: `Vite`
4. Environment Variables:
   - `VITE_API_URL` = `https://<api-url>.onrender.com/api`
5. Нажмите Deploy.

`apps/web/vercel.json` уже добавлен для SPA rewrites.

## 7. Связать frontend и backend (CORS)

После получения URL фронтенда (например, `https://sales-dashboard-saas.vercel.app`):

1. В Render откройте API service -> Environment.
2. Обновите:
   - `CLIENT_ORIGIN=https://sales-dashboard-saas.vercel.app`
3. Сохраните и сделайте redeploy.

Если нужно несколько origin:
```env
CLIENT_ORIGIN=https://sales-dashboard-saas.vercel.app,https://staging.example.com
```

## 8. Финальная проверка

Откройте frontend URL и проверьте:

1. Регистрация пользователя.
2. Добавление лидов.
3. Edit/Delete.
4. Filters + charts.
5. Export CSV.

## 9. Частые ошибки

1. `CORS blocked for origin ...`:
   - проверьте `CLIENT_ORIGIN` на Render.
2. `password authentication failed`:
   - неверный `DATABASE_URL`.
3. `relation "users" does not exist`:
   - не применили `apps/api/sql/init.sql`.
4. Frontend деплоится, но API недоступен:
   - проверьте `VITE_API_URL` в Vercel.
