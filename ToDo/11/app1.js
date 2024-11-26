document.addEventListener('DOMContentLoaded', () => {
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const addProjectBtn = document.getElementById('add-project-btn');
    const addTaskBtn = document.getElementById('add-task-btn');
    const searchTaskInput = document.getElementById('search-task');

    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = null;

    // Load stored user
    if (localStorage.getItem('currentUser')) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        updateUI();
    }

    // Load dark mode preference
    const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    toggleDarkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('isDarkMode', isDarkMode);
    });

    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        const role = document.getElementById('role').value;
        if (!username) {
            alert("Username cannot be empty.");
            return;
        }
        currentUser = { username, role };
        users.push(currentUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUI();
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateUI();
    });

    addProjectBtn.addEventListener('click', () => {
        const projectName = document.getElementById('project-name').value.trim();
        if (!projectName) {
            alert("Project name cannot be empty.");
            return;
        }
        projects.push({ name: projectName, tasks: [], users: [] });
        localStorage.setItem('projects', JSON.stringify(projects));
        renderProjects();
        document.getElementById('project-name').value = '';
    });

    addTaskBtn.addEventListener('click', () => {
        const taskName = document.getElementById('task-name').value.trim();
        const taskPriority = document.getElementById('task-priority').value;
        const taskDueDate = document.getElementById('task-due-date').value;
        if (!taskName) {
            alert("Task name cannot be empty.");
            return;
        }
        const currentProjectIndex = projects.findIndex(p => p.name === document.getElementById('current-project-name').textContent);
        projects[currentProjectIndex].tasks.push({ name: taskName, priority: taskPriority, dueDate: taskDueDate, completed: false, subtasks: [], status: 'to-do', assignedTo: [] });
        localStorage.setItem('projects', JSON.stringify(projects));
        renderKanbanBoard();
        document.getElementById('task-name').value = '';
        document.getElementById('task-priority').value = 'low';
        document.getElementById('task-due-date').value = '';
    });

    searchTaskInput.addEventListener('input', () => {
        const searchTerm = searchTaskInput.value.toLowerCase();
        const currentProjectIndex = projects.findIndex(p => p.name === document.getElementById('current-project-name').textContent);
        if (currentProjectIndex !== -1) {
            const filteredTasks = projects[currentProjectIndex].tasks.filter(task =>
                task.name.toLowerCase().includes(searchTerm)
            );
            renderFilteredTasks(filteredTasks);
        }
    });

    function updateUI() {
        if (currentUser) {
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('logout-section').style.display = 'block';
            document.getElementById('project-section').style.display = 'block';
            renderProjects();
        } else {
            document.getElementById('auth-section').style.display = 'block';
            document.getElementById('logout-section').style.display = 'none';
            document.getElementById('project-section').style.display = 'none';
            document.getElementById('task-section').style.display = 'none';
            document.getElementById('kanban-section').style.display = 'none';
        }
    }

    function renderProjects() {
        const projectList = document.getElementById('project-list');
        projectList.innerHTML = '';
        projects.forEach(project => {
            const li = document.createElement('li');
            li.textContent = project.name;
            li.addEventListener('click', () => {
                document.getElementById('current-project-name').textContent = project.name;
                document.getElementById('kanban-project-name').textContent = project.name;
                document.getElementById('task-section').style.display = 'block';
                document.getElementById('kanban-section').style.display = 'block';
                renderKanbanBoard();
            });
            projectList.appendChild(li);
        });
    }

    function renderTasks() {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        const currentProjectIndex = projects.findIndex(p => p.name === document.getElementById('current-project-name').textContent);
        if (currentProjectIndex !== -1) {
            projects[currentProjectIndex].tasks.forEach((task, index) => {
                renderTask(task, index);
            });
        }
    }

    function renderFilteredTasks(filteredTasks) {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        filteredTasks.forEach((task, index) => {
            renderTask(task, index);
        });
    }

    function renderTask(task, index) {
        const taskList = document.getElementById('task-list');
        const li = document.createElement('li');
        li.innerHTML = `<span class="${task.completed ? 'completed' : ''}">${task.name} - Priority: ${task.priority}${task.dueDate ? ` - Due: ${task.dueDate}` : ''}</span>`;
        if (currentUser.role === 'admin') {
            li.innerHTML += `<button onclick="toggleTaskCompletion(${index})">Toggle Completion</button><button onclick="deleteTask(${index})">Delete</button>`;
        } else {
            li.innerHTML += `<button onclick="toggleTaskCompletion(${index})">Toggle Completion</button>`;
        }
        task.subtasks.forEach(subtask => {
            const subtaskLi = document.createElement('li');
            subtaskLi.textContent = `Subtask: ${subtask}`;
            li.appendChild(subtaskLi);
        });
        task.assignedTo.forEach(user => {
            const userLi = document.createElement('li');
            userLi.textContent = `Assigned to: ${user.username}`;
            li.appendChild(userLi);
        });
        taskList.appendChild(li);
    }

    function renderKanbanBoard() {
        const currentProjectIndex = projects.findIndex(p => p.name === document.getElementById('kanban-project-name').textContent);
        if (currentProjectIndex !== -1) {
            const tasks = projects[currentProjectIndex].tasks;
            const toDoList = document.getElementById('to-do-list');
            const inProgressList = document.getElementById('in-progress-list');
            const doneList = document.getElementById('done-list');

            toDoList.innerHTML = '';
            inProgressList.innerHTML = '';
            doneList.innerHTML = '';

            tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = `${task.name} - Priority: ${task.priority}${task.dueDate ? ` - Due: ${task.dueDate}` : ''}`;
                if (currentUser.role === 'admin') {
                    li.innerHTML += `<button onclick="moveTask(${projects[currentProjectIndex].tasks.indexOf(task)}, 'in-progress')">Move to In Progress</button>`;
                    li.innerHTML += `<button onclick="deleteTask(${projects[currentProjectIndex].tasks.indexOf(task)})">Delete</button>`;
                } else {
                    li.innerHTML += `<button onclick="moveTask(${projects[currentProjectIndex].tasks.indexOf(task)}, 'in-progress')">Move to In Progress</button>`;
                }
                task.subtasks.forEach(subtask => {
                    const subtaskLi = document.createElement('li');
                    subtaskLi.textContent = `Subtask: ${subtask}`;
                    li.appendChild(subtaskLi);
                });
                task.assignedTo.forEach(user => {
                    const userLi = document.createElement('li');
                    userLi.textContent = `Assigned to: ${user.username}`;
                    li.appendChild(userLi);
                });

                if (task.status === 'to-do') {
                    toDoList.appendChild(li);
                } else if (task.status === 'in-progress') {
                    inProgressList.appendChild(li);
                } else if (task.status === 'done') {
                    doneList.appendChild(li);
                }
            });
        }
    }

    function toggleTaskCompletion(index) {
        const currentProjectIndex = projects.findIndex(p => p.name === document.getElementById('current-project-name').textContent);
        projects[currentProjectIndex].tasks[index].completed = !projects[currentProjectIndex].tasks[index].completed;
        localStorage.setItem('projects', JSON.stringify(projects));
        renderTasks();
        renderKanbanBoard();
    }

    function deleteTask(index) {
        const currentProjectIndex = projects.findIndex(p => p.name === document.getElementById('current-project-name').textContent);
        projects[currentProjectIndex].tasks.splice(index, 1);
        localStorage.setItem('projects', JSON.stringify(projects));
        renderTasks();
        renderKanbanBoard();
    }

    function moveTask(taskIndex, newStatus) {
        const currentProjectIndex = projects.findIndex(p => p.name === document.getElementById('kanban-project-name').textContent);
        projects[currentProjectIndex].tasks[taskIndex].status = newStatus;
        localStorage.setItem('projects', JSON.stringify(projects));
        renderKanbanBoard();
    }

    function addSubtask() {
        const currentProjectIndex = projects.findIndex(p => p.name === document.getElementById('current-project-name').textContent);
        const taskName = document.getElementById('task-name').value.trim();
        const subtask = prompt("Enter subtask:");
        if (subtask) {
            const taskIndex = projects[currentProjectIndex].tasks.findIndex(task => task.name === taskName);
            if (taskIndex !== -1) {
                projects[currentProjectIndex].tasks[taskIndex].subtasks.push(subtask);
                localStorage.setItem('projects', JSON.stringify(projects));
                renderTasks();
                renderKanbanBoard();
            }
        }
    }

    function assignUserToTask(taskIndex, user) {
        const currentProjectIndex = projects.findIndex(p => p.name === document.getElementById('kanban-project-name').textContent);
        if (currentProjectIndex !== -1) {
            projects[currentProjectIndex].tasks[taskIndex].assignedTo.push(user);
            localStorage.setItem('projects', JSON.stringify(projects));
            renderTasks();
            renderKanbanBoard();
        }
    }

    window.addSubtask = addSubtask;
    window.assignUserToTask = assignUserToTask;
});
'''
--------------------------------------------------------------------------------------------------------------------
styles.css
'''
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f4f4f9;
}

.container {
    max-width: 1200px;
    margin: auto;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}

button:hover {
    background-color: #0056b3;
}

#auth-section, #logout-section {
    display: flex;
    align-items: center;
}

#auth-section input[type="text"] {
    margin-right: 10px;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

#project-section, #task-section, #kanban-section {
    display: none;
}

#project-section h2, #task-section h2, #kanban-section h2 {
    margin-bottom: 10px;
}

#project-section input[type="text"], #task-section input[type="text"] {
    margin-right: 10px;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

#task-section select, #task-section input[type="date"] {
    margin-right: 10px;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    background-color: white;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.completed {
    text-decoration: line-through;
    color: #888;
}

.kanban-board {
    display: flex;
    justify-content: space-between;
}

.kanban-column {
    width: calc(33% - 20px);
    background-color: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.kanban-column h3 {
    margin-bottom: 10px;
}

.dark-mode body {
    background-color: #333;
    color: white;
}

.dark-mode button {
    background-color: #555;
}

.dark-mode #auth-section input[type="text"], .dark-mode select, .dark-mode input[type="date"] {
    background-color: #444;
    color: white;
    border-color: #666;
}