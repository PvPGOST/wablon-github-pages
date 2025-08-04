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

// Запускаем всё после того как документ загрузится
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, что переменная videoData существует
    if (typeof videoData === 'undefined' || !Array.isArray(videoData)) {
        showError('Ошибка загрузки данных о видео. Перезагрузите страницу или обратитесь к администратору.');
        return;
    }
    
    // Получаем ID видео из URL
    const videoId = getVideoIdFromURL();
    
    if (!videoId) {
        showError('ID видео не указан в URL');
        return;
    }
    
    // Находим видео по ID
    const video = findVideoById(videoId);
    
    if (!video) {
        showError('Видео не найдено');
        return;
    }
    
    // Устанавливаем заголовок и описание
    document.title = video.title;
    document.getElementById('videoTitle').textContent = video.title || 'Без названия';
    
    // Устанавливаем длительность и токены
    const durationText = (typeof getDurationText === 'function') ? getDurationText(video.id) : 'Длительность не указана';
    document.getElementById('videoDescription').textContent = durationText;
    
    // Отображаем видео
    displayVideo(video);
    
    // Настраиваем кнопки действий
    setupFavoriteButton(video);
    setupLikeButton(video);
    
    // Настраиваем кнопки навигации
    setupBackButton();
    setupConfirmButton(video);
});

// Получаем id видео из URL параметров
function getVideoIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Получаем категорию из URL параметров
function getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('category') || 'all';
}

// Функция для поиска видео по id в массиве данных
function findVideoById(id) {
    if (typeof videoData === 'undefined' || !Array.isArray(videoData)) {
        return null;
    }
    return videoData.find(video => video.id === id);
}

// Функция для отображения сообщения об ошибке
function showError(message) {
    const videoContainer = document.getElementById('videoContainer');
    if (videoContainer) {
        videoContainer.innerHTML = `
            <div class="error-message" style="
                color: white;
                background-color: rgba(255, 0, 0, 0.7);
                padding: 20px;
                border-radius: 5px;
                text-align: center;
                margin: 20px auto;
                max-width: 80%;
            ">
                ${message}
            </div>
        `;
    }
}

// Функция для отображения видео и его информации
function displayVideo(video) {
    if (!video) {
        showError('Видео не найдено');
        return;
    }
    
    const videoContainer = document.getElementById('videoContainer');
    if (!videoContainer) {
        return;
    }
    
    videoContainer.innerHTML = '';
    
    if (video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be')) {
        // Для YouTube видео
        let youtubeUrl = video.video_url;
        if (youtubeUrl.includes('?')) {
            youtubeUrl += '&autoplay=1&mute=1&loop=1&controls=0';
        } else {
            youtubeUrl += '?autoplay=1&mute=1&loop=1&controls=0';
        }
        
        videoContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                style="min-height: 250px; max-height: 60vh; border: none !important;" 
                src="${youtubeUrl}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else if (video.video_url.includes('vimeo.com')) {
        // Для Vimeo видео
        let vimeoUrl = video.video_url;
        if (vimeoUrl.includes('?')) {
            vimeoUrl += '&autoplay=1&muted=1&loop=1&controls=0';
        } else {
            vimeoUrl += '?autoplay=1&muted=1&loop=1&controls=0';
        }
        
        videoContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                style="min-height: 250px; max-height: 60vh; border: none !important;" 
                src="${vimeoUrl}" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        // Для обычных видео (Cloudinary и др.)
        videoContainer.innerHTML = `
            <div class="video-fallback-container">
                <!-- Индикатор загрузки для основного видео -->
                <div class="video-loading-indicator">
                    <div class="video-loading-spinner"></div>
                    <div class="video-loading-text">Загружаем видео...</div>
                </div>
                
                <!-- Fallback изображение -->
                <img class="video-fallback-image" src="${typeof UNIVERSAL_FALLBACK_IMAGE !== 'undefined' ? UNIVERSAL_FALLBACK_IMAGE : ''}" alt="${video.title}" style="display: none;">
                
                <!-- Основное видео -->
                <video 
                    id="videoElement"
                    autoplay 
                    muted 
                    loop 
                    playsinline
                    style="width: 100%; min-height: 250px; max-height: 60vh; border: none !important; background-color: #000; object-fit: contain; display: none;">
                    <source src="${video.video_url}" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
                
                <!-- Overlay с ошибкой -->
                <div class="video-error-overlay" style="display: none;">
                    <div class="video-error-icon">⚠️</div>
                    <div class="video-error-text">Видео временно недоступно</div>
                    <div class="video-error-subtext">Попробуйте перезагрузить страницу</div>
                </div>
            </div>
        `;
        
        const videoElement = document.getElementById('videoElement');
        const loadingIndicator = videoContainer.querySelector('.video-loading-indicator');
        const fallbackImage = videoContainer.querySelector('.video-fallback-image');
        const errorOverlay = videoContainer.querySelector('.video-error-overlay');
        
        if (videoElement) {
            // Обработчик успешной загрузки видео
            videoElement.addEventListener('loadeddata', function() {
                console.log('Основное видео загружено успешно');
                
                // Убеждаемся, что видео начинается с начала
                this.currentTime = 0;
                
                loadingIndicator.style.display = 'none';
                fallbackImage.style.display = 'none';
                videoElement.style.display = 'block';
            });
            
            // Обработчик клика для показа/скрытия контролов
            videoElement.addEventListener('click', function() {
                this.controls = !this.controls;
                
                if (this.controls) {
                    setTimeout(() => {
                        if (!this.paused) {
                            this.controls = false;
                        }
                    }, 5000);
                }
            });
            
            // Обработчик ошибки загрузки видео
            videoElement.addEventListener('error', function(e) {
                console.error('Ошибка загрузки основного видео');
                loadingIndicator.style.display = 'none';
                fallbackImage.style.display = 'block';
                errorOverlay.style.display = 'flex';
            });
            
            // Обработчик загрузки fallback изображения
            fallbackImage.addEventListener('load', function() {
                console.log('Fallback изображение основного видео загружено');
            });
            
            // Обработчик ошибки fallback изображения
            fallbackImage.addEventListener('error', function() {
                console.error('Ошибка загрузки fallback изображения основного видео');
                loadingIndicator.style.display = 'none';
                errorOverlay.style.display = 'flex';
            });
        }
    }
}

