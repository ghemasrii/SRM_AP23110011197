export interface Notification {
    ID: string;
    Type: 'Result' | 'Placement' | 'Event';
    Message: string;
    Timestamp: string;
}
export declare function fetchNotificationsFromTestServer(token: string): Promise<Notification[]>;
export declare function sortByPriority(notifications: Notification[], limit?: number): Notification[];
