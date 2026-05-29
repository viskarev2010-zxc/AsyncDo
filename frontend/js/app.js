const API_URL = 'http://127.0.0.1:8000/api/tasks';
const USER_API_URL = 'http://127.0.0.1:8000/api/users';

let currentUserId = null;

let currentFilter = 'all'
let currentSearch = ''

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
    
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        const response = await fetch(`${USER_API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: login, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUserId = data.user_id;

            document.getElementById('authScreen').style.display = 'none';
            document.getElementById('taskScreen').style.display = 'block';
            document.getElementById('headerUserName').textContent = login;
            document.getElementById('headerRegister').style.display = 'none';
            document.getElementById('headerLogining').style.display = 'flex';
            document.getElementById('welcomeScreen').style.display = 'none';

            await loadTasks();
        } else {
            alert("Ошибка входа: " + (data.detail || "Неверный логин или пароль"));
        }
    } catch (error) {
        console.error("Ошибка при входе:", error);
    }
}

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}?user_id=${currentUserId}`);
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

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            
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

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, owner_id: currentUserId })
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
    try {
        const response = await fetch(`${API_URL}/${taskId}?user_id=${currentUserId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error("Ошибка при удалении задачи:", error);
    }
}

async function confirmTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/${taskId}/confirm?user_id=${currentUserId}`, {
            method: 'PATCH'
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error("Ошибка при подтверждении задачи:", error);
    }
}

async function logout() {
    currentUserId = null;
    document.getElementById('taskScreen').style.display = 'none';
    document.getElementById('headerLogining').style.display = 'none';
    document.getElementById('headerRegister').style.display = 'flex';
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('authLogin').value = '';
    document.getElementById('authPassword').value = '';
    document.getElementById('searchInput').value = ''
}

async function showAuth() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('authScreen').style.display = 'block';
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