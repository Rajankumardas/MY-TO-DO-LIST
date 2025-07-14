document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const tasksLeft = document.getElementById('tasks-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Current filter
    let currentFilter = 'all';
    
    // Initialize the app
    init();
    
    // Event Listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderTasks();
        });
    });
    
    // Functions
    function init() {
        // Load tasks from local storage
        loadTasks();
        renderTasks();
    }
    
    function addTask() {
        const taskText = taskInput.value.trim();
        
        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }
        
        const tasks = getTasks();
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks(tasks);
        taskInput.value = '';
        renderTasks();
    }
    
    function renderTasks() {
        const tasks = getTasks();
        
        // Filter tasks based on current filter
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Clear the task list
        taskList.innerHTML = '';
        
        // Add each task to the list
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
        });
        
        // Add event listeners to the new elements
        addTaskEventListeners();
        
        // Update tasks left counter
        updateTasksLeft();
    }
    
    function addTaskEventListeners() {
        // Checkbox 
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const taskId = parseInt(this.closest('.task-item').dataset.id);
                toggleTaskCompleted(taskId);
            });
        });
        
        // Delete event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = parseInt(this.closest('.task-item').dataset.id);
                deleteTask(taskId);
            });
        });
        
        // Edit  listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskItem = this.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.id);
                const taskText = taskItem.querySelector('.task-text').textContent;
                
                // Switch edit mode
                taskItem.classList.add('editing');
                taskItem.innerHTML = `
                    <input type="text" class="edit-input" value="${taskText}">
                    <button class="save-btn"><i class="fas fa-save"></i> Save</button>
                    <button class="cancel-btn"><i class="fas fa-times"></i> Cancel</button>
                `;
                
                // Focus input field
                taskItem.querySelector('.edit-input').focus();
                
                // Add event save and cancel
                taskItem.querySelector('.save-btn').addEventListener('click', function() {
                    saveEditedTask(taskId);
                });
                
                taskItem.querySelector('.cancel-btn').addEventListener('click', function() {
                    renderTasks();
                });
                
                //  Enter key
                taskItem.querySelector('.edit-input').addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        saveEditedTask(taskId);
                    }
                });
            });
        });
    }
    
    function saveEditedTask(taskId) {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        const newText = document.querySelector(`.task-item[data-id="${taskId}"] .edit-input`).value.trim();
        
        if (newText === '') {
            alert('Task cannot be empty!');
            return;
        }
        
        tasks[taskIndex].text = newText;
        saveTasks(tasks);
        renderTasks();
    }
    
    function toggleTaskCompleted(taskId) {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks(tasks);
        renderTasks();
    }
    
    function deleteTask(taskId) {
        const tasks = getTasks().filter(task => task.id !== taskId);
        saveTasks(tasks);
        renderTasks();
    }
    
    function clearCompletedTasks() {
        const tasks = getTasks().filter(task => !task.completed);
        saveTasks(tasks);
        renderTasks();
    }
    
    function updateTasksLeft() {
        const tasks = getTasks();
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksLeft.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} left`;
    }
    
    
    function getTasks() {
        const tasksJSON = localStorage.getItem('tasks');
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    }
    
    function saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function loadTasks() {
        
    }
});