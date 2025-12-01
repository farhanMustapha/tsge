

let currentQuestionIndex = 0;
let currentQuizData = null;

// DOM Elements
const questionElement = document.getElementById('qst');
const tableContainer = document.getElementById("tblo");
const imageElement = document.getElementById("image");
const feedbackElement = document.getElementById("rep");
const journalSelect = document.getElementById("jrnl");

function initGame() {
    // Check Auth
    requireAuth();

    // Set User Name
    const user = getCurrentUser();
    if (user) {
        document.getElementById('user-name').textContent = user.name;
        // Load Progress
        currentQuestionIndex = user.progress || 0;
    }

    // Load Custom Quizzes
    const customQuizzes = JSON.parse(localStorage.getItem('custom_quizzes')) || [];
    if (customQuizzes.length > 0) {
        // Append custom quizzes to the existing quizs array
        // We use concat to create a new array, or push if we want to modify in place.
        // Since quizs is likely a const or let from data.js, we should check.
        // data.js usually defines 'let quizs = ...', so we can push.
        quizs.push(...customQuizzes);
    }

    if (typeof quizs === 'undefined' || !quizs || quizs.length === 0) {
        questionElement.textContent = "Erreur : Aucune donnée de quiz trouvée.";
        return;
    }
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= quizs.length) {
        showEndGame();
        return;
    }

    currentQuizData = quizs[currentQuestionIndex];

    // Update Question and Image
    questionElement.textContent = currentQuizData.question;
    imageElement.src = currentQuizData.facture;
    imageElement.alt = "Document pour " + currentQuizData.question;

    // Reset Feedback and Journal
    feedbackElement.textContent = "";
    feedbackElement.className = "";
    journalSelect.value = "";

    // Render Table
    renderTable();
}

