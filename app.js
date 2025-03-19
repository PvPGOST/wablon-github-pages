// Инициализация Telegram Mini App
let tg = window.Telegram.WebApp;

// Сообщаем Telegram, что приложение готово
tg.ready();

// Устанавливаем тему и кнопки
tg.expand();

// Переменная для хранения выбранного видео
let selectedVideoId = null;

// Функция для создания элементов превью видео
function createVideoPreview(video) {
    const previewElement = document.createElement('div');
    previewElement.className = 'video-preview';
    previewElement.setAttribute('data-id', video.id);
    
    // Добавляем основное содержимое превью
    previewElement.innerHTML = `
        <img class="preview-image" src="${video.preview_url}" alt="${video.title}">
        <div class="preview-likes-container">
            <span class="preview-like-icon">❤</span>
            <span class="preview-like-count">${video.likes || 0}</span>
        </div>
    `;
    
    // Убираем все дополнительные инлайн-стили
    previewElement.style.cssText = '';
    
    // Проверяем, поставил ли пользователь лайк этому видео
    if (typeof isVideoLiked === 'function' && isVideoLiked(video.id)) {
        previewElement.querySelector('.preview-like-icon').style.color = '#ff0000';
    }
    
    // Добавляем обработчик клика для перехода к странице просмотра видео
    previewElement.addEventListener('click', () => {
        // Сначала убираем класс 'selected' у всех элементов
        document.querySelectorAll('.video-preview').forEach(el => el.classList.remove('selected'));
        
        // Добавляем класс 'selected' только выбранному элементу
        previewElement.classList.add('selected');
        
        // Сохраняем ID выбранного видео в localStorage
        localStorage.setItem('selectedVideoId', video.id);
        
        // Переходим на страницу видео
        window.location.href = `video.html?id=${video.id}`;
    });
    
    return previewElement;
}

// Функция для загрузки и отображения сетки видео
function loadVideoGrid() {
    const videoGridElement = document.getElementById('videoGrid');
    
    // Очищаем сетку перед загрузкой новых данных
    videoGridElement.innerHTML = '';
    
    // Проверяем, есть ли данные в глобальной переменной
    if (typeof videoData !== 'undefined' && Array.isArray(videoData)) {
        // Загружаем из глобальной переменной
        videoData.forEach(video => {
            const previewElement = createVideoPreview(video);
            videoGridElement.appendChild(previewElement);
        });
    } 
    else {
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
            // Если ничего не выбрано, можно показать сообщение или просто ничего не делать
            alert('Пожалуйста, выберите шаблон');
        }
    });
}

// Загружаем сетку видео и настраиваем кнопку при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadVideoGrid();
    setupConfirmButton();
}); 