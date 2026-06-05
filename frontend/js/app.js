const API_URL = 'http://127.0.0.1:8000/api/tasks';
const USER_API_URL = 'http://127.0.0.1:8000/api/users';

let currentUserId = null;
let currentFilter = 'all'
let currentSearch = ''
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

        await updateTaskCounter(filteredTasks);

        if (currentSort === 'oldest') {
            filteredTasks.reverse();
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.setAttribute('data-task-id', task.id)
            
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
    const li = document.querySelector(`li[data-task-id="${taskId}"]`);
    li.classList.add('removing');

    try {
        const response = await fetch(`${API_URL}/${taskId}?user_id=${currentUserId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        li.classList.remove('removing');
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
    try {
        const response = await fetch(`${API_URL}/${taskId}?user_id=${currentUserId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
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
    try {
        const response = await fetch(`${API_URL}?user_id=${currentUserId}`);
        const tasks = await response.json();
        const completed = tasks.filter(task => task.confirmed);

        for (const task of completed) {
            await fetch(`${API_URL}/${task.id}?user_id=${currentUserId}`, {
                method: 'DELETE'
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