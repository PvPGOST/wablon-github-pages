// Данные о видео шаблонах
const videoData = [
  {
    "id": "video1",
    "preview_url": "https://i.ibb.co/mC4Lx2zT/le-N3-Sl-Cg16-U.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742256575/lwcehpdoflwsdaabp1ea.mp4",
    "title": "Белые кроссовки Nike",
    "description": "Стильные белые кроссовки для повседневного ношения",
    "category": "new",
    "duration": "short"
  },
  {
    "id": "video2",
    "preview_url": "https://i.ibb.co/6RwzDzyH/photo-2025-03-01-04-59-22.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742259893/ff6e3e0b_qu3lha.mp4",
    "title": "Динамичная презентация",
    "description": "Яркий шаблон для презентации товаров",
    "category": "new",
    "duration": "medium"
  },
  {
    "id": "video3",
    "preview_url": "https://i.ibb.co/4w8ng4SH/photo-2025-01-09-01-48-05.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742260073/IMG_4069_ybfkag.mp4",
    "title": "Классический стиль",
    "description": "Элегантный шаблон для бизнеса",
    "category": "popular",
    "duration": "long"
  },
  {
    "id": "video4",
    "preview_url": "https://i.ibb.co/84sXfkKL/5224733158040264968-1.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742260079/%D0%B4%D0%BD%D0%BE_2_lb5rsu.mp4",
    "title": "Минималистичный дизайн",
    "description": "Простой и стильный шаблон",
    "category": "popular",
    "duration": "short"
  },
  {
    "id": "video5",
    "preview_url": "https://i.ibb.co/mC4Lx2zT/le-N3-Sl-Cg16-U.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742256575/lwcehpdoflwsdaabp1ea.mp4",
    "title": "Длинная история",
    "description": "Подробный шаблон для детального рассказа",
    "category": "long",
    "duration": "long"
  },
  {
    "id": "video6",
    "preview_url": "https://i.ibb.co/6RwzDzyH/photo-2025-03-01-04-59-22.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742259893/ff6e3e0b_qu3lha.mp4",
    "title": "Быстрый ролик",
    "description": "Короткий и эффектный шаблон",
    "category": "short",
    "duration": "short"
  }
];

// Конфигурация категорий
const categories = {
  all: {
    name: "Все",
    icon: "📱"
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
  return videoData.filter(video => video.category === category);
}

// Функция для получения и обновления лайков
function getLikedVideos() {
    try {
        const likedJSON = localStorage.getItem('likedVideos');
        return likedJSON ? JSON.parse(likedJSON) : {};
    } catch (e) {
        console.error('Ошибка при получении лайков:', e);
        return {};
    }
}

// Функция для проверки, поставил ли пользователь лайк на видео
function isVideoLiked(videoId) {
    const likedVideos = getLikedVideos();
    return likedVideos[videoId] === true;
}

// Функция для обновления лайка видео
function toggleVideoLike(videoId) {
    const likedVideos = getLikedVideos();
    const currentStatus = likedVideos[videoId] === true;
    
    // Инвертируем статус лайка
    likedVideos[videoId] = !currentStatus;
    
    // Обновляем количество лайков в основных данных
    const videoIndex = videoData.findIndex(v => v.id === videoId);
    if (videoIndex !== -1) {
        // Если лайкнули - увеличиваем, если убрали лайк - уменьшаем
        videoData[videoIndex].likes += currentStatus ? -1 : 1;
    }
    
    // Сохраняем обновленные данные в localStorage
    localStorage.setItem('likedVideos', JSON.stringify(likedVideos));
    
    return !currentStatus; // Возвращаем новый статус
}

// Выводим в консоль для проверки при загрузке
console.log("Данные о видео загружены:", videoData); 