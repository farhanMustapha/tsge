/**
 * Auth System using localStorage
 * Simulates a JSON database in 'users' key.
 */

const STORAGE_KEY = 'qcm_users';
const CURRENT_USER_KEY = 'qcm_current_user';

// Helper to get all users
function getUsers() {
    const usersJSON = localStorage.getItem(STORAGE_KEY);
    return usersJSON ? JSON.parse(usersJSON) : [];
}

// Helper to save all users
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Register a new user
function registerUser(name, email, password, phone) {
    const users = getUsers();

    // Check if email or phone already exists
    if (users.find(u => u.email === email || u.phone === phone)) {
        return { success: false, message: "Utilisateur déjà existant (Email ou Téléphone)." };
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        phone,
        progress: 0 // Start at question 0
    };

    users.push(newUser);
    saveUsers(users);

    // Auto login
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return { success: true };
}

// Login user
function loginUser(identifier, password) {
    const users = getUsers();

    // Identifier can be email or phone
    const user = users.find(u =>
        (u.email === identifier || u.phone === identifier) && u.password === password
    );

    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return { success: true };
    } else {
        return { success: false, message: "Identifiants incorrects." };
    }
}

// Logout user
function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'index.html';
}

// Get current logged in user
function getCurrentUser() {
    const userJSON = localStorage.getItem(CURRENT_USER_KEY);
    return userJSON ? JSON.parse(userJSON) : null;
}

// Check auth and redirect if needed
function requireAuth() {
    if (!getCurrentUser()) {
        window.location.href = 'index.html';
    }
}

// Save user progress
function saveProgress(questionIndex) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    currentUser.progress = questionIndex;

    // Update current user in session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

    // Update user in database
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].progress = questionIndex;
        saveUsers(users);
    }
}

// Reset user progress
function resetProgress() {
    saveProgress(0);
    window.location.reload();
}
