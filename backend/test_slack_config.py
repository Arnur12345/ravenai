#!/usr/bin/env python3
"""
Скрипт для проверки настроек Slack интеграции
"""

import os
import sys
from dotenv import load_dotenv

# Добавляем путь к src для импорта
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Загружаем переменные окружения
load_dotenv()

def check_slack_config():
    """Проверяем все необходимые настройки Slack"""
    print("🔍 Проверка настроек Slack интеграции...\n")
    
    # Проверяем переменные окружения
    client_id = os.getenv('SLACK_CLIENT_ID')
    client_secret = os.getenv('SLACK_CLIENT_SECRET')
    signing_secret = os.getenv('SLACK_SIGNING_SECRET')
    
    print("📋 Переменные окружения:")
    print(f"SLACK_CLIENT_ID: {'✅ Найден' if client_id else '❌ Не найден'}")
    if client_id:
        print(f"  Значение: {client_id[:15]}...")
    
    print(f"SLACK_CLIENT_SECRET: {'✅ Найден' if client_secret else '❌ Не найден'}")
    if client_secret:
        print(f"  Значение: {client_secret[:15]}...")
    
    print(f"SLACK_SIGNING_SECRET: {'✅ Найден' if signing_secret else '❌ Не найден'}")
    if signing_secret:
        print(f"  Значение: {signing_secret[:15]}...")
    
    print()
    
    # Проверяем формат credentials
    issues = []
    
    if client_id:
        if '.' not in client_id or len(client_id.split('.')) != 2:
            issues.append("❌ SLACK_CLIENT_ID должен иметь формат: number.number")
        else:
            print("✅ Формат SLACK_CLIENT_ID правильный")
    
    if client_secret:
        if len(client_secret) < 32:
            issues.append("❌ SLACK_CLIENT_SECRET слишком короткий")
        else:
            print("✅ Длина SLACK_CLIENT_SECRET правильная")
    
    if signing_secret:
        if len(signing_secret) < 32:
            issues.append("❌ SLACK_SIGNING_SECRET слишком короткий")
        else:
            print("✅ Длина SLACK_SIGNING_SECRET правильная")
    
    print()
    
    # Проверяем импорт настроек
    try:
        from settings import settings
        print("📦 Импорт настроек:")
        print(f"settings.SLACK_CLIENT_ID: {'✅ Загружен' if settings.SLACK_CLIENT_ID else '❌ Пустой'}")
        print(f"settings.SLACK_CLIENT_SECRET: {'✅ Загружен' if settings.SLACK_CLIENT_SECRET else '❌ Пустой'}")
        print(f"settings.SLACK_SIGNING_SECRET: {'✅ Загружен' if settings.SLACK_SIGNING_SECRET else '❌ Пустой'}")
    except Exception as e:
        issues.append(f"❌ Ошибка импорта настроек: {e}")
    
    print()
    
    # Результат
    if not issues and all([client_id, client_secret, signing_secret]):
        print("🎉 Все настройки Slack корректны!")
        print("\n📝 Следующие шаги:")
        print("1. Запустите backend: python src/main.py")
        print("2. Запустите frontend: npm run dev")
        print("3. Перейдите на http://localhost:3000/integrations")
        print("4. Нажмите 'Connect' у Slack")
    else:
        print("⚠️  Обнаружены проблемы:")
        for issue in issues:
            print(f"   {issue}")
        print("\n🔧 Инструкции по исправлению:")
        print("1. Убедитесь, что файл .env существует в папке backend")
        print("2. Проверьте правильность скопированных credentials")
        print("3. Перезапустите проверку: python test_slack_config.py")

if __name__ == "__main__":
    check_slack_config() 