function renderTable() {
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Compte</th>
                    <th>Débit</th>
                    <th>Crédit</th>
                </tr>
            </thead>
            <tbody>
                ${[1, 2, 3].map(i => `
                <tr>
                    <td><input id="cpt_${i}" type="text" placeholder="Compte ${i}"></td>
                    <td><input id="mnt_d${i}" type="number" placeholder="Débit ${i}"></td>
                    <td><input id="mnt_c${i}" type="number" placeholder="Crédit ${i}"></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="actions">
            <button id="valider" onclick="validateAnswer()">Valider</button>
            <button id="show-solution" onclick="showSolution()">Voir la solution</button>
            <button id="next" onclick="nextQuestion()" style="display:none;">Suivant</button>
        </div>
    `;

    tableContainer.innerHTML = tableHTML;
}

function validateAnswer() {
    if (!currentQuizData) return;

    const inputs = {
        cpt_1: document.getElementById("cpt_1").value.trim(),
        cpt_2: document.getElementById("cpt_2").value.trim(),
        cpt_3: document.getElementById("cpt_3").value.trim(),
        mnt_d1: parseFloat(document.getElementById("mnt_d1").value) || 0,
        mnt_d2: parseFloat(document.getElementById("mnt_d2").value) || 0,
        mnt_d3: parseFloat(document.getElementById("mnt_d3").value) || 0,
        mnt_c1: parseFloat(document.getElementById("mnt_c1").value) || 0,
        mnt_c2: parseFloat(document.getElementById("mnt_c2").value) || 0,
        mnt_c3: parseFloat(document.getElementById("mnt_c3").value) || 0,
        journal: journalSelect.value
    };

    // Flexible Row Validation

    // 1. Collect User Rows
    const userRows = [
        {
            cpt: inputs.cpt_1,
            mnt_d: inputs.mnt_d1,
            mnt_c: inputs.mnt_c1
        },
        {
            cpt: inputs.cpt_2,
            mnt_d: inputs.mnt_d2,
            mnt_c: inputs.mnt_c2
        },
        {
            cpt: inputs.cpt_3,
            mnt_d: inputs.mnt_d3,
            mnt_c: inputs.mnt_c3
        }
    ];

    // 2. Collect Correct Rows
    const correctRows = [
        {
            cpt: currentQuizData.cpt_1,
            mnt_d: currentQuizData.mnt_d1,
            mnt_c: currentQuizData.mnt_c1
        },
        {
            cpt: currentQuizData.cpt_2,
            mnt_d: currentQuizData.mnt_d2,
            mnt_c: currentQuizData.mnt_c2
        },
        {
            cpt: currentQuizData.cpt_3,
            mnt_d: currentQuizData.mnt_d3,
            mnt_c: currentQuizData.mnt_c3
        }
    ];

    // 3. Check Journal (must match exactly)
    if (inputs.journal !== currentQuizData.journal) {
        showFeedback(false);
        return;
    }

    // 4. Check Rows (Order Independent)
    // We try to match each user row to a correct row.
    // Since duplicates might exist (unlikely in this accounting context but good practice),
    // we should track which correct rows have been used.

    const usedIndices = new Set();
    let allRowsMatch = true;

    for (const uRow of userRows) {
        let matchFound = false;

        // Skip empty user rows if we assume empty rows in data are also empty
        // But here we want strict matching of the set of 3 rows.

        for (let i = 0; i < correctRows.length; i++) {
            if (usedIndices.has(i)) continue;

            const cRow = correctRows[i];

            // Compare fields
            // Note: Account is string, Amounts are numbers
            if (uRow.cpt == cRow.cpt &&
                uRow.mnt_d == cRow.mnt_d &&
                uRow.mnt_c == cRow.mnt_c) {

                usedIndices.add(i);
                matchFound = true;
                break;
            }
        }

        if (!matchFound) {
            allRowsMatch = false;
            break;
        }
    }

    if (allRowsMatch) {
        showFeedback(true);
    } else {
        showFeedback(false);
    }
}

function showFeedback(isCorrect) {
    if (isCorrect) {
        feedbackElement.textContent = "Réponse correcte !";
        feedbackElement.className = "correct";
        document.getElementById("valider").style.display = "none";
        document.getElementById("show-solution").style.display = "none";
        document.getElementById("next").style.display = "inline-block";
    } else {
        feedbackElement.textContent = "Réponse incorrecte. Essayez encore.";
        feedbackElement.className = "incorrect";
    }
}

function showSolution() {
    if (!currentQuizData) return;

    const modal = document.getElementById("solutionModal");
    const content = document.getElementById("solution-content");

    const html = `
        <div class="solution-details">
            <div class="solution-row"><span class="solution-label">Journal:</span> <span>${currentQuizData.journal}</span></div>
            
            <h3>Écritures</h3>
            <table>
                <tr><th>Compte</th><th>Débit</th><th>Crédit</th></tr>
                <tr><td>${currentQuizData.cpt_1}</td><td>${currentQuizData.mnt_d1 || '-'}</td><td>${currentQuizData.mnt_c1 || '-'}</td></tr>
                <tr><td>${currentQuizData.cpt_2}</td><td>${currentQuizData.mnt_d2 || '-'}</td><td>${currentQuizData.mnt_c2 || '-'}</td></tr>
                <tr><td>${currentQuizData.cpt_3}</td><td>${currentQuizData.mnt_d3 || '-'}</td><td>${currentQuizData.mnt_c3 || '-'}</td></tr>
            </table>
        </div>
    `;

    content.innerHTML = html;
    modal.style.display = "block";

    // Close modal logic
    const span = document.getElementsByClassName("close")[0];
    span.onclick = function () {
        modal.style.display = "none";
    }
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    saveProgress(currentQuestionIndex);
    loadQuestion();
}

function showEndGame() {
    tableContainer.innerHTML = "";
    questionElement.textContent = "Félicitations ! Vous avez terminé le quiz.";
    imageElement.style.display = "none";
    journalSelect.style.display = "none";
    feedbackElement.textContent = "";
}

// Initialize
window.onload = function () {
    initGame();
    setupSearch();
};

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase();

        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const matches = quizs.map((quiz, index) => ({ index, quiz }))
            .filter(item => {
                const q = item.quiz;
                const textMatch = q.question.toLowerCase().includes(query);

                // Search in accounts
                const accountMatch = [q.cpt_1, q.cpt_2, q.cpt_3].some(c => c && c.toString().includes(query));

                // Search in amounts
                const amountMatch = [q.mnt_d1, q.mnt_d2, q.mnt_d3, q.mnt_c1, q.mnt_c2, q.mnt_c3]
                    .some(m => m && m.toString().includes(query));

                return textMatch || accountMatch || amountMatch;
            });

        if (matches.length > 0) {
            searchResults.innerHTML = matches.map(item => `
                <div class="search-item" onclick="jumpToQuestion(${item.index})">
                    ${item.quiz.question}
                </div>
            `).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<div class="search-item" style="cursor: default; color: #999;">Aucun résultat</div>';
            searchResults.style.display = 'block';
        }
    });

    // Close search when clicking outside
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function jumpToQuestion(index) {
    currentQuestionIndex = index;
    loadQuestion();

    // Clear search
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    searchInput.value = '';
    searchResults.style.display = 'none';
}
