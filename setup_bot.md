# 🤖 Настройка тестового бота

## 📋 Пошаговая инструкция

### 1. Создание бота в Telegram

1. Найдите @BotFather в Telegram
2. Отправьте команду `/newbot`
3. Введите название бота (например: "Test Mini App Bot")
4. Введите username бота (например: "test_miniapp_bot")
5. Скопируйте полученный токен

### 2. Установка зависимостей

```bash
# Установите Python зависимости
pip install -r requirements.txt
```

### 3. Настройка бота

Откройте файл `test_bot.py` и замените:

```python
# Замените на токен от @BotFather
BOT_TOKEN = "1234567890:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

# Замените на URL вашего Mini App
MINI_APP_URL = "https://your-domain.com"
```

### 4. Для локального тестирования (с ngrok)

Если ваш Mini App работает локально:

1. Установите ngrok: https://ngrok.com/
2. Запустите ваш сервер: `npm run dev` (порт 3000)
3. В новом терминале: `ngrok http 3000`
4. Скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)
5. Замените `MINI_APP_URL` на этот URL

### 5. Запуск бота

```bash
python test_bot.py
```

## 🧪 Тестирование

1. Найдите вашего бота в Telegram
2. Отправьте `/start`
3. Нажмите "🎬 ГОТОВЫЕ ШАБЛОНЫ"
4. Выберите шаблон в Mini App
5. Нажмите "ВЫБРАТЬ ШАБЛОН"
6. Проверьте консоль бота - там будут выведены полученные данные

## 📊 Что будет выводиться

Когда пользователь выберет шаблон, в консоли появится:

```
==================================================
🔥 ПОЛУЧЕНЫ ДАННЫЕ ОТ MINI APP:
==================================================
Raw data: {"videoPath":"video_templates/template_1.mp4","displayName":"Элегантный шаблон №1"}
Parsed JSON: {
  "videoPath": "video_templates/template_1.mp4",
  "displayName": "Элегантный шаблон №1"
}
Video Path: video_templates/template_1.mp4
Display Name: Элегантный шаблон №1
==================================================
```

А пользователю придет сообщение с подтверждением и техническими данными.

## 🔧 Дополнительные настройки

### Webhook (для продакшена)

Для продакшена лучше использовать webhook вместо polling:

```python
# Замените в main() функции
application.run_webhook(
    listen="0.0.0.0",
    port=8443,
    webhook_url="https://your-domain.com/webhook"
)
```

### Логирование

Все важные события сохраняются в логи. Для продакшена добавьте:

```python
logging.basicConfig(
    filename='bot.log',
    level=logging.INFO
)
```