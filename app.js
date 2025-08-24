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
    return 'all';
}
window.botParams = {
    bot_id: null,
    user_id: null,
    message_id: null,
    saved: false
};
// Function to save bot parameters from URL
function saveBotParamsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    window.botParams.bot_id = urlParams.get('bot');
    window.botParams.user_id = urlParams.get('user');
    window.botParams.message_id = urlParams.get('message');
    window.botParams.saved = true;
    
    console.log('=== BOT PARAMETERS SAVED ===');
    console.log('Bot ID:', window.botParams.bot_id);
    console.log('User ID:', window.botParams.user_id);
    console.log('Message ID:', window.botParams.message_id);
    console.log('=== END SAVE ===');
    
    // Also save to localStorage as backup
    try {
        localStorage.setItem('botParams', JSON.stringify(window.botParams));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
    
    return window.botParams;
}

function loadBotParams() {
    // First try to get from global variable
    if (window.botParams && window.botParams.saved) {
        console.log('Loading bot params from global variable');
        return window.botParams;
    }
    
    // Fallback to localStorage
    try {
        const saved = localStorage.getItem('botParams');
        if (saved) {
            window.botParams = JSON.parse(saved);
            console.log('Loading bot params from localStorage');
            return window.botParams;
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
    
    // If nothing found, return empty params
    console.log('No bot params found');
    return {
        bot_id: null,
        user_id: null,
        message_id: null,
        saved: false
    };
}

// Функция для создания элементов превью видео
function createVideoPreview(video) {
    const previewElement = document.createElement('div');
    previewElement.className = 'video-preview';
    previewElement.setAttribute('data-id', video.id);
    
    // Проверяем, есть ли категория "new" у видео
    const hasNewCategory = video.categories && video.categories.includes('new');
    const newBadge = hasNewCategory ? '<div class="new-badge">NEW</div>' : '';
    
    // Форматируем длительность
    const duration = video.duration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Используем статичное превью вместо видео с ленивой загрузкой
    previewElement.innerHTML = `
        <div class="video-container">
            <!-- Индикатор загрузки -->
            <div class="loading-indicator" style="display: none;">
                <div class="loading-spinner"></div>
                <div class="loading-text">Загрузка...</div>
            </div>
            
            <!-- Плейсхолдер до загрузки (для ленивой загрузки) -->
            <div class="preview-placeholder" style="
                width: 100%; 
                height: 100%; 
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                font-size: 14px;
            ">
                📱 Загрузится при прокрутке
            </div>
            
            <!-- Статичное превью изображение (для ленивой загрузки) -->
            <img class="preview-image lazy-load" 
                 data-src="${video.preview_image || ''}" 
                 alt="${video.title}" 
                 style="display: none;">
            
            <!-- Overlay с информацией об ошибке (только при ошибке превью) -->
            <div class="error-overlay" style="display: none;">
                <div class="error-icon">⚠️</div>
                <div class="error-text">Превью недоступно</div>
            </div>
            
            <div class="video-duration">${formattedDuration}</div>
            ${newBadge}
            <div class="likes-container">
                <div class="like-display">
                    <span class="like-icon">❤️</span>
                    <span class="like-count">${video.likes || 0}</span>
                </div>
            </div>
        </div>
    `;
    
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
    loadVideoGrid().then(() => {
        // Обновляем ленивую загрузку для новых элементов
        setTimeout(() => {
            updateLazyLoading();
        }, 100);
    });
    
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
// === СИСТЕМА ЛЕНИВОЙ ЗАГРУЗКИ ===

// Intersection Observer для ленивой загрузки превью
let lazyLoadObserver = null;

// Функция инициализации ленивой загрузки
function initLazyLoading() {
    // Проверяем поддержку Intersection Observer
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver не поддерживается, загружаем все изображения сразу');
        loadAllImagesImmediately();
        return;
    }
    
    // Создаем наблюдатель
    lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadPreviewImage(entry.target);
                lazyLoadObserver.unobserve(entry.target);
            }
        });
    }, {
        // Загружаем изображения за 200px до появления в области видимости
        rootMargin: '200px',
        threshold: 0.1
    });
    
    // Наблюдаем за всеми превью элементами
    document.querySelectorAll('.video-preview').forEach(element => {
        lazyLoadObserver.observe(element);
    });
}

// Функция загрузки превью изображения
function loadPreviewImage(previewElement) {
    const previewImage = previewElement.querySelector('.preview-image.lazy-load');
    const loadingIndicator = previewElement.querySelector('.loading-indicator');
    const placeholder = previewElement.querySelector('.preview-placeholder');
    const errorOverlay = previewElement.querySelector('.error-overlay');
    
    if (!previewImage || !previewImage.dataset.src) {
        console.warn('Нет данных для загрузки превью');
        return;
    }
    
    // Показываем индикатор загрузки
    placeholder.style.display = 'none';
    loadingIndicator.style.display = 'flex';
    
    // Обработчик успешной загрузки
    previewImage.addEventListener('load', function() {
        console.log(`Превью изображение загружено: ${previewImage.src}`);
        loadingIndicator.style.display = 'none';
        previewImage.style.display = 'block';
    }, { once: true });
    
    // Обработчик ошибки загрузки
    previewImage.addEventListener('error', function() {
        console.error(`Ошибка загрузки превью: ${previewImage.src}`);
        loadingIndicator.style.display = 'none';
        errorOverlay.style.display = 'flex';
    }, { once: true });
    
    // Таймаут для медленных соединений (5 секунд)
    const timeout = setTimeout(() => {
        if (loadingIndicator.style.display !== 'none') {
            console.warn(`Превью долго загружается: ${previewImage.dataset.src}`);
            loadingIndicator.style.display = 'none';
            errorOverlay.style.display = 'flex';
        }
    }, 5000);
    
    // Убираем таймаут при успешной загрузке
    previewImage.addEventListener('load', () => clearTimeout(timeout), { once: true });
    previewImage.addEventListener('error', () => clearTimeout(timeout), { once: true });
    
    // Начинаем загрузку
    previewImage.src = previewImage.dataset.src;
    previewImage.classList.remove('lazy-load');
}

// Fallback для браузеров без поддержки Intersection Observer
function loadAllImagesImmediately() {
    document.querySelectorAll('.video-preview').forEach(previewElement => {
        loadPreviewImage(previewElement);
    });
}

// Функция для обновления ленивой загрузки после изменения содержимого
function updateLazyLoading() {
    if (lazyLoadObserver) {
        // Наблюдаем за новыми элементами
        document.querySelectorAll('.video-preview:not([data-observed])').forEach(element => {
            element.setAttribute('data-observed', 'true');
            lazyLoadObserver.observe(element);
        });
    }
}

// Загружаем категории и сетку видео при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    saveBotParamsFromURL();

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
        
        // Инициализируем ленивую загрузку после создания элементов
        setTimeout(() => {
            initLazyLoading();
        }, 100);
        
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        
        // Fallback - загружаем без избранного
        createCategoryButtons();
        await loadVideoGrid();
        
        // Все равно инициализируем ленивую загрузку
        setTimeout(() => {
            initLazyLoading();
        }, 100);
    }
}); 