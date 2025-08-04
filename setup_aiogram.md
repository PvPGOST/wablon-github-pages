# 🤖 Настройка тестового бота (aiogram 3)

## 📋 Пошаговая инструкция

### 1. Создание бота в Telegram

1. Найдите @BotFather в Telegram
2. Отправьте команду `/newbot`
3. Введите название бота (например: "Test Mini App Bot aiogram")
4. Введите username бота (например: "test_miniapp_aiogram_bot")
5. Скопируйте полученный токен

### 2. Установка зависимостей

```bash
# Установите aiogram 3
pip install -r requirements_aiogram.txt
```

### 3. Настройка бота

Откройте файл `test_bot_aiogram.py` и замените:

```python
# Замените на токен от @BotFather
BOT_TOKEN = "1234567890:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

# Замените на URL вашего Mini App
MINI_APP_URL = "https://your-domain.com"
```

### 4. Запуск бота

```bash
python test_bot_aiogram.py
```

## 🎯 Основные различия aiogram 3 vs python-telegram-bot

### ✅ Преимущества aiogram 3:

1. **Современный синтаксис** - использует декораторы и фильтры
2. **Лучшая производительность** - асинхронный по умолчанию
3. **Удобные фильтры** - `F.data`, `F.web_app_data`, `CommandStart()`
4. **Автоматическое управление сессиями** - не нужно вручную закрывать
5. **Встроенные билдеры клавиатур** - `InlineKeyboardBuilder`
6. **Лучшая типизация** - полная поддержка mypy

### 🔧 Ключевые особенности кода:

```python
# Декораторы для обработчиков
@dp.message(CommandStart())
@dp.callback_query(F.data == "help")
@dp.message(F.web_app_data)

# Современные фильтры
F.web_app_data  # вместо filters.StatusUpdate.WEB_APP_DATA
F.data == "help"  # вместо callback_query.data == "help"

# Удобные билдеры
builder = InlineKeyboardBuilder()
builder.add(button1, button2)
builder.adjust(1)  # По одной кнопке в ряду
```

## 🧪 Тестирование

1. Найдите вашего бота в Telegram
2. Отправьте `/start`
3. Нажмите "🎬 ГОТОВЫЕ ШАБЛОНЫ"
4. Выберите шаблон в Mini App
5. Нажмите "ВЫБРАТЬ ШАБЛОН"
6. Проверьте консоль бота

## 📊 Что будет выводиться

```
==================================================
🔥 ПОЛУЧЕНЫ ДАННЫЕ ОТ MINI APP (aiogram 3):
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

## 🚀 Продвинутые возможности aiogram 3

### Middleware (промежуточное ПО)

```python
from aiogram import BaseMiddleware

class LoggingMiddleware(BaseMiddleware):
    async def __call__(self, handler, event, data):
        print(f"Обработка события: {type(event).__name__}")
        return await handler(event, data)

# Подключение
dp.message.middleware(LoggingMiddleware())
```

### FSM (Finite State Machine)

```python
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

class Form(StatesGroup):
    waiting_for_template = State()

@dp.message(F.text == "Создать видео")
async def start_form(message: types.Message, state: FSMContext):
    await state.set_state(Form.waiting_for_template)
    await message.answer("Выберите шаблон...")
```

### Webhook (для продакшена)

```python
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiohttp import web

async def on_startup(bot: Bot):
    await bot.set_webhook("https://your-domain.com/webhook")

def main():
    app = web.Application()
    webhook_requests_handler = SimpleRequestHandler(
        dispatcher=dp,
        bot=bot,
    )
    webhook_requests_handler.register(app, path="/webhook")
    setup_application(app, dp, bot=bot)
    web.run_app(app, host="0.0.0.0", port=8080)
```

## 🔄 Миграция с python-telegram-bot

| python-telegram-bot | aiogram 3 |
|-------------------|-----------|
| `@application.add_handler(CommandHandler("start", start))` | `@dp.message(CommandStart())` |
| `filters.StatusUpdate.WEB_APP_DATA` | `F.web_app_data` |
| `CallbackQueryHandler` | `@dp.callback_query()` |
| `InlineKeyboardMarkup([[button]])` | `InlineKeyboardBuilder().add(button)` |
| `update.effective_message` | `message` |
| `context.bot.send_message()` | `message.answer()` |