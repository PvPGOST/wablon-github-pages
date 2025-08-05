#!/usr/bin/env python3
"""
Простой сервер для обработки данных от Inline Web App
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import requests
import urllib.parse

# Токен вашего бота
BOT_TOKEN = "8496910136:AAEoOuBdpzJyE_Cv6pgTvET3JSuEM9nSfWM"

class WebAppHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Обработка GET запросов"""
        if self.path == '/':
            # Главная страница - показываем статус сервера
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            
            html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>🤖 Web App Server</title>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; background: #1a1a1a; color: white; padding: 20px; }
                    .status { background: #2a2a2a; padding: 20px; border-radius: 10px; margin: 20px 0; }
                    .success { color: #4CAF50; }
                    .info { color: #2196F3; }
                </style>
            </head>
            <body>
                <h1>🤖 Telegram Web App Server</h1>
                <div class="status">
                    <h2 class="success">✅ Сервер работает!</h2>
                    <p><strong>Endpoint:</strong> <code>/api/web-app-data</code></p>
                    <p><strong>Метод:</strong> POST</p>
                    <p><strong>Порт:</strong> 8000</p>
                </div>
                
                <div class="status">
                    <h3 class="info">📡 Для работы с Telegram:</h3>
                    <p>1. Установите ngrok: <code>ngrok http 8000</code></p>
                    <p>2. Замените URL в video.js на HTTPS адрес от ngrok</p>
                    <p>3. Обновите GitHub Pages</p>
                </div>
                
                <div class="status">
                    <h3>🔧 Логи:</h3>
                    <p>Смотрите консоль Python для логов запросов</p>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html.encode('utf-8'))
        else:
            self.send_error(404, "Not found")
    
    def do_OPTIONS(self):
        """Обработка CORS preflight запросов"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Обработка POST запросов от Mini App"""
        if self.path == '/api/web-app-data':
            try:
                # Читаем данные от Mini App
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                print("=" * 50)
                print("🔥 ПОЛУЧЕНЫ ДАННЫЕ ОТ MINI APP:")
                print("=" * 50)
                print(f"Data: {json.dumps(data, indent=2, ensure_ascii=False)}")
                
                query_id = data.get('query_id')
                template_data = data.get('template_data', {})
                
                if not query_id:
                    self.send_error(400, "Missing query_id")
                    return
                
                # Формируем ответ для отправки в чат
                video_path = template_data.get('videoPath', 'Не указан')
                display_name = template_data.get('displayName', 'Не указано')
                
                # Вызываем answerWebAppQuery
                self.answer_web_app_query(query_id, video_path, display_name)
                
                # Отправляем успешный ответ
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                response = {"status": "success", "message": "Data processed"}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except Exception as e:
                print(f"❌ Ошибка обработки запроса: {e}")
                self.send_error(500, str(e))
        else:
            self.send_error(404, "Not found")
    
    def answer_web_app_query(self, query_id, video_path, display_name):
        """Отправляем ответ через answerWebAppQuery"""
        try:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/answerWebAppQuery"
            
            # Формируем результат для отправки в чат
            result = {
                "type": "article",
                "id": "selected_template",
                "title": "Выбранный шаблон",
                "description": f"Шаблон: {display_name}",
                "input_message_content": {
                    "message_text": f"✅ Выбран шаблон: {display_name}\n📁 Путь: {video_path}\n\n🔧 Начинаю обработку видео..."
                }
            }
            
            payload = {
                "web_app_query_id": query_id,
                "result": result
            }
            
            print(f"🚀 Отправляем answerWebAppQuery...")
            print(f"URL: {url}")
            print(f"Payload: {json.dumps(payload, indent=2, ensure_ascii=False)}")
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                print("✅ answerWebAppQuery успешно отправлен!")
                print(f"Response: {response.text}")
            else:
                print(f"❌ Ошибка answerWebAppQuery: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Ошибка answerWebAppQuery: {e}")

def run_server(port=8000):
    """Запуск сервера"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, WebAppHandler)
    
    print(f"🚀 Сервер запущен на порту {port}")
    print(f"📡 Endpoint: http://localhost:{port}/api/web-app-data")
    print("Для доступа из Telegram используйте ngrok:")
    print(f"   ngrok http {port}")
    print("Нажмите Ctrl+C для остановки")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Сервер остановлен")

if __name__ == '__main__':
    run_server()