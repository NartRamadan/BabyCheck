// Parents View Controller
class ParentsView {
    static init() {
        this.setupEventListeners();
        this.setDefaultDate();
        this.loadChildren();
    }

    static setupEventListeners() {
        // Load activities button
        const loadBtn = document.getElementById('load-activities-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                this.loadChildActivities();
            });
        }

        // Child selection change
        const childSelect = document.getElementById('parent-child-select');
        if (childSelect) {
            childSelect.addEventListener('change', () => {
                this.onChildSelectionChange();
            });
        }

        // Date selection change
        const dateSelect = document.getElementById('date-select');
        if (dateSelect) {
            dateSelect.addEventListener('change', () => {
                this.onDateSelectionChange();
            });
        }

        // Auto-refresh every 5 minutes
        setInterval(() => {
            if (this.currentChildId && this.currentDate) {
                this.loadChildActivities();
            }
        }, 5 * 60 * 1000);
    }

    static setDefaultDate() {
        const dateSelect = document.getElementById('date-select');
        if (dateSelect) {
            const today = new Date().toISOString().split('T')[0];
            dateSelect.value = today;
            this.currentDate = today;
        }
    }

    static loadChildren() {
        const children = storage.getChildren();
        const childSelect = document.getElementById('parent-child-select');
        
        if (childSelect) {
            childSelect.innerHTML = '<option value="">בחר ילד/ה</option>';
            children.forEach(child => {
                const option = document.createElement('option');
                option.value = child.id;
                option.textContent = `${child.name} (${child.age} שנים)`;
                childSelect.appendChild(option);
            });
        }
    }

    static onChildSelectionChange() {
        const childSelect = document.getElementById('parent-child-select');
        if (childSelect && childSelect.value) {
            this.currentChildId = childSelect.value;
            this.loadChildActivities();
        }
    }

    static onDateSelectionChange() {
        const dateSelect = document.getElementById('date-select');
        if (dateSelect && dateSelect.value) {
            this.currentDate = dateSelect.value;
            if (this.currentChildId) {
                this.loadChildActivities();
            }
        }
    }

    static loadChildActivities() {
        if (!this.currentChildId || !this.currentDate) {
            app.showNotification('אנא בחר ילד/ה ותאריך', 'warning');
            return;
        }

        app.showLoading(document.getElementById('load-activities-btn'));
        
        try {
            // Get activities for the selected child and date
            const activities = storage.getActivities({
                childId: this.currentChildId,
                date: this.currentDate
            });

            // Get daily summary
            const summary = storage.getDailySummary(this.currentChildId, this.currentDate);

            // Display the data
            this.displayChildSummary(summary);
            this.displayTimeline(activities);
            this.displayDetailedActivities(activities);

            // Show the summary section
            const summarySection = document.getElementById('child-summary');
            if (summarySection) {
                summarySection.classList.remove('hidden');
            }

            app.hideLoading(document.getElementById('load-activities-btn'));
            
            if (activities.length === 0) {
                app.showNotification('אין פעילויות לתאריך זה', 'info');
            } else {
                app.showNotification(`נטענו ${activities.length} פעילויות`, 'success');
            }

        } catch (error) {
            app.hideLoading(document.getElementById('load-activities-btn'));
            app.handleError(error, 'ParentsView.loadChildActivities');
        }
    }

    static displayChildSummary(summary) {
        // Eating summary
        const eatingSummary = document.getElementById('eating-summary');
        if (eatingSummary) {
            eatingSummary.innerHTML = this.formatEatingSummary(summary.eating);
        }

        // Drinking summary
        const drinkingSummary = document.getElementById('drinking-summary');
        if (drinkingSummary) {
            drinkingSummary.innerHTML = this.formatDrinkingSummary(summary.drinking);
        }

        // Sleeping summary
        const sleepingSummary = document.getElementById('sleeping-summary');
        if (sleepingSummary) {
            sleepingSummary.innerHTML = this.formatSleepingSummary(summary.sleeping);
        }

        // Mood summary
        const moodSummary = document.getElementById('mood-summary');
        if (moodSummary) {
            moodSummary.innerHTML = this.formatMoodSummary(summary.mood);
        }

        // Update summary date
        const summaryDate = document.querySelector('.summary-date');
        if (summaryDate) {
            summaryDate.textContent = app.formatDate(this.currentDate);
        }
    }

    static formatEatingSummary(eating) {
        if (eating.totalMeals === 0) {
            return '<span>אין נתוני אכילה</span>';
        }

        const averageText = eating.averageAmount > 75 ? 'אכל טוב מאוד' :
                           eating.averageAmount > 50 ? 'אכל בינוני' :
                           eating.averageAmount > 25 ? 'אכל מעט' : 'כמעט לא אכל';

        return `
            <div class="summary-item">
                <strong>${eating.totalMeals} ארוחות</strong>
            </div>
            <div class="summary-item">
                <span>${averageText}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${eating.averageAmount}%"></div>
            </div>
        `;
    }

    static formatDrinkingSummary(drinking) {
        if (drinking.totalDrinks === 0) {
            return '<span>אין נתוני שתייה</span>';
        }

        return `
            <div class="summary-item">
                <strong>${drinking.totalDrinks} פעמים</strong>
            </div>
            <div class="summary-item">
                <span>סה"כ ${drinking.totalAmount} כוסות</span>
            </div>
            <div class="summary-item">
                <span>ממוצע ${(drinking.totalAmount / drinking.totalDrinks).toFixed(1)} כוסות לפעם</span>
            </div>
        `;
    }

    static formatSleepingSummary(sleeping) {
        if (sleeping.sessions.length === 0) {
            return '<span>אין נתוני שינה</span>';
        }

        const totalHours = Math.floor(sleeping.totalSleepTime / 60);
        const totalMinutes = Math.round(sleeping.totalSleepTime % 60);
        const qualityText = sleeping.averageQuality === 'good' ? 'שינה שקטה' : 'שינה חסרת מנוחה';

        return `
            <div class="summary-item">
                <strong>${sleeping.sessions.length} פעמים</strong>
            </div>
            <div class="summary-item">
                <span>סה"כ ${totalHours} שעות ${totalMinutes} דקות</span>
            </div>
            <div class="summary-item">
                <span>${qualityText}</span>
            </div>
        `;
    }

    static formatMoodSummary(mood) {
        if (mood.moods.length === 0) {
            return '<span>אין נתוני מצב רוח</span>';
        }

        const moodEmojis = {
            happy: '😊',
            sad: '😢',
            angry: '😠',
            calm: '😌'
        };

        const averageMoodEmoji = moodEmojis[mood.averageMood] || '😐';

        return `
            <div class="summary-item">
                <strong>${mood.moods.length} בדיקות</strong>
            </div>
            <div class="summary-item">
                <span style="font-size: 1.5em;">${averageMoodEmoji}</span>
            </div>
            <div class="summary-item">
                <span>מצב רוח כללי: ${this.getMoodText(mood.averageMood)}</span>
            </div>
        `;
    }

    static getMoodText(mood) {
        const moodTexts = {
            happy: 'שמח',
            sad: 'עצוב',
            angry: 'עצבני',
            calm: 'רגוע'
        };
        return moodTexts[mood] || mood;
    }

    static displayTimeline(activities) {
        const timeline = document.getElementById('daily-timeline');
        if (!timeline) return;

        if (activities.length === 0) {
            timeline.innerHTML = '<p class="no-activities">אין פעילויות לתצוגה</p>';
            return;
        }

        // Sort activities by time
        const sortedActivities = activities.sort((a, b) => {
            const timeA = new Date(`2000-01-01T${a.time}`);
            const timeB = new Date(`2000-01-01T${b.time}`);
            return timeA - timeB;
        });

        timeline.innerHTML = '';

        sortedActivities.forEach(activity => {
            const timelineItem = this.createTimelineItem(activity);
            timeline.appendChild(timelineItem);
        });
    }

    static createTimelineItem(activity) {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';

        const child = storage.getChild(activity.childId);
        const activityData = activity.data;

        let activityContent = '';
        let activityIcon = '';
        let activityColor = '';

        switch (activity.type) {
            case 'eating':
                activityIcon = 'fas fa-utensils';
                activityColor = '#FF9800';
                activityContent = this.formatTimelineEating(activityData);
                break;
            case 'drinking':
                activityIcon = 'fas fa-tint';
                activityColor = '#2196F3';
                activityContent = this.formatTimelineDrinking(activityData);
                break;
            case 'sleeping':
                activityIcon = 'fas fa-bed';
                activityColor = '#9C27B0';
                activityContent = this.formatTimelineSleeping(activityData);
                break;
            case 'bathroom':
                activityIcon = 'fas fa-bath';
                activityColor = '#4CAF50';
                activityContent = this.formatTimelineBathroom(activityData);
                break;
            case 'mood':
                activityIcon = 'fas fa-smile';
                activityColor = '#FF5722';
                activityContent = this.formatTimelineMood(activityData);
                break;
            case 'activities':
                activityIcon = 'fas fa-gamepad';
                activityColor = '#607D8B';
                activityContent = this.formatTimelineActivities(activityData);
                break;
        }

        timelineItem.innerHTML = `
            <div class="timeline-time">${app.formatTime(activity.time)}</div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <i class="${activityIcon}" style="color: ${activityColor}"></i>
                    <span>${child ? child.name : 'ילד לא ידוע'}</span>
                </div>
                <div class="timeline-body">
                    ${activityContent}
                </div>
            </div>
        `;

        return timelineItem;
    }

    static formatTimelineEating(data) {
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
            <div><strong>${mealTypes[data.mealType] || data.mealType}</strong></div>
            <div>${mealAmounts[data.mealAmount] || data.mealAmount}</div>
            ${data.notes ? `<div class="timeline-notes">${data.notes}</div>` : ''}
        `;
    }

    static formatTimelineDrinking(data) {
        const drinkTypes = {
            water: 'מים',
            juice: 'מיץ',
            milk: 'חלב'
        };
        
        return `
            <div><strong>${drinkTypes[data.drinkType] || data.drinkType}</strong></div>
            <div>${data.amount} כוסות</div>
        `;
    }

    static formatTimelineSleeping(data) {
        return `
            <div><strong>שינה</strong></div>
            <div>${data.sleepStart} - ${data.sleepEnd}</div>
            <div>${data.sleepQuality === 'good' ? 'שינה שקטה' : 'שינה חסרת מנוחה'}</div>
        `;
    }

    static formatTimelineBathroom(data) {
        const types = {
            wet: 'רטוב',
            dry: 'יבש'
        };
        
        return `
            <div><strong>שירותים</strong></div>
            <div>${data.count} פעמים - ${types[data.type] || data.type}</div>
            ${data.notes ? `<div class="timeline-notes">${data.notes}</div>` : ''}
        `;
    }

    static formatTimelineMood(data) {
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
            <div><strong>מצב רוח</strong></div>
            <div>${moods[data.mood] || data.mood}</div>
            <div>${cryingLevels[data.cryingLevel] || data.cryingLevel}</div>
        `;
    }

    static formatTimelineActivities(data) {
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
            <div><strong>פעילויות</strong></div>
            <div>${activitiesList}</div>
            ${data.notes ? `<div class="timeline-notes">${data.notes}</div>` : ''}
        `;
    }

    static displayDetailedActivities(activities) {
        const detailedList = document.getElementById('detailed-activities-list');
        if (!detailedList) return;

        if (activities.length === 0) {
            detailedList.innerHTML = '<p class="no-activities">אין פעילויות מפורטות לתצוגה</p>';
            return;
        }

        // Group activities by type
        const activitiesByType = {};
        activities.forEach(activity => {
            if (!activitiesByType[activity.type]) {
                activitiesByType[activity.type] = [];
            }
            activitiesByType[activity.type].push(activity);
        });

        detailedList.innerHTML = '';

        Object.keys(activitiesByType).forEach(type => {
            const typeActivities = activitiesByType[type];
            const typeSection = this.createActivityTypeSection(type, typeActivities);
            detailedList.appendChild(typeSection);
        });
    }

    static createActivityTypeSection(type, activities) {
        const section = document.createElement('div');
        section.className = 'activity-type-section';

        const typeNames = {
            eating: 'אכילה',
            drinking: 'שתייה',
            sleeping: 'שינה',
            bathroom: 'שירותים',
            mood: 'מצב רוח',
            activities: 'פעילויות'
        };

        const typeIcons = {
            eating: 'fas fa-utensils',
            drinking: 'fas fa-tint',
            sleeping: 'fas fa-bed',
            bathroom: 'fas fa-bath',
            mood: 'fas fa-smile',
            activities: 'fas fa-gamepad'
        };

        const header = document.createElement('h4');
        header.innerHTML = `<i class="${typeIcons[type]}"></i> ${typeNames[type]} (${activities.length})`;
        section.appendChild(header);

        activities.forEach(activity => {
            const activityElement = this.createDetailedActivityElement(activity);
            section.appendChild(activityElement);
        });

        return section;
    }

    static createDetailedActivityElement(activity) {
        const element = document.createElement('div');
        element.className = 'detailed-activity-item';

        const child = storage.getChild(activity.childId);
        const activityData = activity.data;

        let activityContent = '';
        let activityIcon = '';

        switch (activity.type) {
            case 'eating':
                activityIcon = 'fas fa-utensils';
                activityContent = this.formatDetailedEating(activityData);
                break;
            case 'drinking':
                activityIcon = 'fas fa-tint';
                activityContent = this.formatDetailedDrinking(activityData);
                break;
            case 'sleeping':
                activityIcon = 'fas fa-bed';
                activityContent = this.formatDetailedSleeping(activityData);
                break;
            case 'bathroom':
                activityIcon = 'fas fa-bath';
                activityContent = this.formatDetailedBathroom(activityData);
                break;
            case 'mood':
                activityIcon = 'fas fa-smile';
                activityContent = this.formatDetailedMood(activityData);
                break;
            case 'activities':
                activityIcon = 'fas fa-gamepad';
                activityContent = this.formatDetailedActivities(activityData);
                break;
        }

        element.innerHTML = `
            <div class="detailed-activity-header">
                <div class="detailed-activity-time">
                    <i class="${activityIcon}"></i>
                    ${app.formatTime(activity.time)}
                </div>
                <div class="detailed-activity-child">
                    ${child ? child.name : 'ילד לא ידוע'}
                </div>
            </div>
            <div class="detailed-activity-content">
                ${activityContent}
            </div>
        `;

        return element;
    }

    static formatDetailedEating(data) {
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
            <div class="detailed-item">
                <strong>סוג ארוחה:</strong> ${mealTypes[data.mealType] || data.mealType}
            </div>
            <div class="detailed-item">
                <strong>כמות:</strong> ${mealAmounts[data.mealAmount] || data.mealAmount}
            </div>
            ${data.notes ? `<div class="detailed-item"><strong>הערות:</strong> ${data.notes}</div>` : ''}
        `;
    }

    static formatDetailedDrinking(data) {
        const drinkTypes = {
            water: 'מים',
            juice: 'מיץ',
            milk: 'חלב'
        };
        
        return `
            <div class="detailed-item">
                <strong>סוג משקה:</strong> ${drinkTypes[data.drinkType] || data.drinkType}
            </div>
            <div class="detailed-item">
                <strong>כמות:</strong> ${data.amount} כוסות
            </div>
        `;
    }

    static formatDetailedSleeping(data) {
        return `
            <div class="detailed-item">
                <strong>שעת השכבה:</strong> ${data.sleepStart}
            </div>
            <div class="detailed-item">
                <strong>שעת התעוררות:</strong> ${data.sleepEnd}
            </div>
            <div class="detailed-item">
                <strong>איכות שינה:</strong> ${data.sleepQuality === 'good' ? 'שינה שקטה' : 'שינה חסרת מנוחה'}
            </div>
        `;
    }

    static formatDetailedBathroom(data) {
        const types = {
            wet: 'רטוב',
            dry: 'יבש'
        };
        
        return `
            <div class="detailed-item">
                <strong>מספר פעמים:</strong> ${data.count}
            </div>
            <div class="detailed-item">
                <strong>סוג:</strong> ${types[data.type] || data.type}
            </div>
            ${data.notes ? `<div class="detailed-item"><strong>הערות:</strong> ${data.notes}</div>` : ''}
        `;
    }

    static formatDetailedMood(data) {
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
            <div class="detailed-item">
                <strong>מצב רוח:</strong> ${moods[data.mood] || data.mood}
            </div>
            <div class="detailed-item">
                <strong>רמת בכי:</strong> ${cryingLevels[data.cryingLevel] || data.cryingLevel}
            </div>
        `;
    }

    static formatDetailedActivities(data) {
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
            <div class="detailed-item">
                <strong>סוגי פעילויות:</strong> ${activitiesList}
            </div>
            ${data.notes ? `<div class="detailed-item"><strong>הערות:</strong> ${data.notes}</div>` : ''}
        `;
    }
}

// Export for use in other modules
window.ParentsView = ParentsView; 