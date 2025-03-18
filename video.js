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
    
    // Удаляем существующие сообщения об ошибках, если они есть
    const existingErrors = videoElement.parentNode.querySelectorAll('.video-error-message');
    existingErrors.forEach(element => element.remove());
    
    // Добавляем заметное сообщение об ошибке на странице
    const errorContainer = document.createElement('div');
    errorContainer.className = 'video-error-message';
    errorContainer.textContent = errorMessage || 'Нажмите для воспроизведения';
    errorContainer.style.position = 'absolute';
    errorContainer.style.top = '50%';
    errorContainer.style.left = '50%';
    errorContainer.style.transform = 'translate(-50%, -50%)';
    errorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    errorContainer.style.color = '#fff';
    errorContainer.style.padding = '10px 20px';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.cursor = 'pointer';
    errorContainer.style.zIndex = '100';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.maxWidth = '80%';
    
    // Добавляем контейнер с ошибкой в DOM
    videoElement.parentNode.appendChild(errorContainer);
    
    // Обработчик нажатия для повторной попытки воспроизведения
    errorContainer.addEventListener('click', () => {
        // Убеждаемся, что видео muted для автовоспроизведения
        videoElement.muted = true;
        
        // Затем пробуем воспроизвести
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Воспроизведение после клика началось успешно');
                // Удаляем сообщение об ошибке
                errorContainer.remove();
                
                // Больше не возвращаем звук, как просил пользователь
            }).catch(err => {
                console.error('Повторная попытка не удалась:', err);
                errorContainer.textContent = 'Не удалось запустить видео. Попробуйте еще раз.';
            });
        }
    });
    
    // Добавляем обработчик клика на само видео
    videoElement.addEventListener('click', () => {
        if (videoElement.paused) {
            videoElement.play().then(() => {
                // Удаляем сообщение об ошибке
                const errors = videoElement.parentNode.querySelectorAll('.video-error-message');
                errors.forEach(element => element.remove());
            }).catch(e => console.error('Ошибка при клике на видео:', e));
        }
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
        // Для Cloudinary используем HTML5 video тег, добавляем controls для управления
        playerContainer.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; min-height: 250px; background-color: #000; border: none !important;">
                <video 
                    id="cloudinaryVideo"
                    controls
                    playsinline
                    muted
                    loop
                    preload="auto"
                    width="100%" 
                    style="display: block; min-height: 250px; max-width: 100%; margin: 0 auto; border: none !important;">
                    <source src="${video.video_url}" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
            </div>
        `;
        
        // Обработка видео
        const videoElement = document.getElementById('cloudinaryVideo');
        if (videoElement) {
            // Обработка воспроизведения и адаптация под ориентацию
            adaptVideoOrientation(videoElement);
            
            // Запускаем воспроизведение один раз
            videoElement.play().catch(error => {
                console.error('Ошибка автовоспроизведения:', error);
                handleVideoError(videoElement, 'Нажмите на видео для воспроизведения');
            });
            
            // Упрощаем обработчик клика на видео
            let isVideoClicked = false;
            
            videoElement.addEventListener('click', function(e) {
                // Не делаем ничего при клике, пусть браузер сам обрабатывает клики
                // на элементах управления через стандартный интерфейс controls
                
                // Помечаем, что был клик для обработчика двойного клика
                isVideoClicked = true;
                setTimeout(() => { isVideoClicked = false; }, 300);
            });
            
            // Добавляем функционал полноэкранного режима по двойному клику
            setupFullscreenOnDoubleClick(videoElement);
        }
    } else if (video.video_url.includes('youtube.com') || video.video_url.includes('vimeo.com')) {
        // Для YouTube и Vimeo используем iframe с автовоспроизведением
        // Для этих платформ оставляем controls=1, чтобы пользователь мог взаимодействовать
        let videoSrc = video.video_url;
        if (videoSrc.includes('youtube.com')) {
            // Для YouTube
            if (videoSrc.includes('?')) {
                videoSrc += '&autoplay=1&mute=1&loop=1&controls=1';
            } else {
                videoSrc += '?autoplay=1&mute=1&loop=1&controls=1';
            }
        } else if (videoSrc.includes('vimeo.com')) {
            // Для Vimeo
            if (videoSrc.includes('?')) {
                videoSrc += '&autoplay=1&muted=1&loop=1&controls=1';
            } else {
                videoSrc += '?autoplay=1&muted=1&loop=1&controls=1';
            }
        }
        
        playerContainer.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; min-height: 250px; background-color: #000; border: none !important;">
                <iframe 
                    id="iframeVideo"
                    width="100%" 
                    height="100%"
                    style="display: block; min-height: 250px; border: none !important;"
                    src="${videoSrc}" 
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
        
        // Для iframe нужна особая обработка полноэкранного режима
        const iframeElement = document.getElementById('iframeVideo');
        if (iframeElement) {
            // Добавляем наложение для двойного клика
            const overlayDiv = document.createElement('div');
            overlayDiv.style.position = 'absolute';
            overlayDiv.style.top = '0';
            overlayDiv.style.left = '0';
            overlayDiv.style.width = '100%';
            overlayDiv.style.height = '100%';
            overlayDiv.style.zIndex = '10';
            overlayDiv.style.cursor = 'pointer';
            
            iframeElement.parentNode.appendChild(overlayDiv);
            
            // Обработчик двойного клика для iframe
            setupFullscreenOnDoubleClick(overlayDiv, iframeElement);
        }
    } else {
        // Для остальных видео пробуем стандартный HTML5 video тег
        playerContainer.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; min-height: 250px; background-color: #000; border: none !important;">
                <video 
                    id="regularVideo"
                    controls
                    playsinline
                    muted
                    loop
                    preload="auto"
                    width="100%" 
                    style="display: block; min-height: 250px; max-width: 100%; margin: 0 auto; border: none !important;">
                    <source src="${video.video_url}" type="video/mp4">
                    Ваш браузер не поддерживает видео.
                </video>
            </div>
        `;
        
        // Обработка видео
        const videoElement = document.getElementById('regularVideo');
        if (videoElement) {
            // Обработка воспроизведения и адаптация под ориентацию
            adaptVideoOrientation(videoElement);
            
            // Запускаем воспроизведение один раз
            videoElement.play().catch(error => {
                console.error('Ошибка автовоспроизведения:', error);
                handleVideoError(videoElement, 'Нажмите на видео для воспроизведения');
            });
            
            // Упрощаем обработчик клика на видео
            let isVideoClicked = false;
            
            videoElement.addEventListener('click', function(e) {
                // Не делаем ничего при клике, пусть браузер сам обрабатывает клики
                // на элементах управления через стандартный интерфейс controls
                
                // Помечаем, что был клик для обработчика двойного клика
                isVideoClicked = true;
                setTimeout(() => { isVideoClicked = false; }, 300);
            });
            
            // Добавляем функционал полноэкранного режима по двойному клику
            setupFullscreenOnDoubleClick(videoElement);
        }
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
    
    // Активируем аудио контекст браузера для лучшего воспроизведения
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const audioCtx = new AudioContext();
        }
    } catch (e) {
        console.error('Ошибка при инициализации AudioContext:', e);
    }
    
    // Основные функции инициализации
    displayVideo(video);
    setupConfirmButton(video);
    setupBackButton();
    
    // Настройка кнопки "Следующее"
    setupNextButton(video);
    
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

