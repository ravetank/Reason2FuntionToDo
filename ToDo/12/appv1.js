document.addEventListener('DOMContentLoaded', () => {
    // Check for localStorage support
    function isLocalStorageAvailable() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    if (!isLocalStorageAvailable()) {
        alert('Local storage is not supported by your browser. The app may not function correctly.');
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // DOM elements
    const projectInput = document.getElementById('projectInput');
    const addProjectButton = document.getElementById('addProjectButton');
    const projectList = document.getElementById('projectList');
    const taskSection = document.getElementById('taskSection');
    const currentProjectName = document.getElementById('currentProjectName');
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');

    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let currentProjectIndex = null;

    function saveProjects() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    function renderProjects() {
        projectList.innerHTML = '';
        projects.forEach((project) => {
            const li = document.createElement('li');
            li.textContent = project.name;
            projectList.appendChild(li);
        });
    }

    function renderTasks(tasks) {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.dataset.taskIndex = index;

            const taskText = document.createElement('span');
            taskText.textContent = `${task.name} (Due: ${new Date(task.dueDate).toLocaleDateString()})`;
            if (task.completed) {
                taskText.classList.add('completed');
            }
            li.appendChild(taskText);

            const completeButton = document.createElement('button');
            completeButton.textContent = 'Complete';
            completeButton.classList.add('complete-button');
            li.appendChild(completeButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button');
            li.appendChild(deleteButton);

            taskList.appendChild(li);
        });
    }

    function addProject() {
        const projectName = projectInput.value.trim();
        if (projectName) {
            projects.push({ name: projectName, tasks: [] });
            saveProjects();
            projectInput.value = '';
            renderProjects();
        } else {
            alert('Please enter a project name.');
        }
    }

    function addTask() {
        const taskName = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        if (taskName && dueDate) {
            projects[currentProjectIndex].tasks.push({
                name: taskName,
                dueDate,
                completed: false,
            });
            saveProjects();
            taskInput.value = '';
            dueDateInput.value = '';
            renderTasks(projects[currentProjectIndex].tasks);
        } else {
            alert('Please enter a task name and due date.');
        }
    }

    function checkDueDates() {
        const now = new Date();
        projects.forEach((project) => {
            project.tasks.forEach(task => {
                const dueDate = new Date(task.dueDate);
                if (!task.completed && dueDate < now) {
                    showNotification(`Task "${task.name}" is overdue!`);
                }
            });
        });
        scheduleNextCheck();
    }

    function showNotification(message) {
        if (Notification.permission === 'granted') {
            new Notification('Reason 2 Funk Task Manager', { body: message });
        }
    }

    function scheduleNextCheck() {
        const now = new Date();
        const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
        setTimeout(checkDueDates, delay);
    }

    // Event listeners
    addProjectButton.addEventListener('click', addProject);

    projectList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const projectName = event.target.textContent;
            currentProjectIndex = projects.findIndex(p => p.name === projectName);
            taskSection.style.display = 'block';
            currentProjectName.textContent = projectName;
            renderTasks(projects[currentProjectIndex].tasks);
        }
    });

    addTaskButton.addEventListener('click', () => {
        if (currentProjectIndex !== null) {
            addTask();
        } else {
            alert('Please select a project first.');
        }
    });

    taskList.addEventListener('click', (event) => {
        const tasks = projects[currentProjectIndex].tasks;
        const taskIndex = event.target.parentElement.dataset.taskIndex;

        if (event.target.classList.contains('complete-button')) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveProjects();
            renderTasks(tasks);
        }

        if (event.target.classList.contains('delete-button')) {
            tasks.splice(taskIndex, 1);
            saveProjects();
            renderTasks(tasks);
        }
    });

    // Initialize the app
    renderProjects();
    scheduleNextCheck();
});
