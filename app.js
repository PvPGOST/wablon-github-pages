// Инициализация Telegram Mini App
// Проверяем, доступен ли Telegram Web App API
const isTelegramEnvironment = window.Telegram && window.Telegram.WebApp;

let tg;
if (isTelegramEnvironment) {
    // Реальный Telegram Web App API
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
} else {
    // Mock для локальной разработки
    tg = {
        ready: () => console.log('Mock: Telegram WebApp ready'),
        expand: () => console.log('Mock: Telegram WebApp expand'),
        sendData: (data) => console.log('Mock sendData:', data),
        close: () => console.log('Mock close'),
        showPopup: (options) => console.log('Mock showPopup:', options)
    };
}

// Переменная для хранения выбранного видео
let selectedVideoId = null;
let currentCategory = 'all';

// Функция для получения категории из URL хэша
function getCategoryFromHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#category=')) {
        return hash.replace('#category=', '');
    }
    return 'all';
}

// Функция для создания элементов превью видео
function createVideoPreview(video) {
    const previewElement = document.createElement('div');
    previewElement.className = 'video-preview';
    previewElement.setAttribute('data-id', video.id);
    
    // Проверяем, есть ли категория "new" у видео
    const hasNewCategory = video.categories && video.categories.includes('new');
    const newBadge = hasNewCategory ? '<div class="new-badge">NEW</div>' : '';
    
    // Добавляем видео превью вместо картинки с указанным временем
    const previewTime = video.preview_time || 0.1; // По умолчанию 0.1 секунда
    previewElement.innerHTML = `
        <div class="video-container">
            <!-- Индикатор загрузки -->
            <div class="loading-indicator">
                <div class="loading-spinner"></div>
                <div class="loading-text">Загрузка...</div>
            </div>
            
            <!-- Fallback изображение (показывается только при ошибке) -->
            <img class="preview-image fallback-image" src="${typeof UNIVERSAL_FALLBACK_IMAGE !== 'undefined' ? UNIVERSAL_FALLBACK_IMAGE : ''}" alt="${video.title}" style="display: none;">
            
            <!-- Видео превью (скрыто до загрузки) -->
            <video class="preview-video" preload="metadata" muted style="display: none;">
                <source src="${video.video_url}" type="video/mp4">
            </video>
            
            <!-- Overlay с информацией об ошибке -->
            <div class="error-overlay" style="display: none;">
                <div class="error-icon">⚠️</div>
                <div class="error-text">Видео недоступно</div>
            </div>
            
            <div class="video-duration" style="display: none;">0:00</div>
            ${newBadge}
            <div class="likes-container">
                <div class="like-display">
                    <span class="like-icon">❤️</span>
                    <span class="like-count">${video.likes || 0}</span>
                </div>
            </div>
        </div>
    `;
    
    // Получаем элементы для работы с превью
    const videoElement = previewElement.querySelector('.preview-video');
    const durationElement = previewElement.querySelector('.video-duration');
    const loadingIndicator = previewElement.querySelector('.loading-indicator');
    const fallbackImage = previewElement.querySelector('.fallback-image');
    const errorOverlay = previewElement.querySelector('.error-overlay');
    
    // Обработчик успешной загрузки метаданных видео
    videoElement.addEventListener('loadedmetadata', function() {
        console.log(`Метаданные видео ${video.id} загружены`);
        
        // Устанавливаем время превью
        this.currentTime = previewTime;
        
        // Устанавливаем длительность
        const duration = Math.floor(videoElement.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        durationElement.textContent = formattedDuration;
        durationElement.style.display = 'block';
        
        console.log(`Длительность видео ${video.id}: ${formattedDuration}`);
    });
    
    // Обработчик когда видео готово к отображению (на нужном кадре)
    videoElement.addEventListener('seeked', function() {
        console.log(`Видео ${video.id} перемотано на ${previewTime}s`);
        
        // Скрываем индикатор загрузки
        loadingIndicator.style.display = 'none';
        
        // Показываем видео (fallback остается скрытым)
        videoElement.style.display = 'block';
    });
    
    // Обработчик ошибки видео (загрузка или перемотка)
    videoElement.addEventListener('error', function(e) {
        console.error(`Ошибка видео ${video.id}:`, e);
        
        // Скрываем индикатор загрузки
        loadingIndicator.style.display = 'none';
        
        // Показываем fallback и ошибку
        fallbackImage.style.display = 'block';
        errorOverlay.style.display = 'flex';
    });
    
    // Обработчик загрузки fallback изображения
    fallbackImage.addEventListener('load', function() {
        console.log(`Fallback изображение ${video.id} загружено`);
        // Fallback изображение загружено, но показываем его только при ошибке видео
    });
    
    // Обработчик ошибки загрузки fallback изображения
    fallbackImage.addEventListener('error', function() {
        console.error(`Ошибка загрузки fallback изображения ${video.id}`);
        loadingIndicator.style.display = 'none';
        errorOverlay.style.display = 'flex';
    });
    
    // Таймаут для видео, которые долго загружаются (10 секунд)
    setTimeout(() => {
        if (videoElement.style.display === 'none' && loadingIndicator.style.display !== 'none') {
            console.warn(`Видео ${video.id} не загрузилось за 10 секунд, показываем fallback`);
            loadingIndicator.style.display = 'none';
            fallbackImage.style.display = 'block';
            errorOverlay.style.display = 'flex';
        }
    }, 10000);
    
    // Добавляем обработчик клика для перехода к странице просмотра видео
    previewElement.addEventListener('click', () => {
        // Сначала убираем класс 'selected' у всех элементов
        document.querySelectorAll('.video-preview').forEach(el => el.classList.remove('selected'));
        
        // Добавляем класс 'selected' только выбранному элементу
        previewElement.classList.add('selected');
        
        // Сохраняем ID выбранного видео в localStorage
        localStorage.setItem('selectedVideoId', video.id);
        
        // Переходим на страницу видео с информацией о текущей категории
        window.location.href = `video.html?id=${video.id}&category=${currentCategory}`;
    });
    
    return previewElement;
}

// Функция для обновления состояния кнопки лайка
function updateLikeButton(button, videoId) {
    const icon = button.querySelector('.like-icon');
    
    // Проверяем, что функция isVideoLiked существует
    const isLiked = (typeof isVideoLiked === 'function') ? isVideoLiked(videoId) : false;
    
    if (isLiked) {
        icon.textContent = '♥'; // Заполненный сердечко
        button.classList.add('like-active');
        button.title = 'Убрать лайк';
    } else {
        icon.textContent = '♡'; // Пустое сердечко
        button.classList.remove('like-active');
        button.title = 'Поставить лайк';
    }
}

// Функция для обновления состояния кнопки избранного
function updateFavoriteButton(button, videoId) {
    const icon = button.querySelector('.favorite-icon');
    
    // Проверяем, что функция isVideoFavorite существует
    const isFavorite = (typeof isVideoFavorite === 'function') ? isVideoFavorite(videoId) : false;
    
    if (isFavorite) {
        icon.textContent = '★'; // Заполненная звезда
        button.classList.add('favorite-active');
        button.title = 'Удалить из избранного';
    } else {
        icon.textContent = '☆'; // Пустая звезда
        button.classList.remove('favorite-active');
        button.title = 'Добавить в избранное';
    }
}

// Функция для обновления всех счетчиков лайков на странице
function updateAllLikeCounters(videoId) {
    if (typeof getVideoLikes !== 'function') return;
    
    const newLikeCount = getVideoLikes(videoId);
    const likeCounters = document.querySelectorAll(`[data-video-id="${videoId}"] + .like-count, .like-count`);
    
    likeCounters.forEach(counter => {
        counter.textContent = newLikeCount;
    });
}

// Функция для создания кнопок категорий
function createCategoryButtons() {
    const categoriesContainer = document.getElementById('categories');
    
    // Очищаем контейнер
    categoriesContainer.innerHTML = '';
    
    // Проверяем, что переменная categories существует
    if (typeof categories === 'undefined') {
        console.error('categories не найдена, кнопки категорий не созданы');
        return;
    }
    
    // Создаем кнопки для каждой категории
    Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];
        const button = document.createElement('button');
        button.className = 'category-button';
        button.setAttribute('data-category', categoryKey);
        
        if (categoryKey === currentCategory) {
            button.classList.add('active');
        }
        
        button.innerHTML = `
            <span class="icon">${category.icon}</span>
            <span>${category.name}</span>
        `;
        
        button.addEventListener('click', () => {
            switchCategory(categoryKey);
        });
        
        categoriesContainer.appendChild(button);
    });
}

