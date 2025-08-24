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
                
                <!-- Основное видео -->
                <video 
                    id="videoElement"
                    autoplay 
                    muted 
                    loop 
                    playsinline
                    preload="metadata"
                    style="width: 100%; min-height: 250px; max-height: 60vh; border: none !important; background-color: #000; object-fit: contain; display: none;">
                    <source src="${video.video_url}" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
                
                <!-- Fallback изображение убрано для оптимизации -->
                
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
		const errorOverlay = videoContainer.querySelector('.video-error-overlay');

		if (videoElement) {
			const showVideo = () => {
				loadingIndicator.style.display = 'none';
				videoElement.style.display = 'block';
			};

			videoElement.addEventListener('loadeddata', function() {
				console.log('Основное видео загружено успешно');
				this.currentTime = 0;
				showVideo();
			});

			videoElement.addEventListener('loadedmetadata', showVideo);
			videoElement.addEventListener('canplay', showVideo);

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

			videoElement.addEventListener('error', function() {
				console.error('Ошибка загрузки основного видео');
				loadingIndicator.style.display = 'none';
				
				// Показываем текстовое сообщение об ошибке
				errorOverlay.style.display = 'flex';
			});

			videoElement.muted = true;
			videoElement.autoplay = true;
			videoElement.playsInline = true;
			videoElement.src = video.video_url;
			videoElement.load();
			videoElement.play().catch(() => {});

			if (videoElement.readyState >= 2) {
				showVideo();
			}

			setTimeout(() => {
				if (videoElement.readyState >= 2) {
					showVideo();
				}
			}, 1000);
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
             // Получаем данные пользователя Telegram
            let userData = null;
            let telegramUserId = null;
            
            if (isTelegramEnvironment && window.Telegram.WebApp.initDataUnsafe) {
                // Получаем данные пользователя из Telegram WebApp
                userData = window.Telegram.WebApp.initDataUnsafe.user;
                telegramUserId = userData ? userData.id : null;
                
                console.log('Telegram user ID:', telegramUserId);
            } else {
                // Для разработки/тестирования - используем моковые данные
                console.log('Mock environment - using test user ID');
                telegramUserId = '0';
                userData = {
                    id: '0',
                };
            }
            const botParams = loadBotParams();
            
            // Формируем данные для отправки
            const requestData = {
                video_id: video.id,
                bot_id: botParams.bot_id,
                user_id: botParams.user_id,
                message_id: botParams.message_id,
            };
            
            const jsonData = JSON.stringify(requestData);
            console.log('JSON для отправки:', jsonData);
            
            // Отправляем POST на наш API через NGINX
            const serverUrl = '/api/video_template';
            fetch(serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: jsonData,
            })
            .then(async (response) => {
                if (!response.ok) throw new Error(`Server error: ${response.status}`);
                notificationElement.textContent = 'Отличный выбор!';
                notificationElement.style.backgroundColor = 'rgba(0, 128, 0, 0.9)';
                
                // Закрываем Mini App после успешной отправки
                setTimeout(() => {
                    tg.close();
                }, 1500); // Даем время показать уведомление, затем закрываем
                
                return response.text().catch(() => '');
            })
            .catch((error) => {
                console.error('Ошибка отправки:', error);
                notificationElement.textContent = `Ошибка отправки: ${error.message}`;
                notificationElement.style.backgroundColor = 'rgba(200, 0, 0, 0.9)';
            })
            .finally(() => {
                setTimeout(() => {
                    notificationElement.style.opacity = '0';
                    notificationElement.style.transition = 'opacity 0.5s';
                    setTimeout(() => notificationElement.remove(), 500);
                }, 3000);
            });
        } catch (error) {
            console.error('Ошибка:', error);
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
    
    if (!likeButton || !video) {
        return;
    }
    
    // Функция для обновления состояния кнопки (только иконка)
    function updateLikeButton() {
        const isLiked = (typeof isVideoLiked === 'function') ? isVideoLiked(video.id) : false;
        
        if (isLiked) {
            likeIcon.textContent = '❤️';
            likeButton.classList.add('like-active');
        } else {
            likeIcon.textContent = '🤍';
            likeButton.classList.remove('like-active');
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