// Функция для настройки кнопки "Назад"
function setupBackButton() {
    const backButton = document.getElementById('backButton');
    if (!backButton) {
        return;
    }
    
    backButton.addEventListener('click', function() {
        // Получаем текущую категорию и возвращаемся к ней
        const currentCategory = getCategoryFromURL();
        if (currentCategory && currentCategory !== 'all') {
            window.location.href = `index.html#category=${currentCategory}`;
        } else {
            window.location.href = 'index.html';
        }
    });
}



// Функция для настройки кнопки "Подтвердить"
function setupConfirmButton(video) {
    const confirmButton = document.getElementById('confirmButton');
    if (!confirmButton) {
        return;
    }
    
    if (!video) {
        confirmButton.style.display = 'none';
        return;
    }
    
    // Отображаем кнопку
    confirmButton.style.display = 'block';
    
    // Очищаем предыдущие обработчики событий
    const newButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newButton, confirmButton);
    
    newButton.addEventListener('click', function() {
        // Создаем и показываем уведомление
        const notificationElement = document.createElement('div');
        notificationElement.className = 'success-notification';
        notificationElement.textContent = 'Отправка шаблона...';
        notificationElement.style.position = 'fixed';
        notificationElement.style.bottom = '20px';
        notificationElement.style.left = '50%';
        notificationElement.style.transform = 'translateX(-50%)';
        notificationElement.style.backgroundColor = 'rgba(0, 100, 150, 0.9)';
        notificationElement.style.color = 'white';
        notificationElement.style.padding = '15px 20px';
        notificationElement.style.borderRadius = '5px';
        notificationElement.style.zIndex = '1000';
        notificationElement.style.textAlign = 'center';
        
        document.body.appendChild(notificationElement);
        
        try {
            // Извлекаем числовой ID из строки для формирования пути
            const numericId = video.id.replace(/[^\d]/g, '');
            
            // Формируем относительный путь для видео
            const videoPath = `video_templates/template_${numericId}.mp4`;
            
            // Данные для отправки (новая схема)
            const dataToSend = {
                'videoPath': videoPath,
                'displayName': video.displayName || video.title // Используем displayName или fallback на title
            };
            
            // Отправляем данные в Telegram
            console.log('=== ОТПРАВКА ДАННЫХ В TELEGRAM ===');
            console.log('window.Telegram доступен:', !!window.Telegram);
            console.log('window.Telegram.WebApp доступен:', !!(window.Telegram && window.Telegram.WebApp));
            console.log('Данные для отправки:', dataToSend);
            
            if (window.Telegram && window.Telegram.WebApp) {
                localStorage.setItem('lastSentData', JSON.stringify(dataToSend));
                
                const jsonData = JSON.stringify(dataToSend);
                console.log('JSON для отправки:', jsonData);
                
                // Отправляем данные
                console.log('Вызываем sendData...');
                window.Telegram.WebApp.sendData(jsonData);
                console.log('sendData вызван успешно');
                
                // Принудительно закрываем Mini App через 2 секунды
                setTimeout(() => {
                    console.log('Закрываем Mini App...');
                    if (window.Telegram.WebApp.close) {
                        window.Telegram.WebApp.close();
                    }
                }, 2000);
                
                // Обновляем уведомление
                notificationElement.textContent = 'Шаблон отправлен на обработку!';
                notificationElement.style.backgroundColor = 'rgba(0, 128, 0, 0.9)';
                
                // Показываем сообщение Telegram
                window.Telegram.WebApp.showPopup({
                    title: "Шаблон выбран",
                    message: `Шаблон "${video.displayName || video.title}" отправлен на обработку!`,
                    buttons: [{type: "ok"}]
                });
                
                // Закрываем уведомление через 3 секунды
                setTimeout(() => {
                    notificationElement.style.opacity = '0';
                    notificationElement.style.transition = 'opacity 0.5s';
                    
                    setTimeout(() => {
                        notificationElement.remove();
                    }, 500);
                }, 3000);
            } else {
                throw new Error('Telegram WebApp API не доступен');
            }
        } catch (error) {
            notificationElement.textContent = `Ошибка: ${error.message}`;
            notificationElement.style.backgroundColor = 'rgba(200, 0, 0, 0.9)';
            
            // Закрываем уведомление об ошибке через 5 секунд
            setTimeout(() => {
                notificationElement.style.opacity = '0';
                notificationElement.style.transition = 'opacity 0.5s';
                
                setTimeout(() => {
                    notificationElement.remove();
                }, 500);
            }, 5000);
        }
    });
}

