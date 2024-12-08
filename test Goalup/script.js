// Gestione delle attività quotidiane
function addTask() {
    const input = document.getElementById('newTask');
    const taskList = document.getElementById('taskList');
    
    if (input.value.trim() !== '') {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox">
            <span>${input.value}</span>
            <button onclick="this.parentElement.remove()" style="margin-left: auto">
                Elimina
            </button>
        `;
        taskList.appendChild(li);
        input.value = '';
    }
}

// Simulazione semplice dei suggerimenti IA
function generateSuggestions() {
    const aiSuggestions = document.getElementById('aiSuggestions');
    const mainGoal = document.querySelector('[data-period="10years"] textarea').value;
    
    if (!mainGoal) {
        aiSuggestions.innerHTML = '<p>Per favore, inserisci prima il tuo obiettivo a 10 anni.</p>';
        return;
    }

    // Esempio di suggerimenti semplici (in una versione reale, questi verrebbero dall'IA)
    const suggestions = `
        <div class="suggestion">
            <h4>Suggerimenti per raggiungere il tuo obiettivo:</h4>
            <ul>
                <li>Obiettivo 5 anni: Raggiungere il 50% dell'obiettivo finale</li>
                <li>Obiettivo 1 anno: Stabilire una base solida</li>
                <li>Obiettivo 1 mese: Creare un piano d'azione dettagliato</li>
                <li>Obiettivo settimanale: Iniziare con le prime azioni concrete</li>
                <li>Attività quotidiane suggerite:
                    <ul>
                        <li>Studiare il mercato</li>
                        <li>Networking</li>
                        <li>Sviluppo competenze</li>
                    </ul>
                </li>
            </ul>
        </div>
    `;
    
    aiSuggestions.innerHTML = suggestions;
}

// Salvataggio automatico degli obiettivi
document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', function() {
        localStorage.setItem(this.parentElement.dataset.period, this.value);
    });
    
    // Carica i valori salvati al caricamento della pagina
    const savedValue = localStorage.getItem(textarea.parentElement.dataset.period);
    if (savedValue) {
        textarea.value = savedValue;
    }
}); 

// Aggiungi questa nuova funzione per gestire gli obiettivi
function addGoal(period, specificInput = null) {
    const input = specificInput || document.querySelector(`[data-period="${period}"] input`);
    const goalList = document.getElementById(`goals-${period}`);
    
    if (input && input.value.trim() !== '') {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox">
            <span>${input.value}</span>
            <button onclick="removeGoal(this)" style="margin-left: auto">
                Elimina
            </button>
        `;
        goalList.appendChild(li);
        
        // Pulisci l'input solo se non è stato fornito uno specifico
        if (!specificInput) {
            input.value = '';
        }
        
        saveGoals(period);
    }
}

function removeGoal(button) {
    const li = button.parentElement;
    const ul = li.parentElement;
    const period = ul.id.replace('goals-', '');
    
    li.remove();
    saveGoals(period);
}

function saveGoals(period) {
    const goalList = document.getElementById(`goals-${period}`);
    const goals = Array.from(goalList.querySelectorAll('li span')).map(span => ({
        text: span.textContent,
        completed: span.previousElementSibling.checked
    }));
    
    localStorage.setItem(`goals-${period}`, JSON.stringify(goals));
}

// Carica gli obiettivi salvati al caricamento della pagina
function loadSavedGoals() {
    const periods = ['10years', '5years', '1year', '1month', '1week'];
    
    periods.forEach(period => {
        const savedGoals = localStorage.getItem(`goals-${period}`);
        if (savedGoals) {
            const goals = JSON.parse(savedGoals);
            const goalList = document.getElementById(`goals-${period}`);
            
            goals.forEach(goal => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <input type="checkbox" ${goal.completed ? 'checked' : ''}>
                    <span>${goal.text}</span>
                    <button onclick="removeGoal(this)" style="margin-left: auto">
                        Elimina
                    </button>
                `;
                goalList.appendChild(li);
            });
        }
    });
}

// Aggiungi listener per il salvataggio quando si spunta un obiettivo
document.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
        const ul = e.target.closest('ul');
        if (ul && ul.classList.contains('goal-list')) {
            const period = ul.id.replace('goals-', '');
            saveGoals(period);
        }
    }
});

// Aggiungi questa funzione per gestire l'evento keypress
function handleKeyPress(event, period) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Previene il comportamento di default del tasto invio
        addGoal(period);
    }
}

// Aggiungi gli event listener quando la pagina si carica
document.addEventListener('DOMContentLoaded', function() {
    // Prima carica gli obiettivi salvati
    loadSavedGoals();
    
    // Poi controlla se ci sono obiettivi pendenti
    const pendingObjectives = localStorage.getItem('pendingObjectives');
    if (pendingObjectives) {
        const objectives = JSON.parse(pendingObjectives);
        
        // Inserisci gli obiettivi nei rispettivi campi
        Object.keys(objectives).forEach(period => {
            if (period === 'daily') {
                // Inserisci l'attività quotidiana
                const taskList = document.getElementById('taskList');
                if (taskList) {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <input type="checkbox">
                        <span>${objectives[period]}</span>
                        <button onclick="this.parentElement.remove()" style="margin-left: auto">
                            Elimina
                        </button>
                    `;
                    taskList.appendChild(li);
                }
            } else {
                // Aggiungi direttamente l'obiettivo alla lista esistente
                const goalList = document.getElementById(`goals-${period}`);
                if (goalList) {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <input type="checkbox">
                        <span>${objectives[period]}</span>
                        <button onclick="removeGoal(this)" style="margin-left: auto">
                            Elimina
                        </button>
                    `;
                    goalList.appendChild(li);
                    saveGoals(period);
                }
            }
        });
        
        // Pulisci gli obiettivi pendenti
        localStorage.removeItem('pendingObjectives');
    }
    
    // Aggiungi event listener per il tasto invio su tutti gli input degli obiettivi
    const periods = ['10years', '5years', '1year', '1month', '1week'];
    periods.forEach(period => {
        const input = document.querySelector(`[data-period="${period}"] input`);
        if (input) {
            input.addEventListener('keypress', (e) => handleKeyPress(e, period));
        }
    });
    
    // Aggiungi event listener per il tasto invio sulle attività quotidiane
    const newTaskInput = document.getElementById('newTask');
    if (newTaskInput) {
        newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTask();
            }
        });
    }
});