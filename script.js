let todoLists = JSON.parse(localStorage.getItem('todoLists')) || [];

function saveToStorage() {
    localStorage.setItem('todoLists', JSON.stringify(todoLists));
}

function createList() {
    const listName = document.getElementById('listName').value.trim();
    if (!listName) return;
    
    const newList = {
        id: Date.now(),
        name: listName,
        tasks: []
    };
    
    todoLists.push(newList);
    saveToStorage();
    renderLists();
    document.getElementById('listName').value = '';
    
    // Add success animation
    showNotification('🎉 List created successfully!');
}

function addTask(listId) {
    const taskText = document.getElementById(`taskInput-${listId}`).value.trim();
    const taskDateTime = document.getElementById(`taskDateTime-${listId}`).value;
    
    if (!taskText) return;
    
    const list = todoLists.find(l => l.id === listId);
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        datetime: taskDateTime,
        createdAt: new Date().toISOString()
    };
    
    list.tasks.push(newTask);
    saveToStorage();
    renderLists();
    
    document.getElementById(`taskInput-${listId}`).value = '';
    document.getElementById(`taskDateTime-${listId}`).value = '';
    
    showNotification('✅ Task added!');
}

function toggleTask(listId, taskId) {
    const list = todoLists.find(l => l.id === listId);
    const task = list.tasks.find(t => t.id === taskId);
    task.completed = !task.completed;
    saveToStorage();
    renderLists();
    
    if (task.completed) {
        showNotification('🎊 Task completed!');
    }
}

function editTask(listId, taskId) {
    const list = todoLists.find(l => l.id === listId);
    const task = list.tasks.find(t => t.id === taskId);
    
    const newText = prompt('✏️ Edit your task:', task.text);
    if (newText !== null && newText.trim()) {
        task.text = newText.trim();
        saveToStorage();
        renderLists();
        showNotification('📝 Task updated!');
    }
}

function deleteTask(listId, taskId) {
    if (confirm('🗑️ Are you sure you want to delete this task?')) {
        const list = todoLists.find(l => l.id === listId);
        list.tasks = list.tasks.filter(t => t.id !== taskId);
        saveToStorage();
        renderLists();
        showNotification('🗑️ Task deleted!');
    }
}

function deleteList(listId) {
    if (confirm('⚠️ Delete this entire list? This cannot be undone!')) {
        todoLists = todoLists.filter(l => l.id !== listId);
        saveToStorage();
        renderLists();
        showNotification('🗑️ List deleted!');
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
        z-index: 1000;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function renderLists() {
    const container = document.getElementById('listsContainer');
    container.innerHTML = '';
    
    todoLists.forEach((list, index) => {
        const listDiv = document.createElement('div');
        listDiv.className = 'todo-list';
        listDiv.style.animationDelay = `${index * 0.1}s`;
        
        const completedTasks = list.tasks.filter(t => t.completed).length;
        const totalTasks = list.tasks.length;
        const progressEmoji = totalTasks === 0 ? '📝' : completedTasks === totalTasks ? '🎉' : '⏳';
        
        listDiv.innerHTML = `
            <div class="list-header">
                <h2>${progressEmoji} ${list.name} (${completedTasks}/${totalTasks})</h2>
                <button class="delete-btn" onclick="deleteList(${list.id})">🗑️ Delete</button>
            </div>
            <div class="task-input">
                <input type="text" id="taskInput-${list.id}" placeholder="➕ Add a new task...">
                <input type="datetime-local" id="taskDateTime-${list.id}">
                <button onclick="addTask(${list.id})">➕ Add Task</button>
            </div>
            <div class="tasks">
                ${list.tasks.map(task => `
                    <div class="task-item ${task.completed ? 'completed' : ''}">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                               onchange="toggleTask(${list.id}, ${task.id})">
                        <div class="task-content">
                            <div>${task.text}</div>
                            ${task.datetime ? `<div class="task-datetime">⏰ Due: ${new Date(task.datetime).toLocaleString()}</div>` : ''}
                        </div>
                        <div class="task-actions">
                            <button class="edit-btn" onclick="editTask(${list.id}, ${task.id})">✏️ Edit</button>
                            <button class="delete-btn" onclick="deleteTask(${list.id}, ${task.id})">🗑️ Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(listDiv);
    });
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    if (!document.querySelector('style[data-notifications]')) {
        style.setAttribute('data-notifications', 'true');
        document.head.appendChild(style);
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.id === 'listName') {
        createList();
    }
    if (e.key === 'Enter' && e.target.id.startsWith('taskInput-')) {
        const listId = parseInt(e.target.id.split('-')[1]);
        addTask(listId);
    }
});

// Initialize app
renderLists();
