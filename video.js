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

// Функция для отображения видео и его информации
function displayVideo(video) {
    if (!video) {
        // Если видео не найдено, показываем сообщение об ошибке
        document.getElementById('videoNumber').textContent = 'Видео не найдено';
        document.getElementById('videoPlayer').innerHTML = '<p class="error-message">Запрошенное видео не найдено или недоступно.</p>';
        document.getElementById('confirmButton').style.display = 'none';
        return;
    }
    
    // Устанавливаем номер видео
    document.getElementById('videoNumber').textContent = `Номер ${video.id.replace('video', '')}`;
    
    // Отображаем плеер видео в зависимости от типа URL
    const videoPlayerElement = document.getElementById('videoPlayer');
    
    if (video.video_url.includes('youtube.com/embed')) {
        // YouTube видео
        videoPlayerElement.innerHTML = `
            <iframe 
                src="${video.video_url}?autoplay=1" 
                allowfullscreen>
            </iframe>
        `;
    } else if (video.video_url.includes('player.vimeo.com')) {
        // Vimeo видео
        videoPlayerElement.innerHTML = `
            <iframe 
                src="${video.video_url}?autoplay=1" 
                allowfullscreen>
            </iframe>
        `;
    } else if (video.video_url.endsWith('.mp4') || video.video_url.endsWith('.webm') || video.video_url.endsWith('.ogg')) {
        // HTML5 видео
        videoPlayerElement.innerHTML = `
            <video autoplay controls>
                <source src="${video.video_url}" type="video/${video.video_url.split('.').pop()}">
                Ваш браузер не поддерживает видео.
            </video>
        `;
    } else {
        // Другие типы видео или непредвиденный формат
        videoPlayerElement.innerHTML = `
            <iframe 
                src="${video.video_url}" 
                allowfullscreen>
            </iframe>
        `;
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