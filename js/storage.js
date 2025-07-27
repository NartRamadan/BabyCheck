// Data Storage Management
class StorageManager {
    constructor() {
        this.storageKeys = {
            CHILDREN: 'children',
            ACTIVITIES: 'activities',
            FORM_DRAFT: 'formDraft',
            SETTINGS: 'settings'
        };
    }

    // Children Management
    getChildren() {
        try {
            const children = localStorage.getItem(this.storageKeys.CHILDREN);
            return children ? JSON.parse(children) : [];
        } catch (error) {
            console.error('Error loading children:', error);
            return [];
        }
    }

    saveChildren(children) {
        try {
            localStorage.setItem(this.storageKeys.CHILDREN, JSON.stringify(children));
            return true;
        } catch (error) {
            console.error('Error saving children:', error);
            return false;
        }
    }

    addChild(child) {
        const children = this.getChildren();
        const newChild = {
            ...child,
            id: this.generateId(),
            createdAt: new Date().toISOString()
        };
        children.push(newChild);
        this.saveChildren(children);
        return newChild;
    }

    updateChild(childId, updates) {
        const children = this.getChildren();
        const index = children.findIndex(child => child.id === childId);
        if (index !== -1) {
            children[index] = { ...children[index], ...updates };
            this.saveChildren(children);
            return children[index];
        }
        return null;
    }

    deleteChild(childId) {
        const children = this.getChildren();
        const filteredChildren = children.filter(child => child.id !== childId);
        this.saveChildren(filteredChildren);
        
        // Also delete all activities for this child
        this.deleteActivitiesByChild(childId);
    }

    getChild(childId) {
        const children = this.getChildren();
        return children.find(child => child.id === childId);
    }

