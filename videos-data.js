// Данные о видео шаблонах
const videoData = [
  {
    "id": "video1",
    "preview_url": "https://i.ibb.co/mC4Lx2zT/le-N3-Sl-Cg16-U.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742256575/lwcehpdoflwsdaabp1ea.mp4",
    "title": "Номер 331",
    "duration": 10, // Длительность в секундах
    "categories": ["new", "short"], // Может быть в нескольких категориях
    "preview_time": 2.5,
    "likes": 1010 // Количество лайков
  },
  {
    "id": "video2",
    "preview_url": "https://i.ibb.co/6RwzDzyH/photo-2025-03-01-04-59-22.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742259893/ff6e3e0b_qu3lha.mp4",
    "title": "Номер 332",
    "duration": 18, // Длительность в секундах
    "categories": ["new"], // Только новое, популярность определяется автоматически
    "preview_time": 1.8,
    "likes": 8744 // Количество лайков
  },
  {
    "id": "video3",
    "preview_url": "https://i.ibb.co/4w8ng4SH/photo-2025-01-09-01-48-05.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742260073/IMG_4069_ybfkag.mp4",
    "title": "Номер 333",
    "duration": 185, // Длительность в секундах
    "categories": ["long"], // Только длинное, популярность определяется автоматически
    "preview_time": 3.2,
    "likes": 15624 // Количество лайков
  },
  {
    "id": "video4",
    "preview_url": "https://i.ibb.co/84sXfkKL/5224733158040264968-1.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742260079/%D0%B4%D0%BD%D0%BE_2_lb5rsu.mp4",
    "title": "Номер 334",
    "duration": 25, // Длительность в секундах
    "categories": ["short"], // Только короткое, популярность определяется автоматически
    "preview_time": 0.8,
    "likes": 731 // Количество лайков
  }
];

// Конфигурация категорий
const categories = {
  all: {
    name: "Все",
    icon: "📱"
  },
  favorites: {
    name: "Избранное",
    icon: "⭐"
  },
  new: {
    name: "Новое",
    icon: "✨"
  },
  popular: {
    name: "Популярное",
    icon: "🔥"
  },
  short: {
    name: "Короткое",
    icon: "⚡"
  },
  long: {
    name: "Длинное",
    icon: "📖"
  }
};

// Функция для получения видео по категории
function getVideosByCategory(category) {
  if (category === 'all') {
    return videoData;
  }
  if (category === 'favorites') {
    // Получаем избранные видео из Cloud Storage
    return getFavoriteVideos();
  }
  if (category === 'popular') {
    // Динамически определяем популярные видео по количеству лайков
    return getPopularVideos();
  }
  return videoData.filter(video => video.categories.includes(category));
}

// Функция для получения популярных видео (динамически)
function getPopularVideos() {
  // Считаем популярными видео с лайками больше 0
  const popularThreshold = 1;
  
  return videoData
    .filter(video => video.likes >= popularThreshold)
    .sort((a, b) => b.likes - a.likes); // Сортируем по убыванию лайков (самые популярные первыми)
}

// Функция для расчета токенов по длительности (1 секунда = 50 токенов)
function calculateTokens(durationInSeconds) {
  return durationInSeconds * 50;
}

// Функция для получения строки с длительностью и токенами
function getDurationText(videoId) {
  const video = videoData.find(v => v.id === videoId);
  if (!video || !video.duration) {
    return 'Длительность не указана';
  }
  
  const tokens = calculateTokens(video.duration);
  return `${video.duration} секунд = ${tokens} токенов`;
}

// === СИСТЕМА ИЗБРАННОГО ===

// Переменная для хранения избранных видео (кэш)
let favoriteVideosCache = [];

// Функция для получения избранных видео
function getFavoriteVideos() {
  return videoData.filter(video => favoriteVideosCache.includes(video.id));
}

// Функция для проверки, находится ли видео в избранном
function isVideoFavorite(videoId) {
  return favoriteVideosCache.includes(videoId);
}

// Функция для добавления/удаления видео из избранного
async function toggleVideoFavorite(videoId) {
  console.log('=== ПЕРЕКЛЮЧЕНИЕ ИЗБРАННОГО ===');
  console.log('ID видео:', videoId);
  console.log('Текущее избранное до изменения:', favoriteVideosCache);
  
  const isFavorite = isVideoFavorite(videoId);
  console.log('Видео в избранном до изменения:', isFavorite);
  
  if (isFavorite) {
    // Удаляем из избранного
    favoriteVideosCache = favoriteVideosCache.filter(id => id !== videoId);
    console.log('Удаляем из избранного');
  } else {
    // Добавляем в избранное
    favoriteVideosCache.push(videoId);
    console.log('Добавляем в избранное');
  }
  
  console.log('Избранное после изменения:', favoriteVideosCache);
  
  // Сохраняем в Telegram Cloud Storage
  try {
    await saveFavoritesToCloud();
    console.log('Данные сохранены успешно');
  } catch (error) {
    console.error('Ошибка сохранения:', error);
  }
  
  const newStatus = !isFavorite;
  console.log('Новый статус избранного:', newStatus);
  console.log('=== КОНЕЦ ПЕРЕКЛЮЧЕНИЯ ИЗБРАННОГО ===');
  
  return newStatus; // Возвращаем новый статус
}

