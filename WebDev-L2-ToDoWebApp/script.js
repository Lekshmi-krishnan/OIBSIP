document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('task-input');
    const todoForm = document.getElementById('todo-form');
    const errorMessage = document.getElementById('error-message');
    const pendingList = document.getElementById('pending-list');
    const completedList = document.getElementById('completed-list');
    const pendingCounter = document.getElementById('pending-counter');
    const completedCounter = document.getElementById('completed-counter');
    const pendingEmpty = document.getElementById('pending-empty');
    const completedEmpty = document.getElementById('completed-empty');

    let tasks = [];
    let editingTaskId = null;

    function loadTasks() {
        const stored = localStorage.getItem('tasks');
        if (stored) {
            try {
                tasks = JSON.parse(stored);
            } catch (e) {
                tasks = [];
            }
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }

    function render() {
        pendingList.innerHTML = '';
        completedList.innerHTML = '';

        const pendingTasks = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);

        pendingCounter.textContent = `${pendingTasks.length} pending`;
        completedCounter.textContent = `${completedTasks.length} completed`;

        pendingEmpty.style.display = pendingTasks.length === 0 ? 'block' : 'none';
        completedEmpty.style.display = completedTasks.length === 0 ? 'block' : 'none';

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            const isEditing = editingTaskId === task.id;

            let timestampText = `Added: ${formatTime(task.createdAt)}`;
            if (task.completed && task.completedAt) {
                timestampText += ` | Completed: ${formatTime(task.completedAt)}`;
            }

            if (isEditing) {
                li.innerHTML = `
                    <div class="task-left">
                        <div class="task-content">
                            <input type="text" class="edit-input" value="${escapeHtml(task.text)}">
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-icon btn-save" data-action="save">Save</button>
                        <button class="btn btn-icon btn-edit" data-action="cancel">Cancel</button>
                    </div>
                `;
            } else {
                li.innerHTML = `
                    <div class="task-left">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-action="toggle">
                        <div class="task-content">
                            <span class="task-text">${escapeHtml(task.text)}</span>
                            <span class="timestamps">${timestampText}</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-icon btn-edit" data-action="edit">Edit</button>
                        <button class="btn btn-icon btn-delete" data-action="delete">Delete</button>
                    </div>
                `;
            }

            if (task.completed) {
                completedList.appendChild(li);
            } else {
                pendingList.appendChild(li);
            }
        });
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function addTask(text) {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: Date.now(),
            completedAt: null
        };
        tasks.push(newTask);
        saveTasks();
        render();
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                const nextCompleted = !task.completed;
                return {
                    ...task,
                    completed: nextCompleted,
                    completedAt: nextCompleted ? Date.now() : null
                };
            }
            return task;
        });
        saveTasks();
        render();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        render();
    }

    function startEdit(id) {
        editingTaskId = id;
        render();
        const activeInput = document.querySelector(`.task-item[data-id="${id}"] .edit-input`);
        if (activeInput) {
            activeInput.focus();
            activeInput.select();
        }
    }

    function saveEdit(id) {
        const activeInput = document.querySelector(`.task-item[data-id="${id}"] .edit-input`);
        if (!activeInput) return;

        const newText = activeInput.value.trim();
        if (newText === '') {
            showError('Task description cannot be empty.');
            return;
        }

        hideError();
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, text: newText };
            }
            return task;
        });
        editingTaskId = null;
        saveTasks();
        render();
    }

    function cancelEdit() {
        editingTaskId = null;
        hideError();
        render();
    }

    todoForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text === '') {
            showError('Please enter a task description.');
            return;
        }
        hideError();
        addTask(text);
        taskInput.value = '';
    });

    function handleListClick(e) {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        const id = Number(taskItem.dataset.id);
        const action = actionBtn.dataset.action;

        if (action === 'toggle') {
            toggleTask(id);
        } else if (action === 'delete') {
            deleteTask(id);
        } else if (action === 'edit') {
            startEdit(id);
        } else if (action === 'save') {
            saveEdit(id);
        } else if (action === 'cancel') {
            cancelEdit();
        }
    }

    function handleListKeydown(e) {
        if (e.key === 'Enter') {
            const taskItem = e.target.closest('.task-item');
            if (taskItem && editingTaskId) {
                const id = Number(taskItem.dataset.id);
                saveEdit(id);
            }
        } else if (e.key === 'Escape') {
            if (editingTaskId) {
                cancelEdit();
            }
        }
    }

    pendingList.addEventListener('click', handleListClick);
    completedList.addEventListener('click', handleListClick);

    pendingList.addEventListener('keydown', handleListKeydown);
    completedList.addEventListener('keydown', handleListKeydown);

    loadTasks();
    render();
});
