const API_URL = 'http://127.0.0.1:8000/api/tasks';

async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        const ul = document.getElementById('taskList');
        ul.innerHTML = '';

        tasks.forEach(task => {
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
                // Создаем кнопку выполнения
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

async function deleteTask(taskId) {
    try {
        const response = await fetch(API_URL + '/' + taskId, {
            method: 'DELETE',
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error("Ошибка при удалении задачи:", error);
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

async function confirmTask(taskId) {
    try {
        const response = await fetch(API_URL + '/' + taskId + '/confirm', {
            method: 'PATCH'
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error("Ошибка при подтверждении задачи:", error);
    }
}

window.onload = loadTasks;