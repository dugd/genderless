# Запуск проекту

## Попередні вимоги

- **Node.js**
- **npm**
- **JSON файл** дерева рішень

## 1. Встановлення залежностей

`npm install`

## 2. Налаштування середовища

Файл .env в корені проекту:

```
FILE_PATH=./assets/tree.json
PORT=8000
```

## 3. Структура файлу дерева рішень

Створіть файл дерева рішень з такою структурою:

```
json{
  "rootId": "n_start",
  "nodes": {
    "n_start": {
      "id": "n_start",
      "label": "Початкове питання",
      "type": "question",
      "question": "Як ви себе відчуваєте?",
      "answers": [
        {
          "id": "a_1",
          "text": "Чоловіком",
          "to": "n_result_male"
        },
        {
          "id": "a_2",
          "text": "Жінкою",
          "to": "n_result_female"
        }
      ]
    },
    "n_result_male": {
      "id": "n_result_male",
      "label": "Чоловічий результат",
      "type": "result",
      "result": "Чоловічий гендер",
      "desc": "Опис результату"
    },
    "n_result_female": {
      "id": "n_result_female",
      "label": "Жіночий результат",
      "type": "result",
      "result": "Жіночий гендер",
      "desc": "Опис результату"
    }
  }
}
```

## 4. Компіляція TypeScript

```
npm run build
```

## 5. Запуск сервера

```
npm run start
```

## Перевірка роботи

- **Головна сторінка**: http://localhost:8000
- **Редактор**: http://localhost:8000/editor