// Функция для настройки кнопки избранного
function setupFavoriteButton(video) {
    console.log('=== НАСТРОЙКА КНОПКИ ИЗБРАННОГО ===');
    console.log('Видео:', video);
    
    const favoriteButton = document.getElementById('favoriteButton');
    const favoriteIcon = favoriteButton?.querySelector('.favorite-icon');
    
    console.log('Кнопка избранного найдена:', !!favoriteButton);
    console.log('Иконка избранного найдена:', !!favoriteIcon);
    
    if (!favoriteButton || !video) {
        console.log('Кнопка или видео не найдены, выходим');
        return;
    }
    
    // Функция для обновления состояния кнопки
    function updateFavoriteButton() {
        console.log('Обновляем состояние кнопки избранного');
        console.log('Функция isVideoFavorite доступна:', typeof isVideoFavorite === 'function');
        
        const isFavorite = (typeof isVideoFavorite === 'function') ? isVideoFavorite(video.id) : false;
        console.log('Видео в избранном:', isFavorite);
        
        if (isFavorite) {
            favoriteIcon.textContent = '★';
            favoriteButton.classList.add('favorite-active');
            console.log('Установлена заполненная звезда');
        } else {
            favoriteIcon.textContent = '☆';
            favoriteButton.classList.remove('favorite-active');
            console.log('Установлена пустая звезда');
        }
    }
    
    // Обновляем состояние при загрузке
    updateFavoriteButton();
    
    // Обработчик клика
    favoriteButton.addEventListener('click', async function() {
        console.log('=== КЛИК ПО КНОПКЕ ИЗБРАННОГО ===');
        console.log('ID видео:', video.id);
        
        try {
            if (typeof toggleVideoFavorite === 'function') {
                console.log('Вызываем toggleVideoFavorite');
                const newFavoriteStatus = await toggleVideoFavorite(video.id);
                console.log('Получен новый статус:', newFavoriteStatus);
                
                updateFavoriteButton();
                
                // Показываем уведомление пользователю
                const message = newFavoriteStatus ? 'Добавлено в избранное' : 'Удалено из избранного';
                console.log(message + ': ' + video.title);
                
                // Тактильная обратная связь
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
            } else {
                console.warn('toggleVideoFavorite не найдена');
            }
        } catch (error) {
            console.error('Ошибка при переключении избранного:', error);
        }
        
        console.log('=== КОНЕЦ КЛИКА ПО КНОПКЕ ИЗБРАННОГО ===');
    });
    
    console.log('=== КОНЕЦ НАСТРОЙКИ КНОПКИ ИЗБРАННОГО ===');
}

// Функция для настройки кнопки лайков
function setupLikeButton(video) {
    const likeButton = document.getElementById('likeButton');
    const likeIcon = likeButton?.querySelector('.like-icon');
    const likeCount = document.getElementById('likeCount');
    
    if (!likeButton || !video) {
        return;
    }
    
    // Функция для обновления состояния кнопки
    function updateLikeButton() {
        const isLiked = (typeof isVideoLiked === 'function') ? isVideoLiked(video.id) : false;
        const likes = (typeof getVideoLikes === 'function') ? getVideoLikes(video.id) : (video.likes || 0);
        
        if (isLiked) {
            likeIcon.textContent = '❤️';
            likeButton.classList.add('like-active');
        } else {
            likeIcon.textContent = '🤍';
            likeButton.classList.remove('like-active');
        }
        
        if (likeCount) {
            likeCount.textContent = likes;
        }
    }
    
    // Обновляем состояние при загрузке
    updateLikeButton();
    
    // Обработчик клика
    likeButton.addEventListener('click', async function() {
        try {
            if (typeof toggleVideoLike === 'function') {
                const newLikeStatus = await toggleVideoLike(video.id);
                updateLikeButton();
                
                // Показываем уведомление пользователю
                const message = newLikeStatus ? 'Лайк поставлен' : 'Лайк убран';
                console.log(message + ': ' + video.title);
                
                // Тактильная обратная связь
                if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
            } else {
                console.warn('toggleVideoLike не найдена');
            }
        } catch (error) {
            console.error('Ошибка при переключении лайка:', error);
        }
    });
} 