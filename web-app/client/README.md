### Как создать новую форму для настройки алгоритма

1. Создай файл формы в `./src/components/configure-algorithm/forms`
2. Добавь пресеты в `./src/constants/presets`, обязательно включи пресет `default` в конец `common` пресетов
3. Напиши форму по примеру других форм
4. Добавь компонент формы в `./src/components/configure-algorithm/forms/index.tsx`
5. Подключи компонент формы в `./src/pages/create-task/configure-algorithm.tsx` и добавь форму в список форм