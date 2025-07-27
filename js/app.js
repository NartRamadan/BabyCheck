// Main Application Controller
class BabyCheckApp {
    constructor() {
        this.currentView = 'teachers';
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentLanguage = localStorage.getItem('language') || 'he';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.applyLanguage();
        this.showView(this.currentView);
        this.loadInitialData();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.showView(view);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Language toggle
        document.getElementById('language-toggle').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close') || e.target.classList.contains('modal-cancel')) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Auto-save on form changes
        document.addEventListener('input', (e) => {
            if (e.target.closest('#activity-form')) {
                this.autoSaveForm();
            }
        });
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Remove active class from all nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected view
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
        }

        // Activate corresponding nav tab
        const targetTab = document.querySelector(`[data-view="${viewName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Initialize view-specific functionality
        this.initializeView(viewName);
    }

    initializeView(viewName) {
        switch (viewName) {
            case 'teachers':
                TeachersView.init();
                break;
            case 'parents':
                ParentsView.init();
                break;
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
        
        // Update theme toggle button
        const themeBtn = document.getElementById('theme-toggle');
        const icon = themeBtn.querySelector('i');
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'he' ? 'en' : 'he';
        localStorage.setItem('language', this.currentLanguage);
        this.applyLanguage();
        
        // Reload current view to update text
        this.initializeView(this.currentView);
    }

    applyLanguage() {
        document.documentElement.setAttribute('lang', this.currentLanguage);
        document.documentElement.setAttribute('dir', this.currentLanguage === 'he' ? 'rtl' : 'ltr');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        });
    }

    autoSaveForm() {
        // Debounce auto-save
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            const formData = this.getFormData();
            if (formData.childId) {
                localStorage.setItem('formDraft', JSON.stringify(formData));
            }
        }, 1000);
    }

    getFormData() {
        const form = document.getElementById('activity-form');
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        // Get all form fields
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Get selected mood
        const selectedMood = document.querySelector('.mood-btn.selected');
        if (selectedMood) {
            data.mood = selectedMood.dataset.mood;
        }

        // Get selected activities
        const selectedActivities = Array.from(document.querySelectorAll('input[name="activities"]:checked'))
            .map(checkbox => checkbox.value);
        data.activities = selectedActivities;

        // Get child ID
        const childSelect = document.getElementById('child-select');
        if (childSelect) {
            data.childId = childSelect.value;
        }

        return data;
    }

    loadInitialData() {
        // Load sample data if no data exists
        if (!localStorage.getItem('children')) {
            this.loadSampleData();
        }

        // Load form draft if exists
        const draft = localStorage.getItem('formDraft');
        if (draft) {
            this.loadFormDraft(JSON.parse(draft));
        }
    }

    loadSampleData() {
        const sampleChildren = [
            { id: '1', name: 'יוסי כהן', age: 3 },
            { id: '2', name: 'שרה לוי', age: 4 },
            { id: '3', name: 'דוד ישראלי', age: 2 },
            { id: '4', name: 'מיכל גולדברג', age: 3 },
            { id: '5', name: 'אברהם שפירא', age: 4 }
        ];

        const sampleActivities = [
            {
                id: '1',
                childId: '1',
                date: new Date().toISOString().split('T')[0],
                time: '08:30',
                type: 'eating',
                data: {
                    mealType: 'breakfast',
                    mealAmount: 'all',
                    notes: 'אכל הכל בשמחה'
                }
            },
            {
                id: '2',
                childId: '1',
                date: new Date().toISOString().split('T')[0],
                time: '09:15',
                type: 'activities',
                data: {
                    activities: ['free-play', 'art'],
                    notes: 'שיחק עם בלוקים וצייר'
                }
            },
            {
                id: '3',
                childId: '2',
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                type: 'sleeping',
                data: {
                    sleepStart: '10:00',
                    sleepEnd: '11:30',
                    sleepQuality: 'good'
                }
            }
        ];

        localStorage.setItem('children', JSON.stringify(sampleChildren));
        localStorage.setItem('activities', JSON.stringify(sampleActivities));
    }

    loadFormDraft(draft) {
        // Restore form data from draft
        const form = document.getElementById('activity-form');
        if (!form) return;

        // Restore child selection
        const childSelect = document.getElementById('child-select');
        if (childSelect && draft.childId) {
            childSelect.value = draft.childId;
        }

        // Restore mood selection
        if (draft.mood) {
            document.querySelectorAll('.mood-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.mood === draft.mood) {
                    btn.classList.add('selected');
                }
            });
        }

        // Restore activities
        if (draft.activities) {
            document.querySelectorAll('input[name="activities"]').forEach(checkbox => {
                checkbox.checked = draft.activities.includes(checkbox.value);
            });
        }

        // Restore other form fields
        Object.keys(draft).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && key !== 'childId' && key !== 'mood' && key !== 'activities') {
                input.value = draft[key];
            }
        });
    }

    // Utility methods
    formatTime(timeString) {
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString('he-IL', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = document.createElement('i');
        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                break;
            default:
                icon.className = 'fas fa-info-circle';
        }
        
        const text = document.createElement('span');
        text.textContent = message;
        
        notification.appendChild(icon);
        notification.appendChild(text);
        notifications.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide notification
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        this.showNotification(`שגיאה: ${error.message}`, 'error');
    }

    // Loading states
    showLoading(element) {
        if (element) {
            element.classList.add('loading');
        }
    }

    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BabyCheckApp();
});

// Export for use in other modules
window.BabyCheckApp = BabyCheckApp; 