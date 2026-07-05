function getCurrentUser() {
  return { username: "Erica", email: "paleaericamae@gmail.com" };
}

function getNotifications() {
  return [
    { id: 1, message: 'Miracle Glow Whitening Setting Spray 60ml has been resolved.', time: 'Just now', read: false },
    { id: 2, message: 'Miracle Glow Whitening Setting Spray 60ml has been denied.', time: '1 hour ago', read: true },
    { id: 3, message: 'Miracle Glow Whitening Setting Spray 60ml is now being reviewed.', time: '2 hours ago', read: true }
  ];
}

// In api.js

let mockNotifications = [
  { id: 1, message: 'Miracle Glow Whitening Setting Spray 60ml has been resolved.', time: 'Just now', read: false },
  { id: 2, message: 'Miracle Glow Whitening Setting Spray 60ml has been denied.', time: '1 hour ago', read: true },
  { id: 3, message: 'Miracle Glow Whitening Setting Spray 60ml is now being reviewed.', time: '2 hours ago', read: true }
];

function getNotifications() {
  return mockNotifications;
}

function markAllNotificationsRead() {
  mockNotifications = mockNotifications.map(n => ({ ...n, read: true }));
}