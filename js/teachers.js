// Teachers View Controller
class TeachersView {
    static init() {
        this.loadChildren();
        this.setupEventListeners();
        this.loadTodayActivities();
        this.setupMoodButtons();
        this.setupSleepQualityButtons();
        this.setupTimeButtons();
        this.setCurrentTime();
    }

    static setupEventListeners() {
        // Form submission
        const form = document.getElementById('activity-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Add child button
        const addChildBtn = document.getElementById('add-child-btn');
        if (addChildBtn) {
            addChildBtn.addEventListener('click', () => {
                app.showModal('add-child-modal');
            });
        }

        // Add child form
        const addChildForm = document.getElementById('add-child-form');
        if (addChildForm) {
            addChildForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddChild();
            });
        }

        // Form reset
        const resetBtn = form?.querySelector('button[type="reset"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.clearFormDraft();
            });
        }

        // Child selection change
        const childSelect = document.getElementById('child-select');
        if (childSelect) {
            childSelect.addEventListener('change', () => {
                this.onChildSelectionChange();
            });
        }
    }

    static setupTimeButtons() {
        // Time picker buttons
        document.querySelectorAll('.time-edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const fieldId = this.dataset.timeField || this.getAttribute('data-time-field');
                if (fieldId) {
                    TeachersView.showTimePicker(fieldId);
                } else {
                    // Fallback for onclick attributes
                    const onclickAttr = this.getAttribute('onclick');
                    if (onclickAttr) {
                        const match = onclickAttr.match(/'([^']+)'/);
                        if (match) {
                            TeachersView.showTimePicker(match[1]);
                        }
                    }
                }
            });
        });

        // Quick time buttons
        document.querySelectorAll('.quick-time-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const fieldId = this.dataset.field || this.getAttribute('data-field');
                const time = this.dataset.time || this.getAttribute('data-time');
                if (fieldId && time) {
                    TeachersView.setQuickTime(fieldId, time);
                } else {
                    // Fallback for onclick attributes
                    const onclickAttr = this.getAttribute('onclick');
                    if (onclickAttr) {
                        const matches = onclickAttr.match(/'([^']+)'/g);
                        if (matches && matches.length >= 2) {
                            const field = matches[0].replace(/'/g, '');
                            const timeVal = matches[1].replace(/'/g, '');
                            TeachersView.setQuickTime(field, timeVal);
                        }
                    }
                }
            });
        });
    }

    static setupMoodButtons() {
        const moodButtons = document.querySelectorAll('.mood-btn');
        moodButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove selected class from all buttons
                moodButtons.forEach(b => b.classList.remove('selected'));
                // Add selected class to clicked button
                btn.classList.add('selected');
            });
        });
    }

    static setupSleepQualityButtons() {
        const sleepQualityButtons = document.querySelectorAll('.sleep-quality-btn');
        sleepQualityButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove selected class from all buttons
                sleepQualityButtons.forEach(b => b.classList.remove('selected'));
                // Add selected class to clicked button
                btn.classList.add('selected');
            });
        });
    }

    static showTimePicker(fieldId) {
        // Close any existing time picker
        this.closeTimePicker();
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'time-picker-modal';
        
        const currentTime = document.getElementById(fieldId).value || '12:00';
        const [hours, minutes] = currentTime.split(':');
        
        modal.innerHTML = `
            <div class="modal-content time-picker-content">
                <div class="modal-header">
                    <h3>בחר שעה</h3>
                    <button class="modal-close" id="close-time-picker">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="time-picker">
                        <div class="time-display-large">
                            <span id="selected-time">${currentTime}</span>
                        </div>
                        <div class="time-controls">
                            <div class="time-section">
                                <label>שעות:</label>
                                <div class="time-buttons hours-buttons">
                                    ${this.generateHourButtons(hours)}
                                </div>
                            </div>
                            <div class="time-section">
                                <label>דקות:</label>
                                <div class="time-buttons minutes-buttons">
                                    ${this.generateMinuteButtons(minutes)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="cancel-time-picker">ביטול</button>
                    <button class="btn-primary" id="confirm-time-picker">אישור</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('close-time-picker').addEventListener('click', () => {
            this.closeTimePicker();
        });
        
        document.getElementById('cancel-time-picker').addEventListener('click', () => {
            this.closeTimePicker();
        });
        
        document.getElementById('confirm-time-picker').addEventListener('click', () => {
            this.confirmTimePicker(fieldId);
        });

        // Add event listeners for time buttons
        this.setupTimePickerEvents();
    }

    static generateHourButtons(selectedHour) {
        let buttons = '';
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            const isSelected = hour === selectedHour;
            buttons += `<button class="time-btn ${isSelected ? 'selected' : ''}" data-hour="${hour}">${hour}</button>`;
        }
        return buttons;
    }

    static generateMinuteButtons(selectedMinute) {
        let buttons = '';
        for (let i = 0; i < 60; i += 5) {
            const minute = i.toString().padStart(2, '0');
            const isSelected = minute === selectedMinute;
            buttons += `<button class="time-btn ${isSelected ? 'selected' : ''}" data-minute="${minute}">${minute}</button>`;
        }
        return buttons;
    }

    static setupTimePickerEvents() {
        // Hour buttons
        document.querySelectorAll('.hours-buttons .time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.hours-buttons .time-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.updateTimeDisplay();
            });
        });

        // Minute buttons
        document.querySelectorAll('.minutes-buttons .time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.minutes-buttons .time-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.updateTimeDisplay();
            });
        });
    }

    static updateTimeDisplay() {
        const selectedHour = document.querySelector('.hours-buttons .time-btn.selected')?.dataset.hour || '00';
        const selectedMinute = document.querySelector('.minutes-buttons .time-btn.selected')?.dataset.minute || '00';
        const timeDisplay = document.getElementById('selected-time');
        if (timeDisplay) {
            timeDisplay.textContent = `${selectedHour}:${selectedMinute}`;
        }
    }

    static confirmTimePicker(fieldId) {
        const selectedHour = document.querySelector('.hours-buttons .time-btn.selected')?.dataset.hour || '00';
        const selectedMinute = document.querySelector('.minutes-buttons .time-btn.selected')?.dataset.minute || '00';
        const selectedTime = `${selectedHour}:${selectedMinute}`;

        // Update the hidden input
        document.getElementById(fieldId).value = selectedTime;

        // Update the display
        const displayId = `${fieldId}-display`;
        const displayElement = document.getElementById(displayId);
        if (displayElement) {
            const timeText = displayElement.querySelector('.time-text');
            if (timeText) {
                timeText.textContent = selectedTime;
            }
        }

        this.closeTimePicker();
    }

    static closeTimePicker() {
        const modal = document.getElementById('time-picker-modal');
        if (modal) {
            modal.remove();
        }
    }

    static setQuickTime(fieldId, time) {
        console.log('Setting quick time:', fieldId, time);
        
        // Update the hidden input
        const hiddenInput = document.getElementById(fieldId);
        if (hiddenInput) {
            hiddenInput.value = time;
        }

        // Update the display
        const displayId = `${fieldId}-display`;
        const displayElement = document.getElementById(displayId);
        if (displayElement) {
            const timeText = displayElement.querySelector('.time-text');
            if (timeText) {
                timeText.textContent = time;
            }
        }

        // Add visual feedback
        const display = document.getElementById(displayId);
        if (display) {
            display.classList.add('time-updated');
            setTimeout(() => {
                display.classList.remove('time-updated');
            }, 500);
        }
    }

    static setCurrentTime() {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        
        // Set current time in time inputs
        const timeInputs = document.querySelectorAll('input[type="time"]');
        timeInputs.forEach(input => {
            if (!input.value) {
                input.value = timeString;
            }
        });
    }

    static loadChildren() {
        const children = storage.getChildren();
        const childSelect = document.getElementById('child-select');
        const parentChildSelect = document.getElementById('parent-child-select');
        
        if (childSelect) {
            childSelect.innerHTML = '<option value="">בחר ילד/ה</option>';
            children.forEach(child => {
                const option = document.createElement('option');
                option.value = child.id;
                option.textContent = `${child.name} (${child.age} שנים)`;
                childSelect.appendChild(option);
            });
        }

        if (parentChildSelect) {
            parentChildSelect.innerHTML = '<option value="">בחר ילד/ה</option>';
            children.forEach(child => {
                const option = document.createElement('option');
                option.value = child.id;
                option.textContent = `${child.name} (${child.age} שנים)`;
                parentChildSelect.appendChild(option);
            });
        }
    }

    static handleFormSubmit() {
        console.log('Form submitted');
        const formData = this.getFormData();
        console.log('Form data:', formData);
        
        if (!formData.childId) {
            app.showNotification('אנא בחר ילד/ה', 'error');
            return;
        }

        // Validate required fields based on activity type
        if (!this.validateFormData(formData)) {
            return;
        }

        // Create activity objects for each filled section
        const activities = this.createActivitiesFromForm(formData);
        
        if (activities.length === 0) {
            app.showNotification('אנא מלא לפחות פעילות אחת', 'error');
            return;
        }

        // Save activities
        let savedCount = 0;
        activities.forEach(activity => {
            if (storage.addActivity(activity)) {
                savedCount++;
            }
        });

        if (savedCount > 0) {
            app.showNotification(`נשמרו ${savedCount} פעילויות בהצלחה!`, 'success');
            this.resetForm();
            this.loadTodayActivities();
        } else {
            app.showNotification('שגיאה בשמירת הפעילויות', 'error');
        }
    }

    static getFormData() {
        const form = document.getElementById('activity-form');
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        // Get all form fields
        for (let [key, value] of formData.entries()) {
            if (value) {
                data[key] = value;
            }
        }

        // Get selected mood
        const selectedMood = document.querySelector('.mood-btn.selected');
        if (selectedMood) {
            data.mood = selectedMood.dataset.mood;
        }

        // Get selected sleep quality
        const selectedSleepQuality = document.querySelector('.sleep-quality-btn.selected');
        if (selectedSleepQuality) {
            data['sleep-quality'] = selectedSleepQuality.dataset.quality;
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

        // Get time values from hidden inputs
        data['sleep-start'] = document.getElementById('sleep-start')?.value || '';
        data['sleep-end'] = document.getElementById('sleep-end')?.value || '';

        console.log('Processed form data:', data);
        return data;
    }

    static validateFormData(data) {
        console.log('Validating form data:', data);
        
        // Check if at least one activity type is filled
        const hasEating = data['meal-type'] && data['meal-amount'];
        const hasDrinking = data['drink-type'] && data['drink-amount'] && parseFloat(data['drink-amount']) > 0;
        const hasSleeping = data['sleep-start'] && data['sleep-end'];
        const hasBathroom = data['bathroom-count'] && parseInt(data['bathroom-count']) > 0;
        const hasMood = data.mood;
        const hasActivities = data.activities && data.activities.length > 0;

        console.log('Validation checks:', {
            hasEating, hasDrinking, hasSleeping, hasBathroom, hasMood, hasActivities
        });

        if (!hasEating && !hasDrinking && !hasSleeping && !hasBathroom && !hasMood && !hasActivities) {
            app.showNotification('אנא מלא לפחות פעילות אחת', 'error');
            return false;
        }

        // Validate sleep times if both are provided
        if (hasSleeping) {
            const startTime = new Date(`2000-01-01T${data['sleep-start']}`);
            const endTime = new Date(`2000-01-01T${data['sleep-end']}`);
            
            if (startTime >= endTime) {
                // Allow overnight sleep by adding 24 hours to end time
                endTime.setDate(endTime.getDate() + 1);
            }
        }

        return true;
    }

    static createActivitiesFromForm(formData) {
        const activities = [];
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentDate = now.toISOString().split('T')[0];

        console.log('Creating activities from form data:', formData);

        // Eating activity
        if (formData['meal-type'] && formData['meal-amount']) {
            activities.push({
                childId: formData.childId,
                date: currentDate,
                time: currentTime,
                type: 'eating',
                data: {
                    mealType: formData['meal-type'],
                    mealAmount: formData['meal-amount'],
                    notes: formData['meal-notes'] || ''
                }
            });
        }

        // Drinking activity
        if (formData['drink-type'] && formData['drink-amount']) {
            activities.push({
                childId: formData.childId,
                date: currentDate,
                time: currentTime,
                type: 'drinking',
                data: {
                    drinkType: formData['drink-type'],
                    amount: parseFloat(formData['drink-amount']) || 0
                }
            });
        }

        // Sleeping activity
        if (formData['sleep-start'] && formData['sleep-end']) {
            activities.push({
                childId: formData.childId,
                date: currentDate,
                time: formData['sleep-start'], // Use sleep start time as activity time
                type: 'sleeping',
                data: {
                    sleepStart: formData['sleep-start'],
                    sleepEnd: formData['sleep-end'],
                    sleepQuality: formData['sleep-quality'] || 'good'
                }
            });
        }

        // Bathroom activity
        if (formData['bathroom-count'] && parseInt(formData['bathroom-count']) > 0) {
            activities.push({
                childId: formData.childId,
                date: currentDate,
                time: currentTime,
                type: 'bathroom',
                data: {
                    count: parseInt(formData['bathroom-count']),
                    type: formData['bathroom-type'] || 'wet',
                    notes: formData['bathroom-notes'] || ''
                }
            });
        }

        // Mood activity
        if (formData.mood) {
            activities.push({
                childId: formData.childId,
                date: currentDate,
                time: currentTime,
                type: 'mood',
                data: {
                    mood: formData.mood,
                    cryingLevel: formData['crying-level'] || 'none'
                }
            });
        }

        // Activities
        if (formData.activities && formData.activities.length > 0) {
            activities.push({
                childId: formData.childId,
                date: currentDate,
                time: currentTime,
                type: 'activities',
                data: {
                    activities: formData.activities,
                    notes: formData['activity-notes'] || ''
                }
            });
        }

        console.log('Created activities:', activities);
        return activities;
    }

    static resetForm() {
        const form = document.getElementById('activity-form');
        if (form) {
            form.reset();
            
            // Clear mood selection
            document.querySelectorAll('.mood-btn').forEach(btn => {
                btn.classList.remove('selected');
            });

            // Clear sleep quality selection
            document.querySelectorAll('.sleep-quality-btn').forEach(btn => {
                btn.classList.remove('selected');
            });

            // Clear time displays
            document.querySelectorAll('.time-text').forEach(timeText => {
                timeText.textContent = '--:--';
            });

            // Clear hidden time inputs
            document.getElementById('sleep-start').value = '';
            document.getElementById('sleep-end').value = '';

            // Clear form draft
            this.clearFormDraft();
            
            // Set current time
            this.setCurrentTime();
        }
    }

    static clearFormDraft() {
        storage.clearFormDraft();
    }

    static onChildSelectionChange() {
        const childSelect = document.getElementById('child-select');
        if (childSelect && childSelect.value) {
            // Load any existing draft for this child
            const draft = storage.getFormDraft();
            if (draft && draft.childId === childSelect.value) {
                this.loadFormDraft(draft);
            }
        }
    }

    static loadFormDraft(draft) {
        const form = document.getElementById('activity-form');
        if (!form) return;

        // Restore mood selection
        if (draft.mood) {
            document.querySelectorAll('.mood-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.mood === draft.mood) {
                    btn.classList.add('selected');
                }
            });
        }

        // Restore sleep quality selection
        if (draft['sleep-quality']) {
            document.querySelectorAll('.sleep-quality-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.quality === draft['sleep-quality']) {
                    btn.classList.add('selected');
                }
            });
        }

        // Restore time displays
        if (draft['sleep-start']) {
            const startDisplay = document.getElementById('sleep-start-display');
            if (startDisplay) {
                const timeText = startDisplay.querySelector('.time-text');
                if (timeText) {
                    timeText.textContent = draft['sleep-start'];
                }
            }
        }

        if (draft['sleep-end']) {
            const endDisplay = document.getElementById('sleep-end-display');
            if (endDisplay) {
                const timeText = endDisplay.querySelector('.time-text');
                if (timeText) {
                    timeText.textContent = draft['sleep-end'];
                }
            }
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

    static loadTodayActivities() {
        const today = new Date().toISOString().split('T')[0];
        const activities = storage.getActivities({ date: today });
        this.displayActivities(activities);
    }

    static displayActivities(activities) {
        const activitiesList = document.getElementById('activities-list');
        if (!activitiesList) return;

        if (activities.length === 0) {
            activitiesList.innerHTML = '<p class="no-activities">אין פעילויות היום</p>';
            return;
        }

        // Group activities by child
        const activitiesByChild = {};
        activities.forEach(activity => {
            if (!activitiesByChild[activity.childId]) {
                activitiesByChild[activity.childId] = [];
            }
            activitiesByChild[activity.childId].push(activity);
        });

        activitiesList.innerHTML = '';

        Object.keys(activitiesByChild).forEach(childId => {
            const child = storage.getChild(childId);
            const childActivities = activitiesByChild[childId];
            
            const childSection = document.createElement('div');
            childSection.className = 'child-activities-section';
            
            const childHeader = document.createElement('h4');
            childHeader.textContent = child ? child.name : 'ילד לא ידוע';
            childHeader.className = 'child-header';
            childSection.appendChild(childHeader);

            childActivities.forEach(activity => {
                const activityElement = this.createActivityElement(activity);
                childSection.appendChild(activityElement);
            });

            activitiesList.appendChild(childSection);
        });
    }

    static createActivityElement(activity) {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.dataset.activityId = activity.id;

        const child = storage.getChild(activity.childId);
        const activityData = activity.data;

        let activityContent = '';
        let activityIcon = '';
        let activityColor = '';

        switch (activity.type) {
            case 'eating':
                activityIcon = 'fas fa-utensils';
                activityColor = '#FF9800';
                activityContent = this.formatEatingActivity(activityData);
                break;
            case 'drinking':
                activityIcon = 'fas fa-tint';
                activityColor = '#2196F3';
                activityContent = this.formatDrinkingActivity(activityData);
                break;
            case 'sleeping':
                activityIcon = 'fas fa-bed';
                activityColor = '#9C27B0';
                activityContent = this.formatSleepingActivity(activityData);
                break;
            case 'bathroom':
                activityIcon = 'fas fa-bath';
                activityColor = '#4CAF50';
                activityContent = this.formatBathroomActivity(activityData);
                break;
            case 'mood':
                activityIcon = 'fas fa-smile';
                activityColor = '#FF5722';
                activityContent = this.formatMoodActivity(activityData);
                break;
            case 'activities':
                activityIcon = 'fas fa-gamepad';
                activityColor = '#607D8B';
                activityContent = this.formatActivitiesActivity(activityData);
                break;
        }

        activityElement.innerHTML = `
            <div class="activity-header">
                <div class="activity-child">
                    <i class="${activityIcon}" style="color: ${activityColor}"></i>
                    ${child ? child.name : 'ילד לא ידוע'}
                </div>
                <div class="activity-time">${app.formatTime(activity.time)}</div>
            </div>
            <div class="activity-details">
                ${activityContent}
            </div>
            <div class="activity-actions">
                <button class="btn-secondary btn-sm edit-activity-btn" data-activity-id="${activity.id}">
                    <i class="fas fa-edit"></i> ערוך
                </button>
                <button class="btn-secondary btn-sm delete-activity-btn" data-activity-id="${activity.id}">
                    <i class="fas fa-trash"></i> מחק
                </button>
            </div>
        `;

        // Add event listeners to action buttons
        const editBtn = activityElement.querySelector('.edit-activity-btn');
        const deleteBtn = activityElement.querySelector('.delete-activity-btn');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editActivity(activity.id);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteActivity(activity.id);
            });
        }

        return activityElement;
    }

    static formatEatingActivity(data) {
        const mealTypes = {
            breakfast: 'ארוחת בוקר',
            lunch: 'ארוחת צהריים',
            snack: 'חטיף'
        };
        const mealAmounts = {
            all: 'אכל הכל',
            half: 'חצי',
            little: 'קצת',
            none: 'לא אכל'
        };
        
        return `
            <div class="activity-detail">
                <i class="fas fa-utensils"></i>
                <span>${mealTypes[data.mealType] || data.mealType} - ${mealAmounts[data.mealAmount] || data.mealAmount}</span>
            </div>
            ${data.notes ? `<div class="activity-detail"><i class="fas fa-comment"></i><span>${data.notes}</span></div>` : ''}
        `;
    }

    static formatDrinkingActivity(data) {
        const drinkTypes = {
            water: 'מים',
            juice: 'מיץ',
            milk: 'חלב'
        };
        
        return `
            <div class="activity-detail">
                <i class="fas fa-tint"></i>
                <span>${drinkTypes[data.drinkType] || data.drinkType} - ${data.amount} כוסות</span>
            </div>
        `;
    }

    static formatSleepingActivity(data) {
        return `
            <div class="activity-detail">
                <i class="fas fa-bed"></i>
                <span>${data.sleepStart} - ${data.sleepEnd}</span>
            </div>
            <div class="activity-detail">
                <i class="fas fa-star"></i>
                <span>${data.sleepQuality === 'good' ? 'שינה שקטה' : 'שינה חסרת מנוחה'}</span>
            </div>
        `;
    }

    static formatBathroomActivity(data) {
        const types = {
            wet: 'רטוב',
            dry: 'יבש'
        };
        
        return `
            <div class="activity-detail">
                <i class="fas fa-bath"></i>
                <span>${data.count} פעמים - ${types[data.type] || data.type}</span>
            </div>
            ${data.notes ? `<div class="activity-detail"><i class="fas fa-comment"></i><span>${data.notes}</span></div>` : ''}
        `;
    }

    static formatMoodActivity(data) {
        const moods = {
            happy: 'שמח 😊',
            sad: 'עצוב 😢',
            angry: 'עצבני 😠',
            calm: 'רגוע 😌'
        };
        const cryingLevels = {
            none: 'לא בכה',
            little: 'בכה קצת',
            much: 'בכה הרבה'
        };
        
        return `
            <div class="activity-detail">
                <i class="fas fa-smile"></i>
                <span>${moods[data.mood] || data.mood}</span>
            </div>
            <div class="activity-detail">
                <i class="fas fa-tear"></i>
                <span>${cryingLevels[data.cryingLevel] || data.cryingLevel}</span>
            </div>
        `;
    }

    static formatActivitiesActivity(data) {
        const activityTypes = {
            'free-play': 'משחק חופשי',
            'structured-play': 'משחק מובנה',
            'art': 'יצירה וציור',
            'music': 'שירים וסיפורים',
            'outdoor': 'משחק בחצר'
        };
        
        const activitiesList = data.activities.map(activity => 
            activityTypes[activity] || activity
        ).join(', ');
        
        return `
            <div class="activity-detail">
                <i class="fas fa-gamepad"></i>
                <span>${activitiesList}</span>
            </div>
            ${data.notes ? `<div class="activity-detail"><i class="fas fa-comment"></i><span>${data.notes}</span></div>` : ''}
        `;
    }

    static handleAddChild() {
        const form = document.getElementById('add-child-form');
        const formData = new FormData(form);
        
        const childData = {
            name: formData.get('new-child-name'),
            age: parseInt(formData.get('new-child-age'))
        };

        if (!childData.name || !childData.age) {
            app.showNotification('אנא מלא את כל השדות', 'error');
            return;
        }

        const newChild = storage.addChild(childData);
        if (newChild) {
            app.showNotification('ילד נוסף בהצלחה!', 'success');
            this.loadChildren();
            app.closeModal();
            form.reset();
        } else {
            app.showNotification('שגיאה בהוספת ילד', 'error');
        }
    }

    static editActivity(activityId) {
        // TODO: Implement activity editing
        app.showNotification('עריכת פעילות - תכונה בהכנה', 'info');
    }

    static deleteActivity(activityId) {
        if (confirm('האם אתה בטוח שברצונך למחוק פעילות זו?')) {
            storage.deleteActivity(activityId);
            app.showNotification('פעילות נמחקה בהצלחה', 'success');
            this.loadTodayActivities();
        }
    }
}

// Export for use in other modules
window.TeachersView = TeachersView;