// Функция для настройки кнопки "Следующее"
function setupNextButton(currentVideo) {
    const nextButton = document.getElementById('nextButton');
    if (!nextButton) return;
    
    nextButton.addEventListener('click', function() {
        // Находим следующее видео
        const nextVideo = findNextVideo(currentVideo);
        if (nextVideo) {
            // Переходим на страницу с следующим видео
            window.location.href = `video.html?id=${nextVideo.id}`;
        } else {
            console.log('Это последнее видео в списке');
            // Можно добавить визуальное оповещение, что это последнее видео
            nextButton.style.opacity = '0.5';
            nextButton.style.cursor = 'default';
            
            // Возвращаем нормальный стиль через секунду
            setTimeout(() => {
                nextButton.style.opacity = '';
                nextButton.style.cursor = '';
            }, 1000);
        }
    });
}

// Функция для поиска следующего видео
function findNextVideo(currentVideo) {
    if (!currentVideo || typeof videoData === 'undefined' || !Array.isArray(videoData)) {
        return null;
    }
    
    // Находим индекс текущего видео
    const currentIndex = videoData.findIndex(video => video.id === currentVideo.id);
    
    // Если нашли и это не последнее видео, возвращаем следующее
    if (currentIndex !== -1 && currentIndex < videoData.length - 1) {
        return videoData[currentIndex + 1];
    }
    
    // Если это последнее видео, можно вернуть первое для зацикливания
    if (currentIndex === videoData.length - 1) {
        return videoData[0];
    }
    
    return null;
}

// Функция настройки полноэкранного режима по двойному клику
function setupFullscreenOnDoubleClick(element, targetElement) {
    // Если targetElement не передан, используем сам element
    const fullscreenTarget = targetElement || element;
    
    // Переменная для отслеживания двойного клика
    let lastClickTime = 0;
    const doubleClickDelay = 300; // мс
    
    element.addEventListener('dblclick', function(e) {
        // Переключаем полноэкранный режим при двойном клике
        toggleFullScreen(fullscreenTarget);
        e.preventDefault();
        e.stopPropagation(); // Предотвращаем всплытие события
    });
}

// Функция для переключения полноэкранного режима
function toggleFullScreen(element) {
    if (!document.fullscreenElement && 
        !document.mozFullScreenElement && 
        !document.webkitFullscreenElement && 
        !document.msFullscreenElement) {
        // Переходим в полноэкранный режим
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        // Выходим из полноэкранного режима
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', initVideoPage); 