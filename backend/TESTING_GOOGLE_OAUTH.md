# Тестирование Google OAuth

## Статус исправлений

✅ **Убрана поддержка PKCE** - потенциальная причина проблем с Google OAuth API  
✅ **Добавлено подробное логирование** - для диагностики проблем  
✅ **Добавлена валидация параметров** - проверка кода и redirect_uri  
✅ **Добавлены таймауты** - предотвращение зависания запросов  
✅ **Улучшена обработка ошибок** - более детальные сообщения об ошибках  

## Проблемы, которые были исправлены

### 1. Удаление PKCE
- **Проблема**: PKCE может не поддерживаться Google OAuth API полностью
- **Решение**: Убрали PKCE параметры из authorization URL и token exchange

### 2. Улучшенное логирование
- **Проблема**: Недостаточно информации для диагностики
- **Решение**: Добавили логирование всех параметров OAuth

### 3. Валидация данных
- **Проблема**: Некорректные данные могут вызывать 400 ошибку
- **Решение**: Добавили проверки на наличие и формат authorization code

### 4. Таймауты
- **Проблема**: Зависание запросов к Google API
- **Решение**: Добавили 30-секундный таймаут для HTTP клиента

## Как протестировать

### Шаг 1: Проверить backend сервер
```bash
cd backend
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

### Шаг 2: Проверить frontend сервер
```bash
cd frontend
npm run dev
```

### Шаг 3: Тестирование Google OAuth
1. Открыть `http://localhost:3000/auth`
2. Нажать "Continue with Google"
3. Пройти авторизацию в Google
4. Проверить логи в терминале backend

### Шаг 4: Анализ логов
Ищите в логах следующие сообщения:
- `🔍 Google OAuth callback API called with:`
- `🔍 Parameters being sent to Google:`
- `🔍 Token exchange response status:`
- `✅ Token exchange successful` или `❌ Token exchange failed`

## Возможные ошибки и решения

### Ошибка: "invalid_grant"
**Причина**: Неправильный или просроченный authorization code
**Решение**: 
- Проверить, что code не используется повторно
- Убедиться, что redirect_uri точно совпадает
- Проверить, что код не просрочен (действует ~10 минут)

### Ошибка: "redirect_uri_mismatch"
**Причина**: Redirect URI не совпадает с настроенным в Google Cloud Console
**Решение**: 
- Проверить список redirect URIs в Google Cloud Console
- Убедиться, что используется точно такой же URI

### Ошибка: "invalid_client"
**Причина**: Неправильный client_id или client_secret
**Решение**: 
- Проверить credentials файл
- Убедиться, что client_id и client_secret корректны

## Диагностика

### Проверка настроек
```bash
cd backend
python test_google_oauth.py
```

### Проверка redirect URIs
В Google Cloud Console → API & Services → Credentials:
- `http://localhost:3000/auth/google/callback`
- `http://localhost:5173/auth/google/callback`
- `http://localhost:8000/api/auth/google/callback`
- `https://ravenai.site/auth/google/callback`

### Проверка OAuth Consent Screen
- Статус: External
- Опубликовано: Yes (или добавлены test users)
- Scopes: настроены правильно

## Ожидаемые результаты

✅ **Успешная авторизация**: Пользователь перенаправляется на dashboard  
✅ **Подробные логи**: Видны все этапы OAuth процесса  
✅ **Нет ошибок 400**: Токены обмениваются успешно  
✅ **Пользователь создан**: Новые пользователи регистрируются автоматически  

## Если проблема остается

1. Проверить время на сервере (OAuth коды имеют временные ограничения)
2. Проверить сетевые настройки (firewall, proxy)
3. Проверить статус Google OAuth API в Google Cloud Console
4. Попробовать с другим браузером или инкогнито режимом
5. Проверить, что приложение не в режиме "Testing" в Google Cloud Console 