# Telegram Mini App - Каталог видео

Это Telegram Mini App для просмотра и выбора видео из каталога. Приложение открывается по нажатию на кнопку в Telegram-боте и позволяет пользователю:

1. Просматривать список доступных видео
2. Открывать выбранное видео для просмотра подробной информации
3. Отправлять информацию о выбранном видео обратно в бот

## Структура проекта

- `index.html` - главная страница со списком превью видео
- `video.html` - страница просмотра выбранного видео
- `styles.css` - стили для оформления приложения
- `app.js` - JavaScript для главной страницы
- `video.js` - JavaScript для страницы просмотра видео
- `videos-data.js` - файл с тестовыми данными о видео

## Использование в Telegram-боте

Для интеграции Mini App с ботом необходимо:

1. Загрузить все файлы проекта на веб-сервер с поддержкой HTTPS
2. Зарегистрировать Mini App через @BotFather, указав URL вашего приложения
3. Добавить кнопку для открытия Mini App в бота

### Пример кнопки для открытия Mini App в боте (Python, aiogram):

```python
from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo

# Создаем кнопку для открытия Mini App
webapp_button = types.KeyboardButton(
    text="Открыть каталог видео", 
    web_app=WebAppInfo(url="https://ваш-домен.com/путь-к-мини-аппу/")
)

# Создаем клавиатуру с этой кнопкой
keyboard = types.ReplyKeyboardMarkup(
    keyboard=[[webapp_button]], 
    resize_keyboard=True
)

# Отправляем сообщение с клавиатурой
@dp.message_handler(commands=["start"])
async def cmd_start(message: types.Message):
    await message.answer(
        "Нажмите на кнопку ниже, чтобы открыть каталог видео:", 
        reply_markup=keyboard
    )
```

## Обработка данных от Mini App

Когда пользователь нажимает кнопку "Подтвердить" в Mini App, информация о выбранном видео отправляется обратно в бот в формате JSON:

```json
{
  "selected_video_id": "идентификатор_видео",
  "selected_video_title": "Название видео"
}
```

### Пример обработки данных в боте (Python, aiogram):

```python
@dp.message_handler(content_types=types.ContentTypes.WEB_APP_DATA)
async def web_app_data(message: types.Message):
    # Получаем данные от Mini App
    data = json.loads(message.web_app_data.data)
    
    # Извлекаем информацию о выбранном видео
    video_id = data.get("selected_video_id")
    video_title = data.get("selected_video_title")
    
    # Отправляем ответ пользователю
    await message.answer(f"Вы выбрали видео: {video_title} (ID: {video_id})")
```

## Настройка данных

Для использования своих видео замените массив `videoData` в файле `videos-data.js` на свои данные в том же формате.

## Требования

- Современный веб-браузер с поддержкой JavaScript и CSS3
- Веб-сервер с поддержкой HTTPS (требование Telegram для Mini Apps)

## Лицензия

Это приложение распространяется под лицензией MIT. 