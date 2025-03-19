// Инициализация Telegram Mini App
let tg = window.Telegram.WebApp;

// Сообщаем Telegram, что приложение готово
tg.ready();

// Устанавливаем тему и кнопки
tg.expand();

// Запускаем всё после того как документ загрузится
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем информацию для отладки
    console.log('============= НАЧАЛО ИНИЦИАЛИЗАЦИИ =============');
    console.log('DOM полностью загружен');
    
    // Проверяем, что переменная videoData существует
    if (typeof videoData === 'undefined' || !Array.isArray(videoData)) {
        console.error('ОШИБКА: videoData не найден или не является массивом');
        alert('Ошибка загрузки данных о видео. Перезагрузите страницу или обратитесь к администратору.');
        return;
    }
    
    console.log('videoData доступен:', videoData);
    
    // Получаем ID видео из URL
    const videoId = getVideoIdFromURL();
    console.log('ID видео из URL:', videoId);
    
    if (!videoId) {
        console.error('ОШИБКА: ID видео не найден в URL');
        showError('ID видео не указан в URL');
        return;
    }
    
    // Находим видео по ID
    const video = findVideoById(videoId);
    console.log('Найденное видео:', video);
    
    if (!video) {
        console.error('ОШИБКА: Видео с ID ' + videoId + ' не найдено');
        showError('Видео не найдено');
        return;
    }
    
    // Устанавливаем заголовок и описание
    document.title = video.title;
    document.getElementById('videoTitle').textContent = video.title || 'Без названия';
    document.getElementById('videoDescription').textContent = video.description || '';
    
    // Отображаем видео
    try {
        displayVideo(video);
        console.log('Видео успешно отображено');
    } catch (error) {
        console.error('ОШИБКА при отображении видео:', error);
        showError('Ошибка при отображении видео: ' + error.message);
        return;
    }
    
    // Настраиваем кнопки навигации
    try {
        setupBackButton();
        console.log('Кнопка "Назад" настроена');
    } catch (error) {
        console.error('ОШИБКА при настройке кнопки "Назад":', error);
    }
    
    try {
        setupNextButton(video);
        console.log('Кнопка "Следующее" настроена');
    } catch (error) {
        console.error('ОШИБКА при настройке кнопки "Следующее":', error);
    }
    
    try {
        setupConfirmButton(video);
        console.log('Кнопка "ВЫБРАТЬ ШАБЛОН" настроена');
    } catch (error) {
        console.error('ОШИБКА при настройке кнопки подтверждения:', error);
    }
    
    try {
        setupLikeButton(video);
        console.log('Кнопка лайка настроена');
    } catch (error) {
        console.error('ОШИБКА при настройке кнопки лайка:', error);
    }
    
    // Удаляем все рамки
    removeAllBorders();
    
    console.log('============= ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА =============');
});