// Функция для сохранения избранного в Cloud Storage
async function saveFavoritesToCloud() {
  return new Promise((resolve, reject) => {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
      const favoritesData = JSON.stringify(favoriteVideosCache);
      window.Telegram.WebApp.CloudStorage.setItem('favorites', favoritesData, (error) => {
        if (error) {
          console.error('Ошибка сохранения избранного:', error);
          reject(error);
        } else {
          console.log('Избранное сохранено в Cloud Storage');
          resolve();
        }
      });
    } else {
      // Fallback для локальной разработки
      localStorage.setItem('favorites', JSON.stringify(favoriteVideosCache));
      console.log('Избранное сохранено в localStorage (dev mode)');
      resolve();
    }
  });
}

// Функция для загрузки избранного из Cloud Storage
async function loadFavoritesFromCloud() {
  console.log('=== ЗАГРУЗКА ИЗБРАННОГО ===');
  console.log('Telegram WebApp доступен:', !!(window.Telegram && window.Telegram.WebApp));
  console.log('Cloud Storage доступен:', !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage));
  
  return new Promise((resolve) => {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
      console.log('Используем Telegram Cloud Storage');
      window.Telegram.WebApp.CloudStorage.getItem('favorites', (error, data) => {
        if (error) {
          console.error('Ошибка загрузки избранного:', error);
          favoriteVideosCache = [];
        } else {
          try {
            favoriteVideosCache = data ? JSON.parse(data) : [];
            console.log('Избранное загружено из Cloud Storage:', favoriteVideosCache);
          } catch (e) {
            console.error('Ошибка парсинга избранного:', e);
            favoriteVideosCache = [];
          }
        }
        resolve();
      });
    } else {
      // Fallback для локальной разработки
      console.log('Используем localStorage (dev mode)');
      try {
        const data = localStorage.getItem('favorites');
        console.log('Данные из localStorage:', data);
        favoriteVideosCache = data ? JSON.parse(data) : [];
        console.log('Избранное загружено из localStorage (dev mode):', favoriteVideosCache);
      } catch (e) {
        console.error('Ошибка загрузки избранного из localStorage:', e);
        favoriteVideosCache = [];
      }
      resolve();
    }
  });
}

// Инициализация избранного при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
  console.log('=== ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ ИЗБРАННОГО И ЛАЙКОВ ===');
  await loadFavoritesFromCloud();
  loadUserLikes(); // Загружаем лайки пользователя
  console.log('Система избранного и лайков инициализирована');
  console.log('Текущее избранное:', favoriteVideosCache);
  console.log('Текущие лайки пользователя:', userLikedVideos);
});

// === СИСТЕМА ЛАЙКОВ ===

// Переменная для хранения лайков пользователя (какие видео он лайкнул)
let userLikedVideos = [];

// Функция для проверки, лайкнул ли пользователь видео
function isVideoLiked(videoId) {
  return userLikedVideos.includes(videoId);
}

// Функция для получения количества лайков видео
function getVideoLikes(videoId) {
  const video = videoData.find(v => v.id === videoId);
  return video ? video.likes : 0;
}

// Функция для переключения лайка видео
async function toggleVideoLike(videoId) {
  const isLiked = isVideoLiked(videoId);
  const video = videoData.find(v => v.id === videoId);
  
  if (!video) {
    console.error('Видео не найдено:', videoId);
    return false;
  }
  
  if (isLiked) {
    // Убираем лайк
    userLikedVideos = userLikedVideos.filter(id => id !== videoId);
    video.likes -= 1;
  } else {
    // Добавляем лайк
    userLikedVideos.push(videoId);
    video.likes += 1;
  }
  
  // Сохраняем в localStorage
  saveUserLikes();
  
  // В будущем здесь будет отправка на сервер
  // await sendLikeToServer(videoId, !isLiked);
  
  console.log(`Видео ${videoId} ${isLiked ? 'убран лайк' : 'лайкнуто'}, теперь лайков: ${video.likes}`);
  return !isLiked; // Возвращаем новый статус
}

// Функция для загрузки лайков пользователя (пока из localStorage)
function loadUserLikes() {
  try {
    const data = localStorage.getItem('userLikes');
    userLikedVideos = data ? JSON.parse(data) : [];
    console.log('Лайки пользователя загружены:', userLikedVideos);
  } catch (e) {
    console.error('Ошибка загрузки лайков:', e);
    userLikedVideos = [];
  }
}

