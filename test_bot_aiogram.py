#!/usr/bin/env python3
"""
Тестовый Telegram бот для проверки Mini App (aiogram 3)
Устанавливает необходимые зависимости: pip install aiogram
"""

import asyncio
import json
import logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ВАЖНО: Замените на токен вашего бота от @BotFather
BOT_TOKEN = "8496910136:AAEoOuBdpzJyE_Cv6pgTvET3JSuEM9nSfWM"

# URL вашего Mini App
MINI_APP_URL = "https://pvpgost.github.io/wablon-github-pages/index.html"

# Создаем объекты бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def start_command(message: types.Message):
    """Обработчик команды /start"""
    user = message.from_user
    
    # Создаем Inline клавиатуру (как вы хотели)
    builder = InlineKeyboardBuilder()
    builder.add(
        InlineKeyboardButton(
            text="🎬 ГОТОВЫЕ ШАБЛОНЫ",
            web_app=WebAppInfo(url=MINI_APP_URL)
        )
    )
    builder.add(
        InlineKeyboardButton(
            text="❓ ПОМОЩЬ",
            callback_data="help"
        )
    )
    builder.adjust(1)  # По одной кнопке в ряду
    
    welcome_text = f"""
🎉 Добро пожаловать, {user.first_name}!

Этот бот поможет вам создавать видео из готовых шаблонов.

Выберите действие:
• 🎬 ГОТОВЫЕ ШАБЛОНЫ - выбрать и настроить шаблон
• ❓ ПОМОЩЬ - получить справку по использованию
"""
    
    await message.answer(
        welcome_text,
        reply_markup=builder.as_markup()
    )

@dp.callback_query(F.data == "help")
async def help_callback(callback: types.CallbackQuery):
    """Обработчик Inline кнопки ПОМОЩЬ"""
    await callback.answer()  # Убираем "часики" с кнопки
    
    await callback.message.edit_text(
        text="🙏 БОГ В ПОМОЩЬ!\n\nЭто тестовый бот для проверки Mini App функциональности."
    )

@dp.message(F.web_app_data)
async def handle_web_app_data(message: types.Message):
    """Обработчик данных от Mini App"""
    try:
        # Получаем данные от Mini App
        web_app_data = message.web_app_data.data
        
        print("=" * 50)
        print("🔥 ПОЛУЧЕНЫ ДАННЫЕ ОТ MINI APP (aiogram 3):")
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
✅ Данные получены от Mini App! (aiogram 3)

📊 Информация о выбранном шаблоне:
• Путь к файлу: `{video_path}`
• Название: {display_name}

🔧 Техническая информация:
```json
{json.dumps(data, indent=2, ensure_ascii=False)}
```

В продакшене здесь будет обработка видео.
"""
        
        await message.answer(
            response_text,
            parse_mode='Markdown'
        )
        
    except json.JSONDecodeError as e:
        print(f"❌ Ошибка парсинга JSON: {e}")
        print(f"Полученные данные: {web_app_data}")
        
        await message.answer(
            f"❌ Ошибка обработки данных от Mini App:\n`{str(e)}`",
            parse_mode='Markdown'
        )
        
    except Exception as e:
        print(f"❌ Общая ошибка: {e}")
        await message.answer(
            f"❌ Произошла ошибка: {str(e)}"
        )

@dp.inline_query()
async def handle_inline_query(inline_query: types.InlineQuery):
    """Обработчик для inline запросов от Web App (если нужно)"""
    # Этот обработчик может понадобиться в некоторых случаях
    pass

# Обработчик Web App Query (это ключевой обработчик для Inline Web Apps!)
async def handle_web_app_query(query_id: str, data: dict):
    """Обрабатываем данные от Inline Web App через answerWebAppQuery"""
    try:
        print("=" * 50)
        print("🔥 ПОЛУЧЕНЫ ДАННЫЕ ОТ INLINE WEB APP:")
        print("=" * 50)
        print(f"Query ID: {query_id}")
        print(f"Data: {data}")
        
        video_path = data.get('videoPath', 'Не указан')
        display_name = data.get('displayName', 'Не указано')
        
        print(f"Video Path: {video_path}")
        print(f"Display Name: {display_name}")
        print("=" * 50)
        
        # Создаем результат для отправки в чат
        from aiogram.types import InlineQueryResultArticle, InputTextMessageContent
        
        result = InlineQueryResultArticle(
            id="selected_template",
            title="Выбранный шаблон",
            description=f"Шаблон: {display_name}",
            input_message_content=InputTextMessageContent(
                message_text=f"✅ Выбран шаблон: {display_name}\n📁 Путь: {video_path}\n\n🔧 Начинаю обработку..."
            )
        )
        
        # Отправляем результат через answerWebAppQuery
        await bot.answer_web_app_query(
            web_app_query_id=query_id,
            result=result
        )
        
        print("✅ answerWebAppQuery выполнен успешно")
        
    except Exception as e:
        print(f"❌ Ошибка handle_web_app_query: {e}")

# Добавляем endpoint для получения данных от Mini App
from aiohttp import web, ClientSession
import json

async def web_app_data_endpoint(request):
    """HTTP endpoint для получения данных от Mini App"""
    try:
        data = await request.json()
        query_id = data.get('query_id')
        template_data = data.get('template_data', {})
        
        if query_id:
            await handle_web_app_query(query_id, template_data)
            return web.Response(text="OK")
        else:
            return web.Response(text="Missing query_id", status=400)
            
    except Exception as e:
        print(f"❌ Ошибка web_app_data_endpoint: {e}")
        return web.Response(text=str(e), status=500)

async def main():
    """Запуск бота"""
    if BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        print("❌ ОШИБКА: Необходимо указать токен бота!")
        print("1. Создайте бота через @BotFather")
        print("2. Замените YOUR_BOT_TOKEN_HERE на полученный токен")
        print("3. Замените MINI_APP_URL на URL вашего Mini App")
        return
    
    print("🚀 Бот (aiogram 3) запущен! Нажмите Ctrl+C для остановки.")
    print(f"🔗 Mini App URL: {MINI_APP_URL}")
    
    # Запускаем бота
    try:
        await dp.start_polling(bot)
    except KeyboardInterrupt:
        print("\n👋 Бот остановлен пользователем")
    finally:
        await bot.session.close()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Программа завершена")