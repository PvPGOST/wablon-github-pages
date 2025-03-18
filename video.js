// Инициализация Telegram Mini App
let tg = window.Telegram.WebApp;

// Сообщаем Telegram, что приложение готово
tg.ready();

// Устанавливаем тему и кнопки
tg.expand();

// Получаем id видео из URL параметров
function getVideoIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Функция для поиска видео по id в массиве данных
function findVideoById(id) {
    if (typeof videoData !== 'undefined' && Array.isArray(videoData)) {
        return videoData.find(video => video.id === id);
    }
    return null;
}

// Функция для общей обработки ошибок воспроизведения видео
function handleVideoError(videoElement, errorMessage) {
    console.error(errorMessage);
    // Добавляем заметное сообщение об ошибке на странице
    const errorContainer = document.createElement('div');
    errorContainer.className = 'video-error-message';
    errorContainer.textContent = 'Ошибка воспроизведения видео. Нажмите для повторной попытки.';
    errorContainer.style.position = 'absolute';
    errorContainer.style.top = '50%';
    errorContainer.style.left = '50%';
    errorContainer.style.transform = 'translate(-50%, -50%)';
    errorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    errorContainer.style.color = '#fff';
    errorContainer.style.padding = '10px 20px';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.cursor = 'pointer';
    
    // Добавляем контейнер с ошибкой в DOM
    videoElement.parentNode.appendChild(errorContainer);
    
    // Обработчик нажатия для повторной попытки воспроизведения
    errorContainer.addEventListener('click', () => {
        videoElement.play().catch(err => {
            console.error('Повторная попытка не удалась:', err);
        });
    });
}

// Функция для адаптации видео под его ориентацию
function adaptVideoOrientation(videoElement) {
    if (!videoElement) return;
    
    // Добавляем плавный переход для изменения размеров
    videoElement.style.transition = 'width 0.3s, height 0.3s';
    
    // Применяем стили по умолчанию для вертикального видео (на случай, если не сработает детект по метаданным)
    // Это нужно для телефонов, когда они не могут получить метаданные из-за CORS или других ограничений
    applyVerticalVideoStyles(videoElement);
    
    videoElement.addEventListener('loadedmetadata', function() {
        // Получаем реальные размеры видео
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        
        // Определяем ориентацию
        const isVertical = videoHeight > videoWidth;
        console.log(`Ориентация видео: ${isVertical ? 'вертикальная' : 'горизонтальная'}, размеры: ${videoWidth}x${videoHeight}`);
        
        if (isVertical) {
            applyVerticalVideoStyles(videoElement);
        } else {
            // Горизонтальное видео
            videoElement.style.width = '100%';
            videoElement.style.height = 'auto';
            videoElement.style.maxHeight = 'none';
            
            // Убедимся, что контейнер не имеет рамки
            const parentDiv = videoElement.closest('div');
            if (parentDiv) {
                parentDiv.style.border = 'none';
            }
            
            // Убедимся, что контейнер видеоплеера не имеет рамки
            const videoPlayerContainer = document.querySelector('.video-player-container');
            if (videoPlayerContainer) {
                videoPlayerContainer.style.border = 'none';
                videoPlayerContainer.style.borderRadius = '0';
            }
        }
    });
}

// Отдельная функция для применения стилей вертикального видео
function applyVerticalVideoStyles(videoElement) {
    // Вертикальное видео - делаем его максимально подходящим для мобильных экранов
    videoElement.style.width = '70%';  // Немного уже для лучшего отображения вертикального видео
    videoElement.style.height = 'auto';
    videoElement.style.maxHeight = 'calc(100vh - 200px)'; // Вычитаем примерную высоту навигации и прочих элементов
    videoElement.style.maxWidth = '100%';
            
    // Установка дополнительных стилей для контейнера
    const parentDiv = videoElement.closest('div');
    if (parentDiv) {
        parentDiv.style.display = 'flex';
        parentDiv.style.justifyContent = 'center';
        parentDiv.style.alignItems = 'center';
        parentDiv.style.width = '100%';
        parentDiv.style.height = 'auto';
        parentDiv.style.maxWidth = '100%';
        parentDiv.style.border = 'none';
    }
            
    // Убедимся, что контейнер видеоплеера не имеет рамки
    const videoPlayerContainer = document.querySelector('.video-player-container');
    if (videoPlayerContainer) {
        videoPlayerContainer.style.border = 'none';
        videoPlayerContainer.style.borderRadius = '0';
    }
}

