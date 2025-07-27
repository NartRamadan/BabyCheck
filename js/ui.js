// UI Utilities and Helpers
class UIHelper {
    static init() {
        this.setupGlobalEventListeners();
        this.initializeTooltips();
        this.setupKeyboardShortcuts();
    }

    static setupGlobalEventListeners() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Handle form validation
        document.addEventListener('input', (e) => {
            this.validateField(e.target);
        });

        // Handle form submission
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('needs-validation')) {
                e.preventDefault();
                this.validateForm(e.target);
            }
        });

        // Handle button clicks with loading states
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-loading')) {
                this.showButtonLoading(e.target);
            }
        });
    }

    static initializeTooltips() {
        // Initialize tooltips for elements with data-tooltip attribute
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target);
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip(e.target);
            });
        });
    }

    static setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.handleSaveShortcut();
            }

            // Ctrl/Cmd + N to add new child
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.handleNewChildShortcut();
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }

            // Tab navigation in forms
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    static showTooltip(element) {
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        tooltip.id = 'current-tooltip';

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';

        setTimeout(() => {
            tooltip.classList.add('show');
        }, 10);
    }

    static hideTooltip(element) {
        const tooltip = document.getElementById('current-tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 200);
        }
    }

    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Focus first input in modal
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    static closeModal(modal) {
        if (!modal) return;

        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);

        // Restore body scroll
        document.body.style.overflow = '';
    }

    static closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            this.closeModal(modal);
        });
    }

    static validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error state
        this.removeFieldError(field);

        // Validation rules
        switch (fieldType) {
            case 'text':
            case 'textarea':
                if (field.hasAttribute('required') && !value) {
                    isValid = false;
                    errorMessage = 'שדה זה הוא חובה';
                } else if (field.hasAttribute('minlength')) {
                    const minLength = parseInt(field.getAttribute('minlength'));
                    if (value.length < minLength) {
                        isValid = false;
                        errorMessage = `מינימום ${minLength} תווים`;
                    }
                }
                break;

            case 'number':
                if (field.hasAttribute('required') && !value) {
                    isValid = false;
                    errorMessage = 'שדה זה הוא חובה';
                } else if (value && isNaN(value)) {
                    isValid = false;
                    errorMessage = 'אנא הכנס מספר תקין';
                } else if (field.hasAttribute('min')) {
                    const min = parseFloat(field.getAttribute('min'));
                    if (parseFloat(value) < min) {
                        isValid = false;
                        errorMessage = `ערך מינימלי: ${min}`;
                    }
                } else if (field.hasAttribute('max')) {
                    const max = parseFloat(field.getAttribute('max'));
                    if (parseFloat(value) > max) {
                        isValid = false;
                        errorMessage = `ערך מקסימלי: ${max}`;
                    }
                }
                break;

            case 'email':
                if (field.hasAttribute('required') && !value) {
                    isValid = false;
                    errorMessage = 'שדה זה הוא חובה';
                } else if (value && !this.isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'אנא הכנס כתובת אימייל תקינה';
                }
                break;

            case 'tel':
                if (field.hasAttribute('required') && !value) {
                    isValid = false;
                    errorMessage = 'שדה זה הוא חובה';
                } else if (value && !this.isValidPhone(value)) {
                    isValid = false;
                    errorMessage = 'אנא הכנס מספר טלפון תקין';
                }
                break;
        }

        // Apply validation result
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    static validateForm(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (isValid) {
            // Remove validation class and submit
            form.classList.remove('needs-validation');
            form.submit();
        } else {
            // Add validation class
            form.classList.add('needs-validation');
            
            // Focus first invalid field
            const firstInvalidField = form.querySelector('.error');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }

        return isValid;
    }

    static showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.add('error');
        field.classList.add('error');

        // Create or update error message
        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    static removeFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('error');
        field.classList.remove('error');

        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    static showButtonLoading(button) {
        const originalText = button.innerHTML;
        const spinner = '<i class="fas fa-spinner fa-spin"></i>';
        
        button.disabled = true;
        button.innerHTML = spinner + ' טוען...';
        button.dataset.originalText = originalText;

        // Re-enable after 3 seconds (or when operation completes)
        setTimeout(() => {
            this.hideButtonLoading(button);
        }, 3000);
    }

    static hideButtonLoading(button) {
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
        button.disabled = false;
    }

    static showLoadingOverlay(message = 'טוען...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        overlay.id = 'loading-overlay';
        document.body.appendChild(overlay);
    }

    static hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    static showConfirmationDialog(message, onConfirm, onCancel) {
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog modal show';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>אישור</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="cancel-btn">ביטול</button>
                    <button class="btn-primary" id="confirm-btn">אישור</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('#confirm-btn').addEventListener('click', () => {
            dialog.remove();
            if (onConfirm) onConfirm();
        });

        dialog.querySelector('#cancel-btn').addEventListener('click', () => {
            dialog.remove();
            if (onCancel) onCancel();
        });

        // Close on backdrop click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
                if (onCancel) onCancel();
            }
        });
    }

    static showInputDialog(title, placeholder, onConfirm, onCancel) {
        const dialog = document.createElement('div');
        dialog.className = 'input-dialog modal show';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <input type="text" class="form-control" placeholder="${placeholder}" id="input-value">
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="cancel-btn">ביטול</button>
                    <button class="btn-primary" id="confirm-btn">אישור</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const input = dialog.querySelector('#input-value');
        input.focus();

        dialog.querySelector('#confirm-btn').addEventListener('click', () => {
            const value = input.value.trim();
            dialog.remove();
            if (onConfirm) onConfirm(value);
        });

        dialog.querySelector('#cancel-btn').addEventListener('click', () => {
            dialog.remove();
            if (onCancel) onCancel();
        });

        // Handle Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = input.value.trim();
                dialog.remove();
                if (onConfirm) onConfirm(value);
            }
        });

        // Close on backdrop click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
                if (onCancel) onCancel();
            }
        });
    }

    static handleSaveShortcut() {
        // Trigger save in current view
        if (app.currentView === 'teachers') {
            const form = document.getElementById('activity-form');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    }

    static handleNewChildShortcut() {
        if (app.currentView === 'teachers') {
            app.showModal('add-child-modal');
        }
    }

    static handleTabNavigation(event) {
        const form = event.target.closest('form');
        if (!form) return;

        const fields = Array.from(form.querySelectorAll('input, select, textarea, button'))
            .filter(field => !field.disabled && field.offsetParent !== null);

        const currentIndex = fields.indexOf(event.target);
        const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;

        if (nextIndex >= 0 && nextIndex < fields.length) {
            event.preventDefault();
            fields[nextIndex].focus();
        }
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,}$/;
        return phoneRegex.test(phone);
    }

    static formatNumber(number, decimals = 0) {
        return new Intl.NumberFormat('he-IL', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    static formatCurrency(amount, currency = 'ILS') {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return new Intl.DateTimeFormat('he-IL', { ...defaultOptions, ...options }).format(date);
    }

    static formatTime(time, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Intl.DateTimeFormat('he-IL', { ...defaultOptions, ...options }).format(time);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    static downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    static scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    static isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    static addIntersectionObserver(element, callback, options = {}) {
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver(callback, { ...defaultOptions, ...options });
        observer.observe(element);
        return observer;
    }

    static createElement(tag, className, innerHTML) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    static removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    static toggleElement(element, show) {
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    }

    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 300) {
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Initialize UI helper when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UIHelper.init();
});

// Export for use in other modules
window.UIHelper = UIHelper; 