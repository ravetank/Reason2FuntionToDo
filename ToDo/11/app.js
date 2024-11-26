document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const loginButton = document.getElementById('login-button');
    const logoutSection = document.getElementById('logout-section');
    const userGreeting = document.getElementById('user-greeting');
    const logoutButton = document.getElementById('logout-button');
    const projectSection = document.getElementById('project-section');
    const projectNameInput = document.getElementById('project-name');
    const addProjectButton = document.getElementById('add-project-button');
    const projectList = document.getElementById('project-list');
    const taskSection = document.getElementById('task-section');
    const currentProjectTitle = document.getElementById('current-project-title');
    const taskNameInput = document.getElementById('task-name');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');
    const kanbanSection = document.getElementById('kanban-section');
    const currentProjectTitleKanban = document.getElementById('current-project-title-kanban');
    const toDoList = document.getElementById('to-do-list');
    const inProgressList = document.getElementById('in-progress-list');
    const doneList = document.getElementById('done-list');

    let projects = [];
    let selectedProjectIndex = -1;

    // Load from local storage
    if (localStorage.getItem('projects')) {
        projects = JSON.parse(localStorage.getItem('projects'));
        renderProjects();
    }

    loginButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (!username) {
            alert('Please enter a valid username.');
            return;
        }
        logoutSection.style.display = 'block';
        userGreeting.textContent = `Hello, ${username}!`;
        projectSection.style.display = 'block';
    });

    logoutButton.addEventListener('click', () => {
        logoutSection.style.display = 'none';
        userGreeting.textContent = '';
        projectSection.style.display = 'none';
        taskSection.style.display = 'none';
        kanbanSection.style.display = 'none';
        selectedProjectIndex = -1;
    });

    addProjectButton.addEventListener('click', () => {
        const projectName = projectNameInput.value.trim();
        if (!projectName) {
            alert('Please enter a valid project name.');
            return;
        }
        projects.push({ name: projectName, tasks: [] });
        projectNameInput.value = '';
        saveProjects();
        renderProjects();
    });

    addTaskButton.addEventListener('click', () => {
        const taskName = taskNameInput.value.trim();
        if (!taskName) {
            alert('Please enter a valid task name.');
            return;
        }
        projects[selectedProjectIndex].tasks.push({ name: taskName, status: 'to-do' });
        taskNameInput.value = '';
        saveProjects();
        renderTasks();
    });

    projectList.addEventListener('click', (event) => {
        const index = Array.from(projectList.children).indexOf(event.target);
        if (index !== -1) {
            selectedProjectIndex = index;
            renderTasks();
            renderKanbanBoard();
        }
    });

    toDoList.addEventListener('click', (event) => {
        updateTaskStatus(event, 'in-progress');
    });

    inProgressList.addEventListener('click', (event) => {
        updateTaskStatus(event, 'done');
    });

    doneList.addEventListener('click', (event) => {
        deleteTask(event);
    });

    function renderProjects() {
        projectList.innerHTML = '';
        projects.forEach((project, index) => {
            const li = document.createElement('li');
            li.textContent = project.name;
            if (index === selectedProjectIndex) {
                li.style.fontWeight = 'bold';
            }
            projectList.appendChild(li);
        });
    }

    function renderTasks() {
        taskSection.style.display = 'block';
        currentProjectTitle.textContent = projects[selectedProjectIndex].name;
        taskList.innerHTML = '';
        const tasks = projects[selectedProjectIndex].tasks.filter(task => task.status === 'to-do');
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.name;
            taskList.appendChild(li);
        });
    }

    function renderKanbanBoard() {
        kanbanSection.style.display = 'flex';
        currentProjectTitleKanban.textContent = projects[selectedProjectIndex].name;

        toDoList.innerHTML = '';
        inProgressList.innerHTML = '';
        doneList.innerHTML = '';

        const tasks = projects[selectedProjectIndex].tasks;
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.name;
            if (task.status === 'to-do') {
                toDoList.appendChild(li);
            } else if (task.status === 'in-progress') {
                inProgressList.appendChild(li);
            } else if (task.status === 'done') {
                doneList.appendChild(li);
            }
        });
    }

    function updateTaskStatus(event, newStatus) {
        const taskName = event.target.textContent;
        const tasks = projects[selectedProjectIndex].tasks;
        const taskIndex = tasks.findIndex(task => task.name === taskName);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            saveProjects();
            renderKanbanBoard();
        }
    }

    function deleteTask(event) {
        const taskName = event.target.textContent;
        const tasks = projects[selectedProjectIndex].tasks;
        const taskIndex = tasks.findIndex(task => task.name === taskName);
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            saveProjects();
            renderKanbanBoard();
        }
    }

    function saveProjects() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }
});