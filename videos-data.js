// Тестовые данные о видео
const videoData = [
  {
    "id": "video1",
    "preview_url": "https://i.ibb.co/mC4Lx2zT/le-N3-Sl-Cg16-U.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742256575/lwcehpdoflwsdaabp1ea.mp4",
    "title": "Белые кроссовки Nike",
    "description": "Стильные белые кроссовки для повседневного ношения",
    "likes": 12
  },
  {
    "id": "video2",
    "preview_url": "https://i.ibb.co/6RwzDzyH/photo-2025-03-01-04-59-22.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742259893/ff6e3e0b_qu3lha.mp4",
    "title": "Видео 2",
    "description": "Хочет спиздеть",
    "likes": 8
  },
  {
    "id": "video3",
    "preview_url": "https://i.ibb.co/4w8ng4SH/photo-2025-01-09-01-48-05.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742260073/IMG_4069_ybfkag.mp4",
    "title": "Видео 3",
    "description": "Описание видео 3",
    "likes": 5
  },
  {
    "id": "video4",
    "preview_url": "https://i.ibb.co/84sXfkKL/5224733158040264968-1.jpg",
    "video_url": "https://res.cloudinary.com/dg9ievxml/video/upload/v1742260079/%D0%B4%D0%BD%D0%BE_2_lb5rsu.mp4",
    "title": "Видео 4",
    "description": "Описание видео 4",
    "likes": 3
  }
];

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