// Функция для переключения категории
function switchCategory(categoryKey) {
    currentCategory = categoryKey;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${categoryKey}"]`).classList.add('active');
    
    // Перезагружаем видео для новой категории
    loadVideoGrid();
    
    console.log(`Переключились на категорию: ${categoryKey}`);
}

// Функция для загрузки и отображения сетки видео
async function loadVideoGrid() {
    const videoGridElement = document.getElementById('videoGrid');
    
    // Очищаем сетку перед загрузкой новых данных
    videoGridElement.innerHTML = '';
    
    // Проверяем, есть ли данные в глобальной переменной
    if (typeof videoData !== 'undefined' && Array.isArray(videoData)) {
        // Получаем видео для текущей категории
        let videosToShow = [];
        
        if (typeof getVideosByCategory === 'function') {
            videosToShow = getVideosByCategory(currentCategory);
        } else {
            // Fallback - показываем все видео если функция недоступна
            console.warn('getVideosByCategory не найдена, показываем все видео');
            videosToShow = videoData;
        }
        
        if (videosToShow.length === 0) {
            if (currentCategory === 'favorites') {
                videoGridElement.innerHTML = '<p class="no-videos">У вас пока нет избранных видео.<br>Добавьте видео в избранное, нажав на ⭐</p>';
            } else {
                videoGridElement.innerHTML = '<p class="no-videos">🔥 Скоро тут будет горячо! 🔥<br><span class="coming-soon">Новые видео уже готовятся...</span></p>';
            }
            return;
        }
        
        // Загружаем видео для текущей категории
        videosToShow.forEach(video => {
            const previewElement = createVideoPreview(video);
            videoGridElement.appendChild(previewElement);
        });
    } else {
        // Если данных нет, показываем сообщение об ошибке
        videoGridElement.innerHTML = '<p class="error-message">Ошибка загрузки данных. Пожалуйста, попробуйте позже.</p>';
    }
    
    // Проверяем, есть ли сохраненный выбор
    const savedVideoId = localStorage.getItem('selectedVideoId');
    if (savedVideoId) {
        // Находим элемент и выделяем его
        const element = document.querySelector(`.video-preview[data-id="${savedVideoId}"]`);
        if (element) {
            element.classList.add('selected');
            selectedVideoId = savedVideoId;
        }
    }
}

