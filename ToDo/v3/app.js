document.addEventListener('DOMContentLoaded', () => {
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const addProjectBtn = document.getElementById('add-project-btn');
    const addTaskBtn = document.getElementById('add-task-btn');
    const searchTaskInput = document.getElementById('search-task');
    const projectNameInput = document.getElementById('project-name');
    const taskNameInput = document.getElementById('task-name');
    const taskPrioritySelect = document.getElementById('task-priority');
    const taskDueDateInput = document.getElementById('task-due-date');
    const currentProjectName = document.getElementById('current-project-name');
    const kanbanProjectName = document.getElementById('kanban-project-name');
    const projectList = document.getElementById('project-list');
    const taskList = document.getElementById('task-list');
    const toDoList = document.getElementById('to-do-list');
    const inProgressList = document.getElementById('in-progress-list');
    const doneList = document.getElementById('done-list');
    const authSection = document.getElementById('auth-section');
    const logoutSection = document.getElementById('logout-section');
    const projectSection = document.getElementById('project-section');
    const taskSection = document.getElementById('task-section');
    const kanbanSection = document.getElementById('kanban-section');

    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    // Load dark mode preference
    const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    if (currentUser) {
        updateUI();
    }

    toggleDarkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('isDarkMode', document.body.classList.contains('dark-mode'));
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
        const projectName = projectNameInput.value.trim();
        if (!projectName) {
            alert("Project name cannot be empty.");
            return;
        }
        projects.push({ name: projectName, tasks: [], users: [] });
        localStorage.setItem('projects', JSON.stringify(projects));
        renderProjects();
        projectNameInput.value = '';
    });

    addTaskBtn.addEventListener('click', () => {
        const taskName = taskNameInput.value.trim();
        const taskPriority = taskPrioritySelect.value;
        const taskDueDate = taskDueDateInput.value;
        if (!taskName) {
            alert("Task name cannot be empty.");
            return;
        }
        const currentProject = projects.find(p => p.name === currentProjectName.textContent);
        if (currentProject) {
            currentProject.tasks.push({ name: taskName, priority: taskPriority, dueDate: taskDueDate, completed: false, subtasks: [], status: 'to-do', assignedTo: [] });
            localStorage.setItem('projects', JSON.stringify(projects));
            renderKanbanBoard();
            taskNameInput.value = '';
            taskPrioritySelect.value = 'low';
            taskDueDateInput.value = '';
        } else {
            alert("No project selected.");
        }
    });

    searchTaskInput.addEventListener('input', () => {
        const searchTerm = searchTaskInput.value.toLowerCase();
        const currentProject = projects.find(p => p.name === currentProjectName.textContent);
        if (currentProject) {
            const filteredTasks = currentProject.tasks.filter(task => task.name.toLowerCase().includes(searchTerm));
            renderFilteredTasks(filteredTasks);
        }
    });

    function updateUI() {
        if (currentUser) {
            authSection.style.display = 'none';
            logoutSection.style.display = 'block';
            projectSection.style.display = 'block';
        } else {
            authSection.style.display = 'block';
            logoutSection.style.display = 'none';
            projectSection.style.display = 'none';
            taskSection.style.display = 'none';
            kanbanSection.style.display = 'none';
        }
    }

    function renderProjects() {
        projectList.innerHTML = '';
        projects.forEach(project => {
            const li = document.createElement('li');
            li.textContent = project.name;
            li.addEventListener('click', () => {
                currentProjectName.textContent = project.name;
                kanbanProjectName.textContent = project.name;
                taskSection.style.display = 'block';
                kanbanSection.style.display = 'block';
                renderKanbanBoard();
            });
            projectList.appendChild(li);
        });
    }

    function renderFilteredTasks(filteredTasks) {
        taskList.innerHTML = '';
        filteredTasks.forEach(task => {
            renderTask(task);
        });
    }

    function renderTask(task) {
        const li = document.createElement('li');
        li.innerHTML = `<span class="${task.completed ? 'completed' : ''}">${task.name} - Priority: ${task.priority}${task.dueDate ? ` - Due: ${task.dueDate}` : ''}</span>`;
        if (currentUser.role === 'admin') {
            li.innerHTML += `<button onclick="toggleTaskCompletion('${task.name}')">Toggle Completion</button><button onclick="deleteTask('${task.name}')">Delete</button>`;
        } else {
            li.innerHTML += `<button onclick="toggleTaskCompletion('${task.name}')">Toggle Completion</button>`;
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
        const currentProject = projects.find(p => p.name === kanbanProjectName.textContent);
        if (currentProject) {
            toDoList.innerHTML = '';
            inProgressList.innerHTML = '';
            doneList.innerHTML = '';

            currentProject.tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = `${task.name} - Priority: ${task.priority}${task.dueDate ? ` - Due: ${task.dueDate}` : ''}`;
                if (currentUser.role === 'admin') {
                    li.innerHTML += `<button onclick="moveTask('${task.name}', 'in-progress')">Move to In Progress</button>`;
                    li.innerHTML += `<button onclick="moveTask('${task.name}', 'done')">Move to Done</button>`;
                    li.innerHTML += `<button onclick="deleteTask('${task.name}')">Delete</button>`;
                } else {
                    li.innerHTML += `<button onclick="moveTask('${task.name}', 'in-progress')">Move to In Progress</button>`;
                    li.innerHTML += `<button onclick="moveTask('${task.name}', 'done')">Move to Done</button>`;
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

    function toggleTaskCompletion(taskName) {
        const currentProject = projects.find(p => p.name === currentProjectName.textContent);
        if (currentProject) {
            const task = currentProject.tasks.find(t => t.name === taskName);
            if (task) {
                task.completed = !task.completed;
                localStorage.setItem('projects', JSON.stringify(projects));
                renderTasks();
                renderKanbanBoard();
            }
        }
    }

    function deleteTask(taskName) {
        const currentProject = projects.find(p => p.name === currentProjectName.textContent);
        if (currentProject) {
            currentProject.tasks = currentProject.tasks.filter(task => task.name !== taskName);
            localStorage.setItem('projects', JSON.stringify(projects));
            renderTasks();
            renderKanbanBoard();
        }
    }

    function moveTask(taskName, newStatus) {
        const currentProject = projects.find(p => p.name === kanbanProjectName.textContent);
        if (currentProject) {
            const task = currentProject.tasks.find(t => t.name === taskName);
            if (task) {
                task.status = newStatus;
                localStorage.setItem('projects', JSON.stringify(projects));
                renderKanbanBoard();
            }
        }
    }

    function addSubtask() {
        const currentProject = projects.find(p => p.name === currentProjectName.textContent);
        const taskName = taskNameInput.value.trim();
        const subtask = prompt("Enter subtask:");
        if (subtask && currentProject) {
            const task = currentProject.tasks.find(task => task.name === taskName);
            if (task) {
                task.subtasks.push(subtask);
                localStorage.setItem('projects', JSON.stringify(projects));
                renderTasks();
                renderKanbanBoard();
            }
        }
    }

    function assignUserToTask(taskName, user) {
        const currentProject = projects.find(p => p.name === kanbanProjectName.textContent);
        if (currentProject) {
            const task = currentProject.tasks.find(task => task.name === taskName);
            if (task) {
                task.assignedTo.push(user);
                localStorage.setItem('projects', JSON.stringify(projects));
                renderTasks();
                renderKanbanBoard();
            }
        }
    }

    window.addSubtask = addSubtask;
    window.assignUserToTask = assignUserToTask;
});