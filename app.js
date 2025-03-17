// Инициализация Telegram Mini App
let tg = window.Telegram.WebApp;

// Сообщаем Telegram, что приложение готово
tg.ready();

// Устанавливаем тему и кнопки
tg.expand();

// Функция для создания элементов превью видео
function createVideoPreview(video) {
    const previewElement = document.createElement('div');
    previewElement.className = 'video-preview';
    previewElement.setAttribute('data-id', video.id);
    
    previewElement.innerHTML = `
        <img class="preview-image" src="${video.preview_url}" alt="${video.title}">
        <div class="preview-info">
            <h3 class="preview-title">${video.title}</h3>
        </div>
    `;
    
    // Добавляем обработчик клика для перехода к странице просмотра видео
    previewElement.addEventListener('click', () => {
        window.location.href = `video.html?id=${video.id}`;
    });
    
    return previewElement;
}

// Функция для загрузки и отображения списка видео
function loadVideoList() {
    const videoListElement = document.getElementById('videoList');
    
    // Очищаем список перед загрузкой новых данных
    videoListElement.innerHTML = '';
    
    // Проверяем, есть ли данные в глобальной переменной
    if (typeof videoData !== 'undefined' && Array.isArray(videoData)) {
        // Загружаем из глобальной переменной
        videoData.forEach(video => {
            const previewElement = createVideoPreview(video);
            videoListElement.appendChild(previewElement);
        });
    } 
    else {
        // Если данных нет, показываем сообщение об ошибке
        videoListElement.innerHTML = '<p class="error-message">Ошибка загрузки данных. Пожалуйста, попробуйте позже.</p>';
    }
}

// Загружаем список видео при загрузке страницы
document.addEventListener('DOMContentLoaded', loadVideoList); 