    // Activities Management
    getActivities(filters = {}) {
        try {
            const activities = localStorage.getItem(this.storageKeys.ACTIVITIES);
            let allActivities = activities ? JSON.parse(activities) : [];
            
            // Apply filters
            if (filters.childId) {
                allActivities = allActivities.filter(activity => activity.childId === filters.childId);
            }
            
            if (filters.date) {
                allActivities = allActivities.filter(activity => activity.date === filters.date);
            }
            
            if (filters.type) {
                allActivities = allActivities.filter(activity => activity.type === filters.type);
            }
            
            if (filters.startDate && filters.endDate) {
                allActivities = allActivities.filter(activity => {
                    const activityDate = new Date(activity.date);
                    const startDate = new Date(filters.startDate);
                    const endDate = new Date(filters.endDate);
                    return activityDate >= startDate && activityDate <= endDate;
                });
            }
            
            // Sort by date and time
            return allActivities.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateB - dateA;
            });
        } catch (error) {
            console.error('Error loading activities:', error);
            return [];
        }
    }

    saveActivities(activities) {
        try {
            localStorage.setItem(this.storageKeys.ACTIVITIES, JSON.stringify(activities));
            return true;
        } catch (error) {
            console.error('Error saving activities:', error);
            return false;
        }
    }

    addActivity(activity) {
        const activities = this.getActivities();
        const newActivity = {
            ...activity,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString()
        };
        activities.push(newActivity);
        this.saveActivities(activities);
        return newActivity;
    }

    updateActivity(activityId, updates) {
        const activities = this.getActivities();
        const index = activities.findIndex(activity => activity.id === activityId);
        if (index !== -1) {
            activities[index] = { 
                ...activities[index], 
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveActivities(activities);
            return activities[index];
        }
        return null;
    }

    deleteActivity(activityId) {
        const activities = this.getActivities();
        const filteredActivities = activities.filter(activity => activity.id !== activityId);
        this.saveActivities(filteredActivities);
    }

    deleteActivitiesByChild(childId) {
        const activities = this.getActivities();
        const filteredActivities = activities.filter(activity => activity.childId !== childId);
        this.saveActivities(filteredActivities);
    }

    getActivity(activityId) {
        const activities = this.getActivities();
        return activities.find(activity => activity.id === activityId);
    }

    // Daily Summary
    getDailySummary(childId, date) {
        const activities = this.getActivities({ childId, date });
        
        const summary = {
            eating: {
                meals: [],
                totalMeals: 0,
                averageAmount: 0
            },
            drinking: {
                drinks: [],
                totalDrinks: 0,
                totalAmount: 0
            },
            sleeping: {
                sessions: [],
                totalSleepTime: 0,
                averageQuality: 'good'
            },
            bathroom: {
                visits: [],
                totalVisits: 0
            },
            mood: {
                moods: [],
                averageMood: 'happy',
                cryingLevel: 'none'
            },
            activities: {
                types: [],
                totalActivities: 0
            }
        };

        activities.forEach(activity => {
            switch (activity.type) {
                case 'eating':
                    summary.eating.meals.push(activity.data);
                    summary.eating.totalMeals++;
                    break;
                case 'drinking':
                    summary.drinking.drinks.push(activity.data);
                    summary.drinking.totalDrinks++;
                    if (activity.data.amount) {
                        summary.drinking.totalAmount += parseFloat(activity.data.amount);
                    }
                    break;
                case 'sleeping':
                    summary.sleeping.sessions.push(activity.data);
                    if (activity.data.sleepStart && activity.data.sleepEnd) {
                        const start = new Date(`2000-01-01T${activity.data.sleepStart}`);
                        const end = new Date(`2000-01-01T${activity.data.sleepEnd}`);
                        const duration = (end - start) / (1000 * 60); // minutes
                        summary.sleeping.totalSleepTime += duration;
                    }
                    break;
                case 'bathroom':
                    summary.bathroom.visits.push(activity.data);
                    summary.bathroom.totalVisits++;
                    break;
                case 'mood':
                    summary.mood.moods.push(activity.data);
                    break;
                case 'activities':
                    summary.activities.types.push(...(activity.data.activities || []));
                    summary.activities.totalActivities++;
                    break;
            }
        });

        // Calculate averages
        if (summary.eating.totalMeals > 0) {
            const amounts = summary.eating.meals.map(meal => {
                switch (meal.mealAmount) {
                    case 'all': return 100;
                    case 'half': return 50;
                    case 'little': return 25;
                    case 'none': return 0;
                    default: return 0;
                }
            });
            summary.eating.averageAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        }

        if (summary.mood.moods.length > 0) {
            const moodCounts = {};
            summary.mood.moods.forEach(mood => {
                if (mood.mood) {
                    moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
                }
            });
            summary.mood.averageMood = Object.keys(moodCounts).reduce((a, b) => 
                moodCounts[a] > moodCounts[b] ? a : b
            );
        }

        return summary;
    }

    // Form Draft Management
    saveFormDraft(draft) {
        try {
            localStorage.setItem(this.storageKeys.FORM_DRAFT, JSON.stringify(draft));
            return true;
        } catch (error) {
            console.error('Error saving form draft:', error);
            return false;
        }
    }

    getFormDraft() {
        try {
            const draft = localStorage.getItem(this.storageKeys.FORM_DRAFT);
            return draft ? JSON.parse(draft) : null;
        } catch (error) {
            console.error('Error loading form draft:', error);
            return null;
        }
    }

    clearFormDraft() {
        localStorage.removeItem(this.storageKeys.FORM_DRAFT);
    }

    // Settings Management
    getSettings() {
        try {
            const settings = localStorage.getItem(this.storageKeys.SETTINGS);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem(this.storageKeys.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    getDefaultSettings() {
        return {
            theme: 'light',
            language: 'he',
            autoSave: true,
            notifications: true,
            sound: false,
            dataRetention: 30 // days
        };
    }

    // Data Export/Import
    exportData() {
        try {
            const data = {
                children: this.getChildren(),
                activities: this.getActivities(),
                settings: this.getSettings(),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.children) {
                this.saveChildren(data.children);
            }
            
            if (data.activities) {
                this.saveActivities(data.activities);
            }
            
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Data Cleanup
    cleanupOldData() {
        try {
            const settings = this.getSettings();
            const retentionDays = settings.dataRetention || 30;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            
            const activities = this.getActivities();
            const filteredActivities = activities.filter(activity => {
                const activityDate = new Date(activity.date);
                return activityDate >= cutoffDate;
            });
            
            this.saveActivities(filteredActivities);
            return true;
        } catch (error) {
            console.error('Error cleaning up old data:', error);
            return false;
        }
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    clearAllData() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }

    getStorageSize() {
        try {
            let totalSize = 0;
            Object.values(this.storageKeys).forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    totalSize += new Blob([data]).size;
                }
            });
            return totalSize;
        } catch (error) {
            console.error('Error calculating storage size:', error);
            return 0;
        }
    }

    // Backup and Restore
    createBackup() {
        const data = this.exportData();
        if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `babycheck-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        }
        return false;
    }

    restoreFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const success = this.importData(e.target.result);
                if (success) {
                    resolve(true);
                } else {
                    reject(new Error('Failed to import data'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}

// Create global instance
window.storage = new StorageManager(); 