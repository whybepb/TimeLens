/**
 * useNotifications - React hook for notification management
 */

import { useCallback, useEffect, useState } from "react";

import {
    getNotificationService,
    NotificationSettings,
} from "../services/NotificationService";

export interface UseNotificationsReturn {
    settings: NotificationSettings;
    hasPermission: boolean;
    requestPermissions: () => Promise<boolean>;
    updateSettings: (updates: Partial<NotificationSettings>) => Promise<void>;
    toggleNotifications: (enabled: boolean) => Promise<void>;
    sendTestNotification: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
    const notificationService = getNotificationService();

    const [settings, setSettings] = useState<NotificationSettings>(
        notificationService.getSettings()
    );
    const [hasPermission, setHasPermission] = useState(false);

    // Check permission on mount
    useEffect(() => {
        const checkPermission = async () => {
            const status = await notificationService.getPermissionStatus();
            setHasPermission(status);
        };
        checkPermission();
    }, []);

    // Subscribe to settings changes
    useEffect(() => {
        const unsubscribe = notificationService.subscribe(() => {
            setSettings(notificationService.getSettings());
        });
        return unsubscribe;
    }, []);

    const requestPermissions = useCallback(async (): Promise<boolean> => {
        const granted = await notificationService.requestPermissions();
        setHasPermission(granted);
        return granted;
    }, []);

    const updateSettings = useCallback(
        async (updates: Partial<NotificationSettings>): Promise<void> => {
            await notificationService.updateSettings(updates);
        },
        []
    );

    const toggleNotifications = useCallback(async (enabled: boolean): Promise<void> => {
        await notificationService.updateSettings({ enabled });
    }, []);

    const sendTestNotification = useCallback(async (): Promise<void> => {
        await notificationService.sendMotivationNotification(
            "Test Notification 🎉",
            "Notifications are working! You'll receive reminders to stay on track."
        );
    }, []);

    return {
        settings,
        hasPermission,
        requestPermissions,
        updateSettings,
        toggleNotifications,
        sendTestNotification,
    };
}

export default useNotifications;
