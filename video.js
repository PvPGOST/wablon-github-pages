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
    
    videoElement.addEventListener('loadedmetadata', function() {
        // Получаем реальные размеры видео
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        
        // Определяем ориентацию
        const isVertical = videoHeight > videoWidth;
        console.log(`Ориентация видео: ${isVertical ? 'вертикальная' : 'горизонтальная'}, размеры: ${videoWidth}x${videoHeight}`);
        
        if (isVertical) {
            // Вертикальное видео
            videoElement.style.width = 'auto';
            videoElement.style.height = 'auto';
            videoElement.style.maxHeight = '80vh';
            videoElement.style.maxWidth = '90%';
            
            // Центрируем видео
            if (videoElement.parentNode) {
                videoElement.parentNode.style.display = 'flex';
                videoElement.parentNode.style.justifyContent = 'center';
                videoElement.parentNode.style.alignItems = 'center';
            }
        } else {
            // Горизонтальное видео
            videoElement.style.width = '100%';
            videoElement.style.height = 'auto';
            videoElement.style.maxHeight = 'none';
        }
    });
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
            <div style="position: relative; width: 100%; height: 100%; min-height: 250px; background-color: #000;">
                <video 
                    id="cloudinaryVideo"
                    controls 
                    autoplay 
                    playsinline
                    muted
                    preload="auto"
                    width="100%" 
                    style="display: block; min-height: 250px; max-width: 100%; margin: 0 auto;">
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
            <div style="position: relative; width: 100%; height: 100%; min-height: 250px; background-color: #000;">
                <iframe 
                    width="100%" 
                    height="100%"
                    style="display: block; min-height: 250px;"
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
            <div style="position: relative; width: 100%; height: 100%; min-height: 250px; background-color: #000;">
                <video 
                    id="regularVideo"
                    controls 
                    autoplay 
                    playsinline
                    muted
                    preload="auto"
                    width="100%" 
                    style="display: block; min-height: 250px; max-width: 100%; margin: 0 auto;">
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

// Функция инициализации страницы просмотра видео
function initVideoPage() {
    const videoId = getVideoIdFromURL();
    const video = findVideoById(videoId);
    
    displayVideo(video);
    setupConfirmButton(video);
    setupBackButton();
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', initVideoPage); 