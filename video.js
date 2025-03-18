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
function displayVideo() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('id');
    const videoData = getVideoData(videoId);
    
    if (!videoData) {
        showError('Видео не найдено');
        return;
    }
    
    document.title = videoData.title;
    document.getElementById('videoTitle').textContent = videoData.title;
    document.getElementById('videoDescription').textContent = videoData.description;
    
    const videoContainer = document.getElementById('videoContainer');
    videoContainer.innerHTML = '';
    
    // Убеждаемся, что кнопки имеют правильные стили
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.classList.add('back-button');
    }
    
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.classList.add('next-button');
    }
    
    let isControlsVisible = false;
    let controlsTimeout;
    
    // Функция для управления видимостью элементов управления
    function toggleVideoControls(videoElement) {
        if (isControlsVisible) {
            videoElement.removeAttribute('controls');
            isControlsVisible = false;
        } else {
            videoElement.setAttribute('controls', 'true');
            isControlsVisible = true;
            
            // Автоматически скрываем элементы управления через 5 секунд
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                videoElement.removeAttribute('controls');
                isControlsVisible = false;
            }, 5000);
        }
    }
    
    if (videoData.videoUrl.includes('youtube.com') || videoData.videoUrl.includes('youtu.be')) {
        // Для YouTube видео: добавляем параметры для скрытия элементов управления
        let youtubeUrl = videoData.videoUrl;
        if (youtubeUrl.includes('?')) {
            youtubeUrl += '&controls=0&showinfo=0&rel=0&autoplay=1&mute=1&loop=1';
        } else {
            youtubeUrl += '?controls=0&showinfo=0&rel=0&autoplay=1&mute=1&loop=1';
        }
        
        const iframe = document.createElement('iframe');
        iframe.src = youtubeUrl;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        
        videoContainer.appendChild(iframe);
        
        // Для YouTube используем обертку для обработки кликов
        const iframeWrapper = document.createElement('div');
        iframeWrapper.style.position = 'absolute';
        iframeWrapper.style.top = '0';
        iframeWrapper.style.left = '0';
        iframeWrapper.style.width = '100%';
        iframeWrapper.style.height = '100%';
        iframeWrapper.style.zIndex = '10';
        iframeWrapper.style.cursor = 'pointer';
        
        iframeWrapper.addEventListener('click', function() {
            // Для YouTube нельзя напрямую управлять элементами, но можно отправить сообщение
            try {
                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            } catch (e) {
                console.error('Не удалось управлять YouTube видео:', e);
            }
        });
        
        videoContainer.appendChild(iframeWrapper);
    } else if (videoData.videoUrl.includes('vimeo.com')) {
        // Для Vimeo видео: добавляем параметры для скрытия элементов управления
        let vimeoUrl = videoData.videoUrl;
        if (vimeoUrl.includes('?')) {
            vimeoUrl += '&controls=0&autoplay=1&muted=1&loop=1';
        } else {
            vimeoUrl += '?controls=0&autoplay=1&muted=1&loop=1';
        }
        
        const iframe = document.createElement('iframe');
        iframe.src = vimeoUrl;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        
        videoContainer.appendChild(iframe);
    } else {
        // Для обычных видео (Cloudinary и др.)
        const video = document.createElement('video');
        video.src = videoData.videoUrl;
        video.className = 'video-element';
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        // Не добавляем атрибут controls изначально
        
        // Обработчик клика для отображения/скрытия элементов управления
        video.addEventListener('click', () => {
            toggleVideoControls(video);
        });
        
        // Обработчик двойного клика для полноэкранного режима
        video.addEventListener('dblclick', () => {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }
        });
        
        // Автоматически скрываем курсор при неактивности
        video.addEventListener('mousemove', () => {
            video.style.cursor = 'default';
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                video.style.cursor = 'none';
            }, 3000);
        });
        
        videoContainer.appendChild(video);
        adaptVideoOrientation(video);
        
        // Обработка ошибок загрузки видео
        video.addEventListener('error', function() {
            showError('Не удалось загрузить видео. Пожалуйста, попробуйте позже.');
        });
    }
    
    // Настраиваем кнопки навигации
    setupNavigationButtons(videoId);
    
    // Убираем любые границы у контейнера видео
    removeAllBorders();
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