# Home Finance

Особистий фінансовий помічник: бюджет на місяць, витрати за категоріями, продукти і ціни, комуналка з лічильниками, побутова хімія, накопичення, плани і кухня-бот, який рахує БЖУ на порцію та дає поради з економії.

## Як увімкнути вхід за поштою (один раз)
1. Firebase Console → проєкт **home-finance-c6bb8** → **Authentication** → **Sign-in method** → увімкнути **Email/Password**.
2. **Authentication → Settings → Authorized domains** → додати `anastasiakocubenko39-crypto.github.io`.
3. **Firestore Database → Rules** → вставити вміст файлу `firestore.rules` → **Publish**.

Після цього кожен користувач має власний акаунт і бачить лише свої дані (`users/{uid}/...`).
Кнопка «Спробувати без реєстрації» відкриває демо-режим, де дані зберігаються лише в браузері.

Структура: `index.html`, `app/app.js` (інтерфейс), `app/store.js` (вхід і дані), `app/bot.js` (бот), `app/nutrition-db.js` (БЖУ ~480 продуктів), `app/style.css`.