// Получаем id видео из URL параметров
function getVideoIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Функция для поиска видео по id в массиве данных
function findVideoById(id) {
    if (typeof videoData === 'undefined' || !Array.isArray(videoData)) {
        console.error('videoData не найден или не является массивом');
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
    console.error('Ошибка:', message);
}

// Функция для отображения видео и его информации
function displayVideo(video) {
    if (!video) {
        showError('Видео не найдено');
        return;
    }
    
    const videoContainer = document.getElementById('videoContainer');
    if (!videoContainer) {
        console.error('Элемент с ID "videoContainer" не найден');
        return;
    }
    
    videoContainer.innerHTML = '';
    
    console.log('Отображаем видео:', video.title);
    console.log('URL видео:', video.video_url);
    
    if (video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be')) {
        // Для YouTube видео
        console.log('Тип видео: YouTube');
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
                style="min-height: 250px; border: none !important;" 
                src="${youtubeUrl}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else if (video.video_url.includes('vimeo.com')) {
        // Для Vimeo видео
        console.log('Тип видео: Vimeo');
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
                style="min-height: 250px; border: none !important;" 
                src="${vimeoUrl}" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        // Для обычных видео (Cloudinary и др.)
        console.log('Тип видео: Обычное (Cloudinary или другое)');
        videoContainer.innerHTML = `
            <video 
                id="videoElement"
                autoplay 
                muted 
                loop 
                playsinline
                style="width: 100%; min-height: 250px; border: none !important; background-color: #000;">
                <source src="${video.video_url}" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
        `;
        
        const videoElement = document.getElementById('videoElement');
        if (videoElement) {
            // Добавляем обработчики событий для видео
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
            
            videoElement.addEventListener('error', function(e) {
                console.error('Ошибка загрузки видео:', e);
                showError('Не удалось загрузить видео. Пожалуйста, попробуйте позже.');
            });
        }
    }
}

// Функция для настройки кнопки "Назад"
function setupBackButton() {
    const backButton = document.getElementById('backButton');
    if (!backButton) {
        console.error('Элемент с ID "backButton" не найден');
        return;
    }
    
    backButton.addEventListener('click', function() {
        console.log('Кнопка "Назад" нажата');
        window.location.href = 'index.html';
    });
}

// Функция для настройки кнопки "Следующее"
function setupNextButton(currentVideo) {
    const nextButton = document.getElementById('nextButton');
    if (!nextButton) {
        console.error('Элемент с ID "nextButton" не найден');
        return;
    }
    
    nextButton.addEventListener('click', function() {
        console.log('Кнопка "Следующее" нажата');
        if (!currentVideo) {
            console.error('Текущее видео не определено');
            return;
        }
        
        // Находим следующее видео
        const currentIndex = videoData.findIndex(v => v.id === currentVideo.id);
        
        if (currentIndex === -1) {
            console.error('Текущее видео не найдено в списке');
            return;
        }
        
        const nextIndex = (currentIndex + 1) % videoData.length;
        const nextVideo = videoData[nextIndex];
        
        console.log(`Переходим к следующему видео: ${nextVideo.id} (${nextVideo.title})`);
        window.location.href = `video.html?id=${nextVideo.id}`;
    });
}

// Функция для настройки кнопки "Подтвердить"
function setupConfirmButton(video) {
    const confirmButton = document.getElementById('confirmButton');
    if (!confirmButton) {
        console.error('Элемент с ID "confirmButton" не найден');
        return;
    }
    
    if (!video) {
        confirmButton.style.display = 'none';
        return;
    }
    
    confirmButton.addEventListener('click', function() {
        console.log('Кнопка "ВЫБРАТЬ ШАБЛОН" нажата');
        
        // Извлекаем числовой ID из строки (например, из "video1" получаем "1")
        const numericId = video.id.replace(/[^\d]/g, '');
        
        // Формируем имя файла в точном соответствии с ожиданиями бота
        const videoFileName = `template_${numericId}.mp4`;
        
        // Готовим данные для отправки в Telegram в точном формате, который ожидает бот
        const dataToSend = {
            action: "process_video", // Первое поле, которое ожидает бот
            videoFile: videoFileName, // Имя файла как "template_4.mp4"
            videoId: numericId, // Только числовой ID
            videoName: video.title, // Название для отображения
            timestamp: Date.now() // Числовой timestamp в миллисекундах
        };
        
        // Логируем отправляемые данные для отладки
        console.log('Данные для отправки в бот:', dataToSend);
        console.log('JSON строка для бота:', JSON.stringify(dataToSend));
        
        try {
            // Отправляем данные в Telegram
            tg.sendData(JSON.stringify(dataToSend));
            
            console.log('Данные успешно отправлены в Telegram');
            
            // Показываем уведомление пользователю
            const notificationElement = document.createElement('div');
            notificationElement.className = 'success-notification';
            notificationElement.textContent = 'Шаблон выбран! Видео обрабатывается...';
            notificationElement.style.position = 'fixed';
            notificationElement.style.bottom = '20px';
            notificationElement.style.left = '50%';
            notificationElement.style.transform = 'translateX(-50%)';
            notificationElement.style.backgroundColor = 'rgba(0, 128, 0, 0.8)';
            notificationElement.style.color = 'white';
            notificationElement.style.padding = '10px 20px';
            notificationElement.style.borderRadius = '5px';
            notificationElement.style.zIndex = '1000';
            
            document.body.appendChild(notificationElement);
            
            // Показываем статус обработки
            setTimeout(() => {
                notificationElement.textContent = 'Обработка видео...';
            }, 1000);
            
            // Удаляем уведомление через 2 секунды
            setTimeout(() => {
                notificationElement.style.opacity = '0';
                notificationElement.style.transition = 'opacity 0.5s';
                setTimeout(() => document.body.removeChild(notificationElement), 500);
                
                // Закрываем Mini App
                tg.close();
            }, 2000);
            
        } catch (error) {
            console.error('Ошибка при выборе шаблона:', error);
            alert('Ошибка при выборе шаблона. Пожалуйста, попробуйте еще раз.');
        }
    });
}

// Функция для настройки кнопки лайка
function setupLikeButton(video) {
    const likeButton = document.getElementById('likeButton');
    const likeCount = document.getElementById('likeCount');
    
    if (!likeButton || !likeCount || !video) {
        console.error('Элементы лайка не найдены или видео не определено');
        return;
    }
    
    // Устанавливаем начальное значение счетчика
    likeCount.textContent = video.likes || 0;
    
    // Проверяем, поставил ли пользователь лайк этому видео ранее
    if (typeof isVideoLiked === 'function' && isVideoLiked(video.id)) {
        likeButton.classList.add('active');
    } else {
        likeButton.classList.remove('active');
    }
    
    // Добавляем обработчик клика
    likeButton.addEventListener('click', function() {
        console.log('Кнопка лайка нажата для видео:', video.id);
        
        // Меняем состояние лайка
        if (typeof toggleVideoLike === 'function') {
            const isLiked = toggleVideoLike(video.id);
            
            // Обновляем визуальное состояние
            if (isLiked) {
                likeButton.classList.add('active');
            } else {
                likeButton.classList.remove('active');
            }
            
            // Обновляем счетчик
            likeCount.textContent = video.likes || 0;
        }
    });
}

// Функция для принудительного удаления всех рамок
function removeAllBorders() {
    const elements = document.querySelectorAll('video, iframe, .video-player, .video-player-container');
    elements.forEach(element => {
        element.style.border = 'none';
        element.style.boxShadow = 'none';
        element.style.outline = 'none';
    });
} 