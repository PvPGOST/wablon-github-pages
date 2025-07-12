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

// Переменная для хранения выбранного видео
let selectedVideoId = null;
let currentCategory = 'all';

// Функция для создания элементов превью видео
function createVideoPreview(video) {
    const previewElement = document.createElement('div');
    previewElement.className = 'video-preview';
    previewElement.setAttribute('data-id', video.id);
    
    // Добавляем основное содержимое превью без лайков
    previewElement.innerHTML = `
        <img class="preview-image" src="${video.preview_url}" alt="${video.title}">
        <div class="preview-info">
            <h3 class="preview-title">${video.title}</h3>
            <p class="preview-description">${video.description}</p>
        </div>
    `;
    
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

// Функция для создания кнопок категорий
function createCategoryButtons() {
    const categoriesContainer = document.getElementById('categories');
    
    // Очищаем контейнер
    categoriesContainer.innerHTML = '';
    
    // Создаем кнопки для каждой категории
    Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];
        const button = document.createElement('button');
        button.className = 'category-button';
        button.setAttribute('data-category', categoryKey);
        
        if (categoryKey === currentCategory) {
            button.classList.add('active');
        }
        
        button.innerHTML = `
            <span class="icon">${category.icon}</span>
            <span>${category.name}</span>
        `;
        
        button.addEventListener('click', () => {
            switchCategory(categoryKey);
        });
        
        categoriesContainer.appendChild(button);
    });
}

// Функция для переключения категории
function switchCategory(categoryKey) {
    currentCategory = categoryKey;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${categoryKey}"]`).classList.add('active');
    
    // Перезагружаем видео для новой категории
    loadVideoGrid();
}

// Функция для загрузки и отображения сетки видео
function loadVideoGrid() {
    const videoGridElement = document.getElementById('videoGrid');
    
    // Очищаем сетку перед загрузкой новых данных
    videoGridElement.innerHTML = '';
    
    // Проверяем, есть ли данные в глобальной переменной
    if (typeof videoData !== 'undefined' && Array.isArray(videoData)) {
        // Получаем видео для текущей категории
        const videosToShow = getVideosByCategory(currentCategory);
        
        if (videosToShow.length === 0) {
            videoGridElement.innerHTML = '<p class="no-videos">В этой категории пока нет видео</p>';
            return;
        }
        
        // Загружаем видео для текущей категории
        videosToShow.forEach(video => {
            const previewElement = createVideoPreview(video);
            videoGridElement.appendChild(previewElement);
        });
    } else {
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
            alert('Пожалуйста, выберите шаблон');
        }
    });
}

// Загружаем категории и сетку видео при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    createCategoryButtons();
    loadVideoGrid();
    setupConfirmButton();
}); 