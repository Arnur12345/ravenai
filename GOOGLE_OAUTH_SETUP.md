# Google OAuth Setup Instructions

## Проблема
Ошибка "redirect_uri_mismatch" возникает когда Google OAuth configuration не соответствует текущим портам приложения.

## Решение

### 1. Обновите настройки в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите проект "raven-462512"
3. Перейдите в "APIs & Services" > "Credentials"
4. Найдите OAuth 2.0 Client ID: `1048775706645-jka3a5o69ltecsb69ogv0usjev21npvk.apps.googleusercontent.com`
5. Нажмите на него для редактирования

### 2. Обновите Authorized redirect URIs

Замените существующие URIs на следующие:

```
http://localhost:3000/auth/google/callback
http://localhost:8000/api/auth/google/callback
http://localhost:5173/auth/google/callback
```

### 3. Порты приложения

Текущая конфигурация портов:
- **Frontend**: `http://localhost:3000` (Vite dev server)
- **Backend**: `http://localhost:8000` (FastAPI server)

### 4. Запуск приложения

Используйте батч-файл для запуска:
```bash
./start-dev.bat
```

Или запустите вручную:

**Backend:**
```bash
cd backend
python src/main.py
```

**Frontend:**
```bash
cd aftertalk
npm run dev
```

### 5. Проверка

1. Откройте http://localhost:3000
2. Нажмите "Войти через Google"
3. Должно произойти перенаправление на Google OAuth без ошибок

## Изменения в коде

### 1. Исправления 401 ошибки

- Добавлено новое исключение `OAuthException` (400 Bad Request) вместо `InvalidCredentialsException` (401 Unauthorized)
- Обновлена обработка ошибок в Google OAuth callback
- Добавлено детальное логирование процесса аутентификации

### 2. Исправления State Parameter

- State параметр сохраняется в localStorage и sessionStorage
- Добавлена отладочная информация для проверки state
- В development режиме предупреждения вместо ошибок при несовпадении state

### 3. Unified Redirect URI

- Фронтенд и бэкенд используют одинаковый redirect_uri: `http://localhost:3000/auth/google/callback`
- Google OAuth credentials обновлены для поддержки этого URI

## Troubleshooting

### Ошибка 401 Unauthorized
- Проверьте логи бэкенда на наличие детальной информации об ошибке
- Убедитесь что Google OAuth credentials файл существует и корректен
- Проверьте что redirect_uri в Google Console совпадает с тем, что отправляет фронтенд

### Ошибка "Invalid state parameter"
- Откройте Developer Tools в браузере
- Посмотрите логи в Console для детальной информации о state параметрах
- В development режиме эта ошибка будет только предупреждением

### Серверы не запускаются
- Убедитесь что порты 3000 и 8000 свободны
- Проверьте что установлены все зависимости:
  ```bash
  cd backend && pip install -r requirements.txt
  cd aftertalk && npm install
  ```

### Ошибка "redirect_uri_mismatch"
- Убедитесь что URI в Google Console точно совпадают с теми, что использует приложение
- Проверьте что нет лишних слешей в конце URI
- Убедитесь что используете правильные порты (Frontend: 3000, Backend: 8000)

## Логирование и отладка

В консоли браузера вы увидите детальные логи OAuth процесса:
- Генерация state параметра
- Сохранение state в storage
- Проверка state при callback
- Обмен кода на токены

В логах бэкенда вы увидите:
- Детали запроса к Google OAuth
- Ответы от Google API
- Процесс создания/обновления пользователя
- Генерацию JWT токенов

Эта информация поможет быстро диагностировать любые проблемы с аутентификацией. 