// Функция для сохранения лайков пользователя (пока в localStorage)
function saveUserLikes() {
  try {
    localStorage.setItem('userLikes', JSON.stringify(userLikedVideos));
    console.log('Лайки пользователя сохранены');
  } catch (e) {
    console.error('Ошибка сохранения лайков:', e);
  }
}

// Выводим в консоль для проверки при загрузке
console.log("Данные о видео загружены:", videoData);

// === ФУНКЦИЯ ТЕСТИРОВАНИЯ ===
// Функция для тестирования всех функций (только для разработки)
function testAllFunctions() {
    console.log("=== ТЕСТИРОВАНИЕ ФУНКЦИЙ ===");
    
    // Тест избранного
    console.log("1. Тест избранного:");
    console.log("Избранное до:", favoriteVideosCache);
    
    // Добавляем video1 в избранное
    toggleVideoFavorite('video1').then(() => {
        console.log("Избранное после добавления video1:", favoriteVideosCache);
        console.log("video1 в избранном?", isVideoFavorite('video1'));
        
        // Убираем video1 из избранного
        toggleVideoFavorite('video1').then(() => {
            console.log("Избранное после удаления video1:", favoriteVideosCache);
            console.log("video1 в избранном?", isVideoFavorite('video1'));
        });
    });
    
    // Тест лайков
    console.log("2. Тест лайков:");
    console.log("Лайки video1 до:", getVideoLikes('video1'));
    console.log("Пользователь лайкнул video1?", isVideoLiked('video1'));
    
    // Ставим лайк
    toggleVideoLike('video1').then(() => {
        console.log("Лайки video1 после лайка:", getVideoLikes('video1'));
        console.log("Пользователь лайкнул video1?", isVideoLiked('video1'));
        
        // Убираем лайк
        toggleVideoLike('video1').then(() => {
            console.log("Лайки video1 после убирания лайка:", getVideoLikes('video1'));
            console.log("Пользователь лайкнул video1?", isVideoLiked('video1'));
        });
    });
}

// Добавляем функцию в глобальную область для вызова из консоли
window.testAllFunctions = testAllFunctions;

// Функция для быстрого тестирования избранного
window.testFavorites = function() {
    console.log('=== ТЕСТ ИЗБРАННОГО ===');
    console.log('Текущее избранное:', favoriteVideosCache);
    console.log('Доступные функции:');
    console.log('- isVideoFavorite:', typeof isVideoFavorite);
    console.log('- toggleVideoFavorite:', typeof toggleVideoFavorite);
    console.log('- getFavoriteVideos:', typeof getFavoriteVideos);
    
    // Тестируем с video1
    console.log('video1 в избранном?', isVideoFavorite('video1'));
    console.log('Для добавления/удаления video1 в избранное выполните: toggleVideoFavorite("video1")');
};

// Функция для проверки состояния системы
window.checkSystemStatus = function() {
    console.log('=== СОСТОЯНИЕ СИСТЕМЫ ===');
    console.log('favoriteVideosCache:', favoriteVideosCache);
    console.log('userLikedVideos:', userLikedVideos);
    console.log('videoData загружен:', typeof videoData !== 'undefined' && Array.isArray(videoData));
    console.log('Количество видео:', videoData ? videoData.length : 0);
};

/*
=== ПАМЯТКА ПО КАТЕГОРИЯМ ===

Доступные категории для копирования:
"new"      - Новое
"short"    - Короткое
"long"     - Длинное

СПЕЦИАЛЬНЫЕ КАТЕГОРИИ (НЕ ДОБАВЛЯЙТЕ В videos-data.js):
"favorites" - Избранное (автоматически управляется системой)
"popular"   - Популярное (автоматически определяется по количеству лайков ≥ 1, сортировка по убыванию)

Примеры использования:
"categories": ["new"]                // Только в одной категории
"categories": ["new", "short"]       // В двух категориях
"categories": ["new", "short", "long"] // В трех категориях

Шаблон для нового видео:
{
  "id": "video_NEW_ID",
  "preview_url": "FALLBACK_IMAGE_URL", // Показывается если видео не загрузится
  "video_url": "VIDEO_URL",
  "title": "НАЗВАНИЕ",
  "duration": 30, // Длительность в секундах (1 секунда = 50 токенов)
  "categories": ["ВЫБЕРИ_КАТЕГОРИИ"], // Скопируй нужные из списка выше
  "preview_time": 2.5, // Секунда для превью (можно с десятыми)
  "likes": 0 // Начальное количество лайков
}

ВАЖНО: 
- preview_url теперь только для fallback, основное превью берется из видео
- preview_time определяет какой кадр показывать в превью
- duration - длительность в секундах, автоматически рассчитывается в токены (1 сек = 50 токенов)
- Можно добавлять видео в несколько категорий одновременно
- Категория "Избранное" управляется пользователем через кнопки ⭐
- Данные избранного сохраняются в Telegram Cloud Storage
- Лайки показывают популярность видео для всех пользователей
- Лайки пользователя сохраняются в localStorage (в будущем - на сервере)
*/ 