// Global variables
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        checkAuth();
        loadDocuments();
    } else {
        setupLoginForm();
    }
});

// Login/Register functionality
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            });
            
            const result = await response.text();
            if (result.includes('success')) {
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('loginError').textContent = 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்!';
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    });
}

function showRegister() {
    alert('பதிவு செய்ய admin உடன் தொடர்பு கொள்ளுங்கள்');
}

// Dashboard functionality
async function checkAuth() {
    const response = await fetch('check_session.php');
    const result = await response.text();
    if (result !== 'authorized') {
        window.location.href = 'index.html';
    }
}

async function loadDocuments() {
    try {
        showLoading(true);
        const response = await fetch('get_documents.php');
        const documents = await response.json();
        
        const grid = document.querySelector('.documents-grid');
        grid.innerHTML = '';
        
        if (documents.length === 0) {
            grid.innerHTML = '<p class="no-docs">எந்த ஆவணமும் இல்லை. புதிய ஆவணம் பதிவேற்றவும்!</p>';
            return;
        }
        
        documents.forEach(doc => {
            const docCard = createDocCard(doc);
            grid.appendChild(docCard);
        });
    } catch (error) {
        console.error('Error loading documents:', error);
    } finally {
        showLoading(false);
    }
}

function createDocCard(doc) {
    const card = document.createElement('div');
    card.className = 'doc-card';
    card.innerHTML = `
        <div class="doc-name">${doc.filename}</div>
        <div class="doc-date">${new Date(doc.upload_time).toLocaleDateString('ta-IN')}</div>
        <div class="btn-group">
            <button class="btn btn-view" onclick="viewDocument(${doc.id})">பார்க்க</button>
            <button class="btn btn-download" onclick="downloadDocument(${doc.id})">பதிவிறக்கம்</button>
        </div>
    `;
    return card;
}

function showUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('uploadModal').style.display = 'none';
}

async function handleUpload(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        showLoading(true);
        const response = await fetch('upload.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.status === 'success') {
            closeModal();
            loadDocuments();
            e.target.reset();
            alert('ஆவணம் பாதுகாப்பாக பதிவேற்றப்பட்டது!');
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('பதிவேற்றத்தில் பிழை!');
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    const loader = document.querySelector('.loading');
    if (loader) loader.style.display = show ? 'block' : 'none';
}

async function viewDocument(id) {
    window.open(`view.php?id=${id}`, '_blank');
}

async function downloadDocument(id) {
    window.open(`download.php?id=${id}`, '_blank');
}

// Event Listeners
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('close')) {
        closeModal();
    }
});
4. dashboard.html (Main Dashboard)
xml
<!DOCTYPE html>
<html lang="ta">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ஆவண டாஷ்போர்டு</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body class="dashboard-body">
    <nav class="navbar">
        <h2>🔐 டிஜிட்டல் ஆவண பாதுகாப்பு</h2>
        <a href="logout.php" style="color: white; text-decoration: none;">வெளியேறு</a>
    </nav>

    <div class="container">
        <button class="upload-btn" onclick="showUploadModal()">📤 புதிய ஆவணம் பதிவேற்று</button>
        
        <div class="loading">
            <div class="spinner"></div>
            <p>ஆவணங்கள் ஏற்றப்படுகிறது...</p>
        </div>

        <div class="documents-grid"></div>
    </div>

    <!-- Upload Modal -->
    <div id="uploadModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>பாதுகாப்பான ஆவண பதிவேற்றம்</h3>
            <form id="uploadForm" enctype="multipart/form-data">
                <input type="file" name="document" accept=".pdf,.doc,.docx,.jpg,.png" required>
                <button type="submit">பதிவேற்று</button>
            </form>
        </div>
    </div>

    <script src="assets/script.js"></script>
</body>
</html>