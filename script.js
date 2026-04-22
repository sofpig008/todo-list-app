class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCompleted());

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (!text) {
            alert('请输入待办事项');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString('zh-CN')
        };

        this.todos.unshift(todo);
        this.saveToStorage();
        this.render();
        input.value = '';
        input.focus();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    clearCompleted() {
        if (this.todos.some(t => t.completed)) {
            if (confirm('确定要清空所有已完成的待办事项吗？')) {
                this.todos = this.todos.filter(t => !t.completed);
                this.saveToStorage();
                this.render();
            }
        } else {
            alert('没有已完成的待办事项');
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('activeCount').textContent = active;
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<div class="empty-state"><p>暂无待办事项</p></div>';
        } else {
            todoList.innerHTML = filteredTodos.map(todo => `
                <li class="todo-item ${todo.completed ? 'completed' : ''}">
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="app.toggleTodo(${todo.id})"
                    >
                    <div style="flex: 1;">
                        <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                        <div class="todo-time">${todo.createdAt}</div>
                    </div>
                    <div class="todo-actions">
                        <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">删除</button>
                    </div>
                </li>
            `).join('');
        }

        this.updateStats();
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('todos');
        this.todos = stored ? JSON.parse(stored) : [];
    }
}

const app = new TodoApp();