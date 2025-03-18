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
    
    const playerContainer = document.getElementById('videoPlayer');
    const videoNumber = document.getElementById('videoNumber');
    
    // Отображаем заголовок видео
    videoNumber.textContent = video.title;
    
    // Проверяем тип ссылки на видео
    if (video.video_url.includes('cloudinary.com')) {
        // Для Cloudinary можно использовать два варианта
        // 1. HTML5 video тег (может не работать из-за CORS)
        /*
        playerContainer.innerHTML = `
            <video 
                controls 
                autoplay 
                playsinline
                width="100%" 
                height="100%">
                <source src="${video.video_url}" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
        `;
        */
        
        // 2. iframe (более надежный вариант)
        // Преобразуем URL для iframe-встраивания
        const videoId = video.video_url.split('/').pop().split('.')[0];
        const cloudName = video.video_url.split('/')[3];
        const embedUrl = `https://player.cloudinary.com/${cloudName}/video/upload/v1711066740694/${videoId}.mp4`;
        
        playerContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="${embedUrl}" 
                allowfullscreen
                allow="autoplay">
            </iframe>
        `;
    } else if (video.video_url.includes('youtube.com') || video.video_url.includes('vimeo.com')) {
        // Для YouTube и Vimeo используем iframe
        playerContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="${video.video_url}" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        // Для остальных видео пробуем стандартный HTML5 video тег
        playerContainer.innerHTML = `
            <video 
                controls 
                autoplay 
                playsinline
                width="100%" 
                height="100%">
                <source src="${video.video_url}" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
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