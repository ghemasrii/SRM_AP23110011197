'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Stack, 
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Work as WorkIcon, 
  School as SchoolIcon, 
  Event as EventIcon,
  Refresh as RefreshIcon,
  FiberManualRecord as UnreadIcon
} from '@mui/icons-material';

interface Notification {
  ID: string;
  Type: 'Result' | 'Placement' | 'Event';
  Message: string;
  Timestamp: string;
}

const API_BASE_URL = 'http://localhost:3011';

const getIcon = (type: string) => {
  switch (type) {
    case 'Placement': return <WorkIcon color="primary" />;
    case 'Result': return <SchoolIcon color="success" />;
    case 'Event': return <EventIcon color="info" />;
    default: return <EventIcon />;
  }
};

export default function NotificationDashboard() {
  const [tab, setTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [priorityNotifications, setPriorityNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allRes = await fetch(`${API_BASE_URL}/notifications`);
      if (!allRes.ok) throw new Error('Failed to fetch all notifications');
      const allData = await allRes.json();
      setNotifications(allData.notifications);

      const priorityRes = await fetch(`${API_BASE_URL}/notifications?limit=10`);
      if (!priorityRes.ok) throw new Error('Failed to fetch priority notifications');
      const priorityData = await priorityRes.json();
      setPriorityNotifications(priorityData.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('viewed_notifications');
    if (saved) {
      setViewedIds(new Set(JSON.parse(saved))); // eslint-disable-line react-hooks/set-state-in-effect
    }
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsViewed = (id: string) => {
    const newViewed = new Set(viewedIds);
    if (!newViewed.has(id)) {
      newViewed.add(id);
      setViewedIds(newViewed);
      localStorage.setItem('viewed_notifications', JSON.stringify(Array.from(newViewed)));
    }
  };

  const renderList = (list: Notification[]) => (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {list.length === 0 ? (
        <Typography color="text.secondary">No notifications found.</Typography>
      ) : (
        list.map((n) => (
          <Card 
            key={n.ID} 
            sx={{ 
              position: 'relative',
              cursor: 'pointer',
              opacity: viewedIds.has(n.ID) ? 0.7 : 1,
              borderLeft: viewedIds.has(n.ID) ? 'none' : '4px solid #1976d2',
              '&:hover': {
                boxShadow: 3
              }
            }}
            onClick={() => markAsViewed(n.ID)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getIcon(n.Type)}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" component="div">
                        {n.Type}
                      </Typography>
                      {!viewedIds.has(n.ID) && (
                        <Tooltip title="Unread">
                          <UnreadIcon color="primary" sx={{ fontSize: 12 }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body1">{n.Message}</Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {n.Timestamp}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Campus Updates
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Stay informed with real-time notifications
          </Typography>
        </Box>
        <IconButton onClick={fetchNotifications} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error} — Make sure the backend is running on {API_BASE_URL}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Priority Inbox" />
        <Tab label="All Notifications" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {tab === 0 && renderList(priorityNotifications)}
          {tab === 1 && renderList(notifications)}
        </Box>
      )}
    </Container>
  );
}
