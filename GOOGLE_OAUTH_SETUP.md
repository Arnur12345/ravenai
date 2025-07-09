# Google OAuth Setup Guide

## Проблемы, которые исправляет эта настройка:

1. **Cross-Account Protection не настроена**
2. **Incremental authorization не поддерживается**
3. **Granular permissions не поддерживается**

## Шаг 1: Настройка Google Cloud Console

### 1.1 Перейти в Google Cloud Console
1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите проект `raven-462512`
3. Перейдите в раздел **API & Services** → **OAuth consent screen**

### 1.2 Настройка OAuth Consent Screen
1. Выберите **External** user type
2. Заполните обязательные поля:
   - **App name**: `RavenAI`
   - **User support email**: ваш email
   - **Developer contact information**: ваш email
3. Добавьте **Authorized domains**:
   - `ravenai.site`
   - `localhost` (для разработки)
4. В разделе **Scopes** добавьте:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/calendar.readonly`

### 1.3 Настройка Cross-Account Protection
1. В разделе **OAuth consent screen** найдите **Advanced settings**
2. Включите **Cross-Account Protection**
3. Установите флажок **Enable incremental authorization**
4. Сохраните изменения

## Шаг 2: Настройка OAuth Credentials

### 2.1 Создание OAuth 2.0 Client ID
1. Перейдите в **API & Services** → **Credentials**
2. Нажмите **Create Credentials** → **OAuth client ID**
3. Выберите **Web application**
4. Настройте **Authorized redirect URIs**:
   - `http://localhost:8000/api/auth/google/callback`
   - `http://localhost:3000/auth/google/callback`
   - `http://localhost:5173/auth/google/callback`
   - `https://ravenai.site/auth/google/callback`

### 2.2 Скачивание конфигурации
1. Скачайте JSON файл с credentials
2. Поместите его в папку `backend/` с именем:
   `client_secret_1048775706645-jka3a5o69ltecsb69ogv0usjev21npvk.apps.googleusercontent.com.json`

## Шаг 3: Дополнительные настройки безопасности

### 3.1 Настройка PKCE (Proof Key for Code Exchange)
- Код уже обновлен для поддержки PKCE
- Автоматически генерируется `code_verifier` и `code_challenge`
- Использует SHA256 для enhanced security

### 3.2 Настройка State Parameter
- Добавлена защита от CSRF атак
- State parameter включает PKCE code_verifier
- Проверка state на backend

## Шаг 4: Изменения в коде

### 4.1 Обновленные scopes
```python
scopes = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar.readonly'
]
```

### 4.2 Новые параметры OAuth
```python
auth_url, _ = flow.authorization_url(
    access_type='offline',
    include_granted_scopes='true',  # Incremental authorization
    code_challenge=pkce_data['code_challenge'],  # PKCE
    code_challenge_method='S256',
    state=enhanced_state,  # CSRF protection
    prompt='consent'  # Fresh permissions
)
```

## Шаг 5: Тестирование

### 5.1 Проверка настроек
1. Запустите приложение
2. Попробуйте войти через Google
3. Проверьте, что больше нет предупреждений о небезопасности

### 5.2 Проверка функций
- [x] Cross-Account Protection работает
- [x] Incremental authorization поддерживается
- [x] Granular permissions настроены
- [x] PKCE включен для дополнительной безопасности

## Устранение неполадок

### Проблема: "This app isn't verified"
**Решение**: Перейдите в OAuth consent screen и опубликуйте приложение или добавьте тестовых пользователей

### Проблема: "redirect_uri_mismatch"
**Решение**: Убедитесь, что redirect URI в Google Cloud Console точно соответствует URI в коде

### Проблема: "invalid_grant"
**Решение**: Проверьте, что code_verifier правильно передается в token exchange

## Безопасность

- Используется PKCE для защиты от атак перехвата кода
- State parameter защищает от CSRF атак
- Granular scopes ограничивают доступ к данным
- Cross-Account Protection предотвращает атаки между аккаунтами

## Производственная среда

Для production среды:
1. Смените статус приложения с "Testing" на "In production"
2. Пройдите верификацию Google (если требуется)
3. Настройте доменную верификацию
4. Используйте HTTPS для всех redirect URIs 