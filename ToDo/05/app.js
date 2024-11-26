document.addEventListener('DOMContentLoaded', () => {
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
    const loginBtn = document.getElementById('login-btn');
    const addProjectBtn = document.getElementById('add-project-btn');
    const addTaskBtn = document.getElementById('add-task-btn');

    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let currentUser = null;

    // Load stored user
    if (localStorage.getItem('currentUser')) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        updateUI();
    }

    toggleDarkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('underground-theme');
    });

    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const role = document.getElementById('role').value;
        currentUser = { username, role };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUI();
    });

    addProjectBtn.addEventListener('click', () => {
        const projectName = document.getElementById('project-name').value.trim();
        if (projectName) {
            projects.push({ name: projectName, tasks: [] });
            localStorage.setItem('projects', JSON.stringify(projects));
            renderProjects();
            document.getElementById('project-name').value = '';
        }
    });

    addTaskBtn.addEventListener('click', () => {
        const taskName = document.getElementById('task-name').value.trim();
        const taskDueDate = document.getElementById('task-due-date').value;
        if (taskName) {
            const currentProjectIndex = projects.findIndex(p => p.name ===
document.getElementById('current-project-name').textContent);
            projects[currentProjectIndex].tasks.push({ name: taskName, dueDate: taskDueDate, completed: false });
            localStorage.setItem('projects', JSON.stringify(projects));
            renderTasks();
            document.getElementById('task-name').value = '';
            document.getElementById('task-due-date').value = '';
        }
    });

    function updateUI() {
        if (currentUser) {
            document.getElementById('auth-section').style.display = 'none';
            renderProjects();
        } else {
            document.getElementById('auth-section').style.display = 'block';
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
                document.getElementById('task-section').style.display = 'block';
                renderTasks();
            });
            projectList.appendChild(li);
        });
    }

    function renderTasks() {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        const currentProject = projects.find(p => p.name === document.getElementById('current-project-name').textContent);
        if (currentProject) {
            currentProject.tasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="${task.completed ? 'completed' : ''}">${task.name}${task.dueDate ? ` - Due:
${task.dueDate}` : ''}</span>`;
                if (currentUser.role === 'admin') {
                    li.innerHTML += `<button onclick="toggleTaskCompletion(${index})">Toggle Completion</button><button
onclick="deleteTask(${index})">Delete</button>`;
                } else {
                    li.innerHTML += `<button onclick="toggleTaskCompletion(${index})">Toggle Completion</button>`;
                }
                taskList.appendChild(li);
            });
        }
    }

    window.toggleTaskCompletion = function(index) {
        const currentProjectIndex = projects.findIndex(p => p.name ===
document.getElementById('current-project-name').textContent);
        projects[currentProjectIndex].tasks[index].completed = !projects[currentProjectIndex].tasks[index].completed;
        localStorage.setItem('projects', JSON.stringify(projects));
        renderTasks();
    };

    window.deleteTask = function(index) {
        const currentProjectIndex = projects.findIndex(p => p.name ===
document.getElementById('current-project-name').textContent);
        projects[currentProjectIndex].tasks.splice(index, 1);
        localStorage.setItem('projects', JSON.stringify(projects));
        renderTasks();
    };
});