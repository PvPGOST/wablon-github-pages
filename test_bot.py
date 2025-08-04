#!/usr/bin/env python3
"""
Тестовый Telegram бот для проверки Mini App
Устанавливает необходимые зависимости: pip install python-telegram-bot
"""

import json
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes, CallbackQueryHandler

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ВАЖНО: Замените на токен вашего бота от @BotFather
BOT_TOKEN = "8496910136:AAEoOuBdpzJyE_Cv6pgTvET3JSuEM9nSfWM"

# URL вашего Mini App (замените на ваш домен)
MINI_APP_URL = "https://pvpgost.github.io/wablon-github-pages/index.html"  # Или используйте ngrok для тестирования

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start"""
    user = update.effective_user
    
    # Создаем клавиатуру с двумя кнопками
    keyboard = [
        [InlineKeyboardButton("🎬 ГОТОВЫЕ ШАБЛОНЫ", web_app=WebAppInfo(url=MINI_APP_URL))],
        [InlineKeyboardButton("❓ ПОМОЩЬ", callback_data="help")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = f"""
🎉 Добро пожаловать, {user.first_name}!

Этот бот поможет вам создавать видео из готовых шаблонов.

Выберите действие:
• 🎬 ГОТОВЫЕ ШАБЛОНЫ - выбрать и настроить шаблон
• ❓ ПОМОЩЬ - получить справку по использованию
"""
    
    await update.message.reply_text(
        welcome_text,
        reply_markup=reply_markup
    )

async def help_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик кнопки ПОМОЩЬ"""
    query = update.callback_query
    await query.answer()  # Убираем "часики" с кнопки
    
    await query.edit_message_text(
        text="🙏 БОГ В ПОМОЩЬ!\n\nЭто тестовый бот для проверки Mini App функциональности."
    )

async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик данных от Mini App"""
    try:
        # Получаем данные от Mini App
        web_app_data = update.effective_message.web_app_data.data
        
        print("=" * 50)
        print("🔥 ПОЛУЧЕНЫ ДАННЫЕ ОТ MINI APP:")
        print("=" * 50)
        print(f"Raw data: {web_app_data}")
        
        # Парсим JSON
        data = json.loads(web_app_data)
        print(f"Parsed JSON: {json.dumps(data, indent=2, ensure_ascii=False)}")
        
        # Извлекаем наши поля
        video_path = data.get('videoPath', 'Не указан')
        display_name = data.get('displayName', 'Не указано')
        
        print(f"Video Path: {video_path}")
        print(f"Display Name: {display_name}")
        print("=" * 50)
        
        # Отправляем подтверждение пользователю
        response_text = f"""
✅ Данные получены от Mini App!

📊 Информация о выбранном шаблоне:
• Путь к файлу: `{video_path}`
• Название: {display_name}

🔧 Техническая информация:
```json
{json.dumps(data, indent=2, ensure_ascii=False)}
```

В продакшене здесь будет обработка видео.
"""
        
        await update.effective_message.reply_text(
            response_text,
            parse_mode='Markdown'
        )
        
    except json.JSONDecodeError as e:
        print(f"❌ Ошибка парсинга JSON: {e}")
        print(f"Полученные данные: {web_app_data}")
        
        await update.effective_message.reply_text(
            f"❌ Ошибка обработки данных от Mini App:\n`{str(e)}`",
            parse_mode='Markdown'
        )
        
    except Exception as e:
        print(f"❌ Общая ошибка: {e}")
        await update.effective_message.reply_text(
            f"❌ Произошла ошибка: {str(e)}"
        )

async def handle_callback_query(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик callback запросов"""
    query = update.callback_query
    
    if query.data == "help":
        await help_callback(update, context)
    else:
        await query.answer("Неизвестная команда")

def main() -> None:
    """Запуск бота"""
    if BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        print("❌ ОШИБКА: Необходимо указать токен бота!")
        print("1. Создайте бота через @BotFather")
        print("2. Замените YOUR_BOT_TOKEN_HERE на полученный токен")
        print("3. Замените MINI_APP_URL на URL вашего Mini App")
        return
    
    # Создаем приложение
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Регистрируем обработчики
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    application.add_handler(CallbackQueryHandler(handle_callback_query))
    
    print("🚀 Бот запущен! Нажмите Ctrl+C для остановки.")
    print(f"🔗 Mini App URL: {MINI_APP_URL}")
    
    # Запускаем бота
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()