# GidOman whatsapp web service

Сервис для отправки шаблонных WhatsApp-сообщений (напоминалок) через WhatsApp Business API (Wazzup) с интеграцией Google Sheets  

## Основные возможности

- Отправка шаблонных сообщений.
- Поддержка изображений через публичные ссылки.
- Интеграция с Google Sheets.

## Технологии

- Node.js
- Axios
- Google APIs (Google Sheets)
- .env для конфигов

## Как запускать

1. Склонировать проект (репозиторий приватный).
2. Установить зависимости:
   npm install

## Пример как заполинть env файл

- API_URL — адрес WhatsApp API
- WABA_API_KEY — токен авторизации WABA
- CHANNEL_ID - id канала (для Wazzup)
- MESSAGE_TEMPLATE_ID — ID шаблона для текста
- MESSAGE_IMAGE_TEMPLATE_ID — ID шаблона для сообщений с медиа
- GOOGLE_SHEET_ID — ID Google Sheets