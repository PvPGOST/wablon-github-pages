// Stagewise Toolbar Initialization
// Для vanilla HTML/JS проектов используем CDN или автоматическую установку
async function initStagewise() {
  // Проверяем, что мы в development режиме (localhost или file://)
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.protocol === 'file:';
  
  if (isDevelopment) {
    try {
      // Попытка загрузки через локальный модуль
      const { initToolbar } = await import('./node_modules/@stagewise/toolbar/dist/index.es.js');
      
      initToolbar({
        plugins: [],
      });
      console.log('Stagewise toolbar инициализирован');
    } catch (error) {
      console.error('Ошибка инициализации Stagewise toolbar:', error);
      console.log('Используйте команду setupToolbar из расширения Cursor для автоматической настройки');
    }
  }
}

// Инициализируем toolbar при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStagewise);
} else {
  initStagewise();
} 