// Настройка кнопки "ВЫБРАТЬ ШАБЛОН"
function setupConfirmButton() {
    const confirmButton = document.getElementById('mainConfirmButton');
    
    confirmButton.addEventListener('click', () => {
        if (selectedVideoId) {
            // Находим выбранное видео по ID
            const selectedVideo = videoData.find(video => video.id === selectedVideoId);
            
            if (selectedVideo) {
                // Отправляем данные о выбранном видео обратно в Telegram-бот
                tg.sendData(JSON.stringify({
                    selected_video_id: selectedVideo.id,
                    selected_video_title: selectedVideo.title
                }));
                
                // Закрываем Mini App
                tg.close();
            }
        } else {
            alert('Пожалуйста, выберите шаблон');
        }
    });
}

// Загружаем категории и сетку видео при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Получаем категорию из URL хэша
        const hashCategory = getCategoryFromHash();
        if (hashCategory !== 'all') {
            currentCategory = hashCategory;
        }
        
        // Ждем загрузки избранного из Cloud Storage (если функция существует)
        if (typeof loadFavoritesFromCloud === 'function') {
            await loadFavoritesFromCloud();
        } else {
            console.warn('loadFavoritesFromCloud не найдена, пропускаем загрузку избранного');
        }
        
        createCategoryButtons();
        await loadVideoGrid();
        setupConfirmButton();
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        
        // Fallback - загружаем без избранного
        createCategoryButtons();
        await loadVideoGrid();
        setupConfirmButton();
    }
}); 