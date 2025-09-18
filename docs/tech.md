# Технічна документація

## Технологічний стек

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: EJS шаблони, CSS
- **Безпека**: CSRF захист, Helmet middleware
- **Зберігання даних**: JSON файли локально
- **Архітектура**: Clean Architecture з поділом на домени

## Структура програми

```
src/
├── domain/           # Бізнес-логіка та типи
├── services/         # Сервіси проекту
├── routes/          # HTTP роути
├── views/           # EJS шаблони
├── middlewares.ts   # Express middleware
└── server.ts        # Точка старту
```

## Ключові компоненти

**Доменна модель:**

- `DecisionTree` - структура дерева рішень
- `TreeNode` - вузли дерева (питання та результати)
- `TreeContext` – контекст поточного стану проходження

**Сервіси:**

- `InferenceService` - логіка навігації по дереву
- `TreeEditor` – редагування структури дерева
- `SessionFacade` - управління сесіями користувача
- `DecisionTrace` - відстеження історії рішень
