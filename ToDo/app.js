// Step 1: Fix "Add sub task" bug
function addSubTask(taskId, subTaskDescription) {
    const task = document.getElementById(taskId);
    if (task) {
        let subTaskList = task.querySelector('.sub-task-list');
        if (!subTaskList) {
            subTaskList = document.createElement('ul');
            subTaskList.className = 'sub-task-list';
            task.appendChild(subTaskList);
        }
        const subTaskItem = document.createElement('li');
        subTaskItem.textContent = subTaskDescription;
        subTaskList.appendChild(subTaskItem);
    } else {
        console.error(`Task with ID ${taskId} not found.`);
    }
}

// Step 1: Fix "Move to different part of kaingin board" bug
function moveTaskToBoard(taskId, targetBoardId) {
    const task = document.getElementById(taskId);
    const targetBoard = document.getElementById(targetBoardId);
    if (task && targetBoard) {
        task.remove();
        targetBoard.appendChild(task);
    } else {
        console.error(`Task or Board not found.`);
    }
}

// Step 2: Comprehensive code review and bug fixing
function validateForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (event) => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    validateForms();
    populateTaskOptions();
});

// Step 3: Review code for graphical cohesiveness and ease of use
function enhanceUI() {
    document.body.style.fontFamily = 'Arial, sans-serif';
    document.querySelectorAll('.btn').forEach(btn => btn.style.backgroundColor = '#FFA500');
}

enhanceUI();

// Step 4: Add house music/vinyl record vibes
function addVinylVibes() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.style.backgroundImage = 'url(vinyl-button.png)');

    const audioSpectrum = document.createElement('div');
    audioSpectrum.className = 'audio-spectrum';
    audioSpectrum.style.backgroundImage = 'url(audio-spectrum.gif)';
    document.body.appendChild(audioSpectrum);
}

addVinylVibes();

// Step 5: Add user assignment to projects/tasks
function assignUserToTask(taskId, userId) {
    const task = document.getElementById(taskId);
    if (task) {
        let userTag = task.querySelector('.user-tag');
        if (!userTag) {
            userTag = document.createElement('span');
            userTag.className = 'user-tag';
            task.appendChild(userTag);
        }
        userTag.textContent = `Assigned to User ${userId}`;
    } else {
        console.error(`Task with ID ${taskId} not found.`);
    }
}

// Step 6: Add logout functionality
function addLogoutButton() {
    const logoutButton = document.createElement('button');
    logoutButton.className = 'btn btn-danger';
    logoutButton.textContent = 'Logout';
    logoutButton.onclick = () => {
        // Logout logic here
        localStorage.removeItem('userToken');
        window.location.href = '/login.html';
    };
    document.body.appendChild(logoutButton);
}

addLogoutButton();

// Add task creation functionality
function addTask(boardId) {
    const board = document.getElementById(boardId);
    if (board) {
        const taskId = `task-${Date.now()}`;
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task';
        taskDiv.id = taskId;
        taskDiv.innerHTML = `
            <input type="text" class="form-control" placeholder="Task description">
            <button onclick="addSubTask('${taskId}', this.previousElementSibling.value)">Add Sub Task</button>
            <select onchange="moveTaskToBoard('${taskId}', this.value)">
                <option value="">Move to...</option>
                <option value="todo-column">To Do</option>
                <option value="in-progress-column">In Progress</option>
                <option value="done-column">Done</option>
            </select>
        `;
        board.appendChild(taskDiv);
    } else {
        console.error(`Board with ID ${boardId} not found.`);
    }
}

// Populate task options in the sidebar
function populateTaskOptions() {
    const taskSelect = document.getElementById('task-to-assign');
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.querySelector('input').value || 'New Task';
        taskSelect.appendChild(option);
    });
}

// Assign task to user from sidebar
function assignTaskToUser() {
    const taskSelect = document.getElementById('task-to-assign');
    const userSelect = document.getElementById('user-to-assign');
    const taskId = taskSelect.value;
    const userId = userSelect.value;
    if (taskId && userId) {
        assignUserToTask(taskId, userId);
    } else {
        console.error('Please select a task and a user.');
    }
}