// Функция для отображения видео и его информации
function displayVideo(video) {
    if (!video) {
        // Если видео не найдено, показываем сообщение об ошибке
        document.getElementById('videoNumber').textContent = 'Видео не найдено';
        document.getElementById('videoPlayer').innerHTML = '<p class="error-message">Запрошенное видео не найдено или недоступно.</p>';
        document.getElementById('confirmButton').style.display = 'none';
        return;
    }
    
    const playerContainer = document.getElementById('videoPlayer');
    const videoNumber = document.getElementById('videoNumber');
    
    // Отображаем заголовок видео
    videoNumber.textContent = video.title;
    
    // Проверяем тип ссылки на видео
    if (video.video_url.includes('cloudinary.com')) {
        // Для Cloudinary используем HTML5 video тег напрямую
        playerContainer.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; min-height: 250px; background-color: #000; border: none !important;">
                <video 
                    id="cloudinaryVideo"
                    controls 
                    autoplay 
                    playsinline
                    muted
                    preload="auto"
                    width="100%" 
                    style="display: block; min-height: 250px; max-width: 100%; margin: 0 auto; border: none !important;">
                    <source src="${video.video_url}" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
            </div>
        `;
        
        // Дополнительная проверка воспроизведения и адаптация под ориентацию
        setTimeout(() => {
            const videoElement = document.getElementById('cloudinaryVideo');
            if (videoElement) {
                // Отключаем muted после инициализации для решения проблемы автовоспроизведения
                videoElement.addEventListener('canplay', function() {
                    videoElement.muted = false;
                });
                
                // Обработка воспроизведения и адаптация под ориентацию
                adaptVideoOrientation(videoElement);
                
                // Запускаем воспроизведение
                videoElement.play().catch(error => {
                    console.error('Ошибка воспроизведения видео:', error);
                    handleVideoError(videoElement, 'Ошибка воспроизведения видео. Нажмите для повторной попытки.');
                });
            }
        }, 1000);
    } else if (video.video_url.includes('youtube.com') || video.video_url.includes('vimeo.com')) {
        // Для YouTube и Vimeo используем iframe
        playerContainer.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; min-height: 250px; background-color: #000; border: none !important;">
                <iframe 
                    width="100%" 
                    height="100%"
                    style="display: block; min-height: 250px; border: none !important;"
                    src="${video.video_url}" 
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    } else {
        // Для остальных видео пробуем стандартный HTML5 video тег
        playerContainer.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; min-height: 250px; background-color: #000; border: none !important;">
                <video 
                    id="regularVideo"
                    controls 
                    autoplay 
                    playsinline
                    muted
                    preload="auto"
                    width="100%" 
                    style="display: block; min-height: 250px; max-width: 100%; margin: 0 auto; border: none !important;">
                    <source src="${video.video_url}" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
            </div>
        `;
        
        // Обработка воспроизведения для обычных видео
        setTimeout(() => {
            const videoElement = document.getElementById('regularVideo');
            if (videoElement) {
                // Отключаем muted после инициализации
                videoElement.addEventListener('canplay', function() {
                    videoElement.muted = false;
                });
                
                // Обработка воспроизведения и адаптация под ориентацию
                adaptVideoOrientation(videoElement);
                
                // Запускаем воспроизведение
                videoElement.play().catch(error => {
                    console.error('Ошибка воспроизведения видео:', error);
                    handleVideoError(videoElement, 'Ошибка воспроизведения видео. Нажмите для повторной попытки.');
                });
            }
        }, 1000);
    }
}

// Функция для обработки нажатия на кнопку "Подтвердить"
function setupConfirmButton(video) {
    const confirmButton = document.getElementById('confirmButton');
    
    if (!video) {
        confirmButton.style.display = 'none';
        return;
    }
    
    confirmButton.addEventListener('click', () => {
        // Отправляем данные о выбранном видео обратно в Telegram-бот
        tg.sendData(JSON.stringify({
            selected_video_id: video.id,
            selected_video_title: video.title
        }));
        
        // Закрываем Mini App
        tg.close();
    });
}

// Функция для настройки кнопки "Назад"
function setupBackButton() {
    document.getElementById('backButton').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Функция для инициализации страницы просмотра видео
function initVideoPage() {
    const videoId = getVideoIdFromURL();
    const video = findVideoById(videoId);
    
    displayVideo(video);
    setupConfirmButton(video);
    setupBackButton();
    
    // Дополнительная функция для принудительного удаления рамок
    removeAllBorders();
}

// Функция для принудительного удаления всех рамок
function removeAllBorders() {
    // Ждем немного чтобы DOM успел обновиться
    setTimeout(() => {
        // Удаляем рамки у всех видеоэлементов
        const elements = [
            '.video-player-container',
            '.video-player',
            '.video-player div',
            '.video-player video',
            '.video-player iframe',
            '#videoPlayer',
            '#videoPlayer div',
            '#videoPlayer video',
            '#videoPlayer iframe',
            '#cloudinaryVideo',
            '#regularVideo'
        ];
        
        elements.forEach(selector => {
            const nodeList = document.querySelectorAll(selector);
            nodeList.forEach(element => {
                element.style.border = 'none !important';
                element.style.boxShadow = 'none !important';
                element.style.borderRadius = '0 !important';
                
                // Удаляем класс, который мог бы добавить border
                if (element.classList) {
                    element.classList.remove('selected');
                }
            });
        });
        
    }, 500); // Задержка в 500мс для уверенности
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', initVideoPage); 