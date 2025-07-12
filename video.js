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
    document.getElementById('videoDescription').textContent = video.description || '';
    
    // Отображаем видео
    displayVideo(video);
    
    // Настраиваем кнопки навигации
    setupBackButton();
    setupNextButton(video);
    setupConfirmButton(video);
});

// Получаем id видео из URL параметров
function getVideoIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
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
                style="min-height: 250px; border: none !important;" 
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
                style="min-height: 250px; border: none !important;" 
                src="${vimeoUrl}" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        // Для обычных видео (Cloudinary и др.)
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
                showError('Не удалось загрузить видео. Пожалуйста, попробуйте позже.');
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
        window.location.href = 'index.html';
    });
}

// Функция для настройки кнопки "Следующее"
function setupNextButton(currentVideo) {
    const nextButton = document.getElementById('nextButton');
    if (!nextButton) {
        return;
    }
    
    nextButton.addEventListener('click', function() {
        if (!currentVideo) {
            return;
        }
        
        // Находим следующее видео
        const currentIndex = videoData.findIndex(v => v.id === currentVideo.id);
        
        if (currentIndex === -1) {
            return;
        }
        
        const nextIndex = (currentIndex + 1) % videoData.length;
        const nextVideo = videoData[nextIndex];
        
        window.location.href = `video.html?id=${nextVideo.id}`;
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
            // Извлекаем числовой ID из строки
            const numericId = video.id.replace(/[^\d]/g, '');
            
            // Формируем имя файла
            const videoFileName = `template_${numericId}.mp4`;
            
            // Данные для отправки
            const dataToSend = {
                action: "process_video",
                videoName: videoFileName
            };
            
            // Отправляем данные в Telegram
            if (window.Telegram && window.Telegram.WebApp) {
                localStorage.setItem('lastSentData', JSON.stringify(dataToSend));
                
                const jsonData = JSON.stringify(dataToSend);
                
                // Отправляем данные
                window.Telegram.WebApp.sendData(jsonData);
                
                // Обновляем уведомление
                notificationElement.textContent = 'Шаблон отправлен на обработку!';
                notificationElement.style.backgroundColor = 'rgba(0, 128, 0, 0.9)';
                
                // Показываем сообщение Telegram
                window.Telegram.WebApp.showPopup({
                    title: "Шаблон выбран",
                    message: `Шаблон "${videoFileName}" отправлен на обработку!`,
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