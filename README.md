# Sales Dashboard SaaS

CRM-дашборд для учета лидов: авторизация, CRUD, фильтры, demo-данные и аналитика с графиками.

## Что можно делать в приложении

- Регистрироваться и входить в систему.
- Создавать, редактировать, удалять лиды.
- Менять статус лидов (`new`, `in_progress`, `won`, `lost`).
- Использовать поиск, фильтры и сортировку.
- Загружать demo-данные одной кнопкой.
- Смотреть аналитические карточки и графики.

## Технологии

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Auth: JWT
- Infra (local): Docker Compose

## Структура проекта

```text
sales-dashboard-saas/
  apps/
    api/
      src/
      sql/init.sql
    web/
      src/
  docs/
  docker-compose.yml
  package.json
```

## Могут ли другие люди пользоваться сайтом

Да.

- Локально в вашей сети: запустите `npm run dev:lan` и дайте коллегам ваш локальный IP.
- Публично в интернете: задеплойте frontend, backend и PostgreSQL в облако.

Ниже есть пошаговые инструкции для обоих сценариев.

## Требования

- Node.js 20+
- npm 10+
- Docker Desktop (для запуска PostgreSQL локально)

## Быстрый старт (локально)

1. Перейдите в папку проекта.

```powershell
cd C:\Users\user\Desktop\fullstack\sales-dashboard-saas
```

2. Создайте env-файлы.

```powershell
Copy-Item apps\api\.env.example apps\api\.env -Force
Copy-Item apps\web\.env.example apps\web\.env -Force
```

3. Установите зависимости.

```powershell
npm install
```

4. Поднимите PostgreSQL.

```powershell
npm run db:up
```

5. Запустите backend + frontend.

```powershell
npm run dev
```

6. Откройте:

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000/api`
- Healthcheck: `http://localhost:4000/api/health`

## Запуск для других устройств в локальной сети

1. Узнайте ваш локальный IP (например, `192.168.0.25`).
2. В `apps/api/.env` укажите:

```env
CLIENT_ORIGIN=http://localhost:5173,http://192.168.0.25:5173
```

3. Запустите:

```powershell
npm run dev:lan
```

4. Другие устройства в вашей сети открывают:

`http://192.168.0.25:5173`

## Основные npm-команды

- `npm run dev` - локальный запуск frontend + api.
- `npm run dev:lan` - запуск с доступом по локальной сети.
- `npm run dev:api` - только API.
- `npm run dev:web` - только frontend.
- `npm run db:up` - поднять PostgreSQL.
- `npm run db:down` - остановить контейнеры.
- `npm run db:logs` - смотреть логи БД.
- `npm run build -w apps/web` - production-сборка frontend.

## Переменные окружения

### apps/api/.env

- `PORT` - порт API (по умолчанию `4000`).
- `CLIENT_ORIGIN` - разрешенные origin для CORS.
- `DATABASE_URL` - строка подключения PostgreSQL.
- `JWT_SECRET` - секрет подписи JWT.
- `JWT_EXPIRES_IN` - срок жизни токена (`7d`, `12h` и т.д.).

### apps/web/.env

- `VITE_API_URL` - base URL API (например `http://localhost:4000/api`).

## API (основные роуты)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`
- `GET /api/leads`
- `POST /api/leads`
- `PUT /api/leads/:id`
- `DELETE /api/leads/:id`
- `PATCH /api/leads/:id/status`
- `POST /api/leads/seed-demo`
- `GET /api/leads/stats/summary`
- `GET /api/leads/stats/charts`

## Как пользоваться интерфейсом

1. Создайте аккаунт (`Need account? Create one`).
2. Если нужно, нажмите `Add demo leads` или `Replace with demo`.
3. Добавляйте лиды через форму `Add lead`.
4. Используйте `Filters` для поиска и отбора.
5. В таблице:
- `Edit` редактирует лид.
- `Delete` удаляет лид.
6. Смотрите верхние карточки и графики для аналитики.

## Публичный деплой (кратко)

Рекомендуемый стек:

- Frontend: Vercel
- API: Render или Railway
- PostgreSQL: Neon или Supabase

Базовый порядок:

1. Деплой PostgreSQL и получите `DATABASE_URL`.
2. Деплой API и задайте env (`DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`).
3. Деплой frontend и задайте `VITE_API_URL`.
4. В `CLIENT_ORIGIN` добавьте URL фронтенда.

## Частые проблемы

- `dockerDesktopLinuxEngine ... cannot find file`:
  Docker Desktop не запущен. Откройте Docker Desktop и дождитесь `Engine running`.
- `password authentication failed for user "postgres"`:
  неверный `DATABASE_URL` или конфликт с локальным PostgreSQL.
- CORS-ошибка в браузере:
  проверьте `CLIENT_ORIGIN` в `apps/api/.env` и перезапустите API.

## Документация по самостоятельной работе

- `docs/SELF_START_GUIDE.md` - детальная карта, как развивать проект и делать свои fullstack-проекты.
