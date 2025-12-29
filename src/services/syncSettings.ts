// Sync Settings Service - Manages sync preferences between Timetable and To-Do List

const SYNC_SETTINGS_KEY = 'timetable_todo_sync_enabled';

// Get sync setting (default: enabled)
export function getSyncEnabled(): boolean {
    try {
        const stored = localStorage.getItem(SYNC_SETTINGS_KEY);
        // Default to true (enabled) if not set
        return stored === null ? true : stored === 'true';
    } catch {
        return true;
    }
}

// Set sync setting
export function setSyncEnabled(enabled: boolean): void {
    try {
        localStorage.setItem(SYNC_SETTINGS_KEY, enabled.toString());
        // Dispatch event for real-time updates
        window.dispatchEvent(new CustomEvent('sync-settings-changed', { detail: { enabled } }));
    } catch (error) {
        console.error('Error saving sync settings:', error);
    }
}

// Listen for sync setting changes
export function onSyncSettingsChange(callback: (enabled: boolean) => void): () => void {
    const handler = (event: Event) => {
        const customEvent = event as CustomEvent<{ enabled: boolean }>;
        callback(customEvent.detail.enabled);
    };

    window.addEventListener('sync-settings-changed', handler);

    // Return cleanup function
    return () => {
        window.removeEventListener('sync-settings-changed', handler);
    };
}
