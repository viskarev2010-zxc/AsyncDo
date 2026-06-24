const API_URL = 'http://127.0.0.1:8000/api/tasks';
const USER_API_URL = 'http://127.0.0.1:8000/api/users';

let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'newest';

async function register() {
    const loginInput = document.getElementById('authLogin');
    const passwordInput = document.getElementById('authPassword');

    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    if (!login || !password) {
        alert("Пожалуйста, заполните все поля!");
        return;
    }

    try {
        const response = await fetch(`${USER_API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: login, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Профиль успешно создан! Теперь войдите в аккаунт.");
            loginInput.value = '';
            passwordInput.value = '';
        } else {
            alert("Ошибка регистрации: " + (data.detail || "Неизвестная ошибка"));
        }
    } catch (error) {
        console.error("Ошибка при регистрации:", error);
    }
}

async function login() {
    const loginInput = document.getElementById('authLogin');
    const passwordInput = document.getElementById('authPassword');

    const loginName = loginInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        const response = await fetch(`${USER_API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: loginName, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            // Запоминаем токен и имя пользователя в браузере
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('username', loginName);

            // Перенаправляем на новый красивый путь /users/sanya
            history.pushState({}, '', '/users/' + loginName);
            await Router();
        } else {
            alert("Ошибка входа: " + (data.detail || "Неверный логин или пароль"));
        }
    } catch (error) {
        console.error("Ошибка при входе:", error);
    }
}

async function loadTasks() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        // 🛡️ БЕЗОПАСНО: Убран ?user_id= из URL. Токен передается в заголовках
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            await logout();
            return;
        }

        const tasks = await response.json();
        const ul = document.getElementById('taskList');
        ul.innerHTML = '';

        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.confirmed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.confirmed);
        }
        if (currentSearch) {
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(currentSearch)
            );
        }

        await updateTaskCounter(filteredTasks);

        if (currentSort === 'oldest') {
            filteredTasks.reverse();
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.setAttribute('data-task-id', task.id);
            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            textSpan.textContent = task.title;
            li.appendChild(textSpan);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions';

            if (task.confirmed) {
                li.className = 'completed';
            } else {
                const confBtn = document.createElement('button');
                confBtn.className = 'conf-btn';
                confBtn.textContent = 'Выполнено';
                confBtn.onclick = function() {
                    confirmTask(task.id);
                };
                actionsDiv.appendChild(confBtn);
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Удалить';
            deleteBtn.onclick = function() {
                deleteTask(task.id);
            };
            actionsDiv.appendChild(deleteBtn);

            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = 'Редактировать';
            editBtn.onclick = function() {
                startEditTask(task.id, task.title);
            };
            actionsDiv.appendChild(editBtn);

            li.appendChild(actionsDiv);
            ul.appendChild(li);
        });
    } catch (error) {
        console.error("Ошибка при получении задач:", error);
    }
}

async function addTask() {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    if (!title) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            // 🛡️ БЕЗОПАСНО: Поле owner_id больше не отправляется на бэкенд
            body: JSON.stringify({ title: title })
        });

        if (response.ok) {
            input.value = '';
            await loadTasks();
        }
    } catch (error) {
        console.error("Ошибка при добавлении задачи:", error);
    }
}

async function deleteTask(taskId) {
    const li = document.querySelector(`li[data-task-id="${taskId}"]`);
    if (li) li.classList.add('removing');

    const token = localStorage.getItem('token');

    try {
        // 🛡️ БЕЗОПАСНО: Убрано ?user_id= из строки запроса
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        if (li) li.classList.remove('removing');
    }
}

async function confirmTask(taskId) {
    const token = localStorage.getItem('token');

    try {
        // 🛡️ БЕЗОПАСНО: Убрано ?user_id= из строки запроса
        const response = await fetch(`${API_URL}/${taskId}/confirm`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error("Ошибка при подтверждении задачи:", error);
    }
}

async function logout() {
    // Полностью очищаем данные пользователя из памяти браузера
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    document.getElementById('taskScreen').style.display = 'none';
    document.getElementById('headerLogining').style.display = 'none';
    document.getElementById('headerRegister').style.display = 'flex';
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('authLogin').value = '';
    document.getElementById('authPassword').value = '';
    document.getElementById('searchInput').value = '';

    history.pushState({}, '', '/');
    await Router();
}

async function showAuth() {
    history.pushState({}, '', '/auth');
    await Router();
}

async function filter(status) {
    currentFilter = status;

    document.getElementById('filterAll').classList.remove('active');
    document.getElementById('filterActive').classList.remove('active');
    document.getElementById('filterCompleted').classList.remove('active');

    if (status === 'all') document.getElementById('filterAll').classList.add('active');
    else if (status === 'active') document.getElementById('filterActive').classList.add('active');
    else if (status === 'completed') document.getElementById('filterCompleted').classList.add('active');

    await loadTasks();
}

document.getElementById('searchInput').addEventListener('input', async function(e) {
    currentSearch = e.target.value.toLowerCase();
    await loadTasks();
});

async function startEditTask(taskId, oldTitle) {
    const li = document.querySelector(`li[data-task-id="${taskId}"]`);
    const textSpan = li.querySelector('.task-text');
    const editBtn = li.querySelector('.edit-btn');

    if (!textSpan) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldTitle;
    input.className = 'task-text';
    textSpan.replaceWith(input);

    const confBtn = document.createElement('button');
    confBtn.textContent = "Подтвердить";
    confBtn.className = 'conf-btn2';
    editBtn.replaceWith(confBtn);

    input.focus();

    let isClosing = false;

    function revertUI() {
        if (isClosing) return;
        isClosing = true;
        input.replaceWith(textSpan);
        confBtn.replaceWith(editBtn);
    }

    async function save() {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== oldTitle) {
            await saveEditTask(taskId, newTitle);
        } else {
            revertUI();
        }
    }

    input.addEventListener('keydown', async function(e) {
        if (e.key === 'Enter') {
            await save();
        } else if (e.key === 'Escape') {
            revertUI();
        }
    });

    confBtn.onmousedown = async function(e) {
        e.preventDefault();
        await save();
    };

    input.addEventListener('blur', function(e) {
        if (e.relatedTarget !== confBtn) {
            revertUI();
        }
    });
}

async function saveEditTask(taskId, newTitle) {
    const token = localStorage.getItem('token');
    try {
        // 🛡️ БЕЗОПАСНО: Убран ?user_id= из URL, добавлен заголовок Authorization
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: newTitle })
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error("Ошибка при сохранении:", error);
    }
}

async function updateTaskCounter(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.confirmed).length;
    const active = total - completed;

    document.getElementById('taskCounter').textContent =
        `Активных: ${active} | Выполнено: ${completed} | Всего: ${total}`;
}

async function clearCompleted() {
    const token = localStorage.getItem('token');
    try {
        // 🛡️ БЕЗОПАСНО: Получаем задачи текущего пользователя по его токену
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasks = await response.json();
        const completed = tasks.filter(task => task.confirmed);

        for (const task of completed) {
            // 🛡️ БЕЗОПАСНО: Удаляем также строго по токену без параметров в URL
            await fetch(`${API_URL}/${task.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        await loadTasks();
    } catch (error) {
        console.error("Ошибка при очистке:", error);
    }
}

async function toggleSort() {
    const btn = document.getElementById('sortBtn');

    if (currentSort === 'newest') {
        currentSort = 'oldest';
        btn.textContent = 'Старые';
    } else {
        currentSort = 'newest';
        btn.textContent = 'Новые';
    }

    await loadTasks();
}

async function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
}

function hideAllScreens() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('taskScreen').style.display = 'none';
}

async function Router() {
    hideAllScreens();
    const path = window.location.pathname;

    const savedUsername = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    // Проверяем регулярным выражением путь вида /users/имя_пользователя
    const userMatch = path.match(/^\/users\/([a-zA-Z0-9_-]+)$/);

    if (path === '/' || path === '') {
        // Если пользователь залогинен, показываем шапку авторизованного, но экран приветствия
        if (token && savedUsername) {
            document.getElementById('headerUserName').textContent = savedUsername;
            document.getElementById('headerRegister').style.display = 'none';
            document.getElementById('headerLogining').style.display = 'flex';
        } else {
            document.getElementById('headerRegister').style.display = 'flex';
            document.getElementById('headerLogining').style.display = 'none';
        }
        document.getElementById('welcomeScreen').style.display = 'block';
    }
    else if (path === '/auth') {
        document.getElementById('authScreen').style.display = 'block';
    }
    else if (userMatch) {
        const usernameFromUrl = userMatch[1];

        // Защита: если токена нет, не пускаем в профиль, отправляем на авторизацию
        if (!token) {
            history.pushState({}, '', '/auth'   );
            await Router();
            return;
        }

        // Настраиваем шапку сайта и отображаем экран задач
        document.getElementById('headerUserName').textContent = usernameFromUrl;
        document.getElementById('headerRegister').style.display = 'none';
        document.getElementById('headerLogining').style.display = 'flex';
        document.getElementById('taskScreen').style.display = 'block';

        await loadTasks();
    }
    else {
        // На любые другие неизвестные пути отправляем на главную
        history.pushState({}, '', '/');
        document.getElementById('welcomeScreen').style.display = 'block';
    }
}

// Отслеживание системных кнопок браузера Назад/Вперед
window.addEventListener('popstate', Router);

// Автоматический запуск при первой загрузке страницы (F5)
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const path = window.location.pathname;

    // Если пользователь залогинен, но зашел на главную страницу,
    // восстанавливаем состояние шапки сайта через вызов роутера
    await Router();
});

window.addEventListener('popstate', Router);

// 🛡️ ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', async () => {
    await Router();

    const token = localStorage.getItem('token');
    if (token) {
        // Если пользователь уже залогинен и обновляет страницу (например, на /sanya)
        const path = window.location.pathname;
        if (path !== '/' && path !== '/auth') {
            document.getElementById('headerRegister').style.display = 'none';
            document.getElementById('headerLogining').style.display = 'flex';
        }
        // Автоматически подтягиваем задачи защищенным способом
        await loadTasks();
    }
});

async function goHome() {
    history.pushState({}, '', '/');
    await Router();
}

// Переход обратно в свой профиль при нажатии на никнейм
async function goProfile() {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername && localStorage.getItem('token')) {
        history.pushState({}, '', '/users/' + savedUsername);
        await Router();
    }
}
