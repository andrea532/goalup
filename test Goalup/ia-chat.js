const API_KEY = 'AIzaSyCgPSEXaDLQCMzeWRbU_CodLjdh4ovxGgo';
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
const deviceId = localStorage.getItem('deviceId') || 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
let chatMessages = JSON.parse(localStorage.getItem('chatHistory') || '[]');

async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const sendButton = document.querySelector('.chat-input button');
    input.disabled = true;
    if (sendButton) sendButton.disabled = true;
    
    try {
        addMessage(message, 'user');
        const aiMessageDiv = addMessage("", 'ai');
        
        // Determina il periodo temporale dal messaggio dell'utente
        const timeframe = determineTimeframe(message);
        const prompt = generatePromptBasedOnTimeframe(message, timeframe);
        
        const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192
                }
            })
        });

        if (!response.ok) throw new Error(response.status);
        
        const data = await response.json();
        const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "Scusa, riprova tra poco.";
        
        await typeResponse(aiResponse, aiMessageDiv);
        
    } catch (error) {
        console.error('Errore:', error);
        addMessage("Servizio momentaneamente non disponibile.", 'ai');
    } finally {
        input.disabled = false;
        if (sendButton) sendButton.disabled = false;
        input.value = '';
    }
}

function determineTimeframe(message) {
    const text = message.toLowerCase();
    
    // Array di espressioni temporali in italiano
    const timeExpressions = {
        '10years': [
            '10 anni', 'dieci anni', 'decennio', 'nel 2034', 'tra 10 anni',
            'prossimi dieci anni', 'prossimi 10 anni'
        ],
        '5years': [
            '5 anni', 'cinque anni', 'quinquennio', 'nel 2029', 'tra 5 anni',
            'prossimi cinque anni', 'prossimi 5 anni'
        ],
        '1year': [
            '1 anno', 'un anno', "l'anno prossimo", 'anno', "quest'anno",
            'questo anno', 'prossimo anno', 'nel 2025', 'tra un anno',
            'annuale', 'tra 1 anno', 'entro un anno', 'entro 1 anno'
        ],
        '1month': [
            '1 mese', 'un mese', 'mese', 'questo mese', 'prossimo mese',
            'mensile', 'tra un mese', 'tra 1 mese', 'entro un mese',
            'entro 1 mese', 'il mese prossimo'
        ],
        '1week': [
            'settimana', '1 settimana', 'una settimana', '7 giorni',
            'sette giorni', 'questa settimana', 'prossima settimana',
            'settimanale', 'tra una settimana', 'tra 1 settimana',
            'entro una settimana', 'entro 7 giorni', 'la settimana prossima'
        ]
    };

    // Controlla ogni espressione temporale
    for (const [period, expressions] of Object.entries(timeExpressions)) {
        if (expressions.some(expr => text.includes(expr))) {
            return period;
        }
    }

    // Se non trova corrispondenze specifiche, cerca di interpretare il contesto
    if (text.includes('lungo termine') || text.includes('futuro')) {
        return '10years';
    }
    if (text.includes('medio termine')) {
        return '5years';
    }
    if (text.includes('breve termine') || text.includes('subito')) {
        return '1month';
    }

    return 'full'; // default: piano completo
}

function generatePromptBasedOnTimeframe(message, timeframe) {
    let prompt = `Sei un assistente esperto nella pianificazione degli obiettivi.
    Analizza questo obiettivo: "${message}"\n\n`;

    switch(timeframe) {
        case '1week':
            prompt += `Fornisci un piano settimanale dettagliato:
            
            ===== OBIETTIVO SETTIMANALE =====
            🎯 Obiettivo principale:
            [descrivi dettagliatamente l'obiettivo da raggiungere questa settimana]

            ===== ATTIVITÀ QUOTIDIANE =====
            • [attività quotidiana principale]
            • [attività quotidiana secondaria]
            • [attività quotidiana di supporto]`;
            break;

        case '1month':
            prompt += `Fornisci un piano mensile dettagliato:
            
            ===== OBIETTIVO MENSILE =====
            🎯 Obiettivo principale:
            [descrizione dettagliata dell'obiettivo mensile]

            ===== OBIETTIVO SETTIMANALE =====
            🎯 Per questa settimana:
            [descrivi l'obiettivo settimanale specifico]

            ===== ATTIVITÀ QUOTIDIANE =====
            • [attività quotidiana principale]
            • [attività quotidiana secondaria]
            • [attività quotidiana di supporto]`;
            break;

        case '1year':
            prompt += `Fornisci un piano annuale dettagliato:
            
            ===== OBIETTIVO ANNUALE =====
            🎯 Obiettivo principale:
            [descrizione dettagliata dell'obiettivo annuale]

            ===== OBIETTIVO MENSILE =====
            🎯 Per questo mese:
            [descrivi l'obiettivo mensile specifico]

            ===== OBIETTIVO SETTIMANALE =====
            🎯 Per questa settimana:
            [descrivi l'obiettivo settimanale specifico]

            ===== ATTIVITÀ QUOTIDIANE =====
            Piano settimanale:
            • Lunedì: [attività specifica]
            • Martedì: [attività specifica]
            • Mercoledì: [attività specifica]
            • Giovedì: [attività specifica]
            • Venerdì: [attività specifica]
            • Sabato: [attività specifica]
            • Domenica: [attività specifica]`;
            break;

        default:
            prompt += `Fornisci un piano completo:

            ===== OBIETTIVI A LUNGO TERMINE =====
            🎯 Obiettivo 10 anni:
            [descrizione dettagliata]

             Obiettivo 5 anni:
            [descrizione dettagliata]

            ===== OBIETTIVI A BREVE TERMINE =====
            🎯 Obiettivo annuale:
            [descrizione dettagliata]

            🎯 Obiettivo mensile:
            [descrizione dettagliata]

            🎯 Obiettivo settimanale:
            [descrizione dettagliata]

            ===== ATTIVITÀ QUOTIDIANE =====
            Piano settimanale:
            • Lunedì: [attività specifica]
            • Martedì: [attività specifica]
            • Mercoledì: [attività specifica]
            • Giovedì: [attività specifica]
            • Venerdì: [attività specifica]
            • Sabato: [attività specifica]
            • Domenica: [attività specifica]`;
    }

    prompt += `\n\n===== SUGGERIMENTI PRATICI =====
    • [suggerimento specifico 1]
    • [suggerimento specifico 2]
    • [suggerimento specifico 3]

    ===== POSSIBILI OSTACOLI =====
    • Ostacolo: [descrizione]
      Soluzione: [descrizione]
    • Ostacolo: [descrizione]
      Soluzione: [descrizione]`;

    return prompt;
}

// Funzione per mostrare il testo carattere per carattere
async function typeResponse(text, messageDiv) {
    let formattedText = text
        .replace(/\n\n/g, '<br><br>')
        .replace(/===([^=]+)===/g, '<strong>$1</strong><br>')
        .replace(/🎯/g, '<br>🎯')
        .replace(/•/g, '<br>•')
        .replace(/(\d+\. )/g, '<br>$1');
    
    const words = formattedText.split(' ');
    let currentText = '';
    
    // Rimuovi lo scroll automatico forzato
    const messagesDiv = document.getElementById('chatMessages');
    let userHasScrolled = false;
    
    // Aggiungi listener per rilevare lo scroll manuale
    const scrollHandler = () => {
        userHasScrolled = true;
    };
    messagesDiv.addEventListener('scroll', scrollHandler);
    
    for (let word of words) {
        currentText += word + ' ';
        messageDiv.innerHTML = currentText;
        
        // Fai lo scroll solo se l'utente non ha scrollato manualmente
        if (!userHasScrolled) {
            const isAtBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop <= messagesDiv.clientHeight + 100;
            if (isAtBottom) {
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 20));
    }
    
    // Rimuovi il listener dello scroll
    messagesDiv.removeEventListener('scroll', scrollHandler);

    // Salva la risposta completa dell'IA nella cronologia
    chatMessages.push({ 
        text: formattedText, 
        sender: 'ai', 
        deviceId: null 
    });
    localStorage.setItem('chatHistory', JSON.stringify(chatMessages));

    const timeframe = determineTimeframe(document.getElementById('userInput').value);
    const objectives = extractObjectives(text, timeframe);
    
    if (Object.keys(objectives).length > 0) {
        setTimeout(() => {
            if (confirm('Vuoi che inserisca questi obiettivi nelle rispettive sezioni?')) {
                localStorage.setItem('pendingObjectives', JSON.stringify(objectives));
                window.location.href = 'index.html';
            }
        }, 1000);
    }
    
    return messageDiv;
}

function extractObjectives(text, timeframe = 'full') {
    const objectives = {};
    const lines = text.split('\n');
    
    // Estrai solo gli obiettivi pertinenti al timeframe
    switch(timeframe) {
        case '1week':
            for (const line of lines) {
                if (line.includes('🎯')) {
                    if (line.includes('Obiettivo principale')) {
                        objectives['1week'] = line.split(':')[1]?.trim();
                    }
                }
                // Estrai la prima attività quotidiana
                if (line.includes('• [attività quotidiana principale]')) {
                    objectives['daily'] = line.replace('• ', '').trim();
                }
            }
            break;
            
        case '1month':
            for (const line of lines) {
                if (line.includes('🎯')) {
                    if (line.includes('Obiettivo principale')) {
                        objectives['1month'] = line.split(':')[1]?.trim();
                    } else if (line.includes('questa settimana')) {
                        objectives['1week'] = line.split(':')[1]?.trim();
                    }
                }
                // Estrai la prima attività quotidiana
                if (line.includes('• [attività quotidiana principale]')) {
                    objectives['daily'] = line.replace('• ', '').trim();
                }
            }
            break;
            
        case '1year':
            for (const line of lines) {
                if (line.includes('🎯')) {
                    if (line.includes('Obiettivo principale')) {
                        objectives['1year'] = line.split(':')[1]?.trim();
                    } else if (line.includes('questo mese')) {
                        objectives['1month'] = line.split(':')[1]?.trim();
                    } else if (line.includes('questa settimana')) {
                        objectives['1week'] = line.split(':')[1]?.trim();
                    }
                }
                // Estrai la prima attività quotidiana da Lunedì
                if (line.includes('• Lunedì:')) {
                    objectives['daily'] = line.split('Lunedì:')[1]?.trim();
                }
            }
            break;
            
        default:
            for (const line of lines) {
                if (line.includes('🎯')) {
                    if (line.includes('10 anni')) {
                        objectives['10years'] = line.split(':')[1]?.trim();
                    } else if (line.includes('5 anni')) {
                        objectives['5years'] = line.split(':')[1]?.trim();
                    } else if (line.includes('annuale')) {
                        objectives['1year'] = line.split(':')[1]?.trim();
                    } else if (line.includes('mensile')) {
                        objectives['1month'] = line.split(':')[1]?.trim();
                    } else if (line.includes('settimanale')) {
                        objectives['1week'] = line.split(':')[1]?.trim();
                    }
                }
                // Estrai la prima attività quotidiana da Lunedì
                if (line.includes('• Lunedì:')) {
                    objectives['daily'] = line.split('Lunedì:')[1]?.trim();
                }
            }
    }
    
    return objectives;
}

// Modifica la funzione addMessage
function addMessage(text, sender) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (sender === 'user') {
        messageDiv.textContent = text;
        messageDiv.dataset.deviceId = deviceId;
    } else {
        messageDiv.innerHTML = text;
    }
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Salva ogni messaggio immediatamente
    chatMessages.push({ text, sender, deviceId: sender === 'user' ? deviceId : null });
    localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
    
    return messageDiv;
}

// Ottimizziamo l'inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    // Salva deviceId se non esiste
    if (!localStorage.getItem('deviceId')) {
        localStorage.setItem('deviceId', deviceId);
    }

    // Aggiungi event listener per l'invio dei messaggi
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Mostra i messaggi salvati o il messaggio di benvenuto
    const messagesDiv = document.getElementById('chatMessages');
    if (chatMessages.length > 0) {
        const fragment = document.createDocumentFragment();
        chatMessages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender}-message`;
            if (msg.sender === 'user') {
                messageDiv.textContent = msg.text;
                messageDiv.dataset.deviceId = msg.deviceId;
            } else {
                messageDiv.innerHTML = msg.text;
            }
            fragment.appendChild(messageDiv);
        });
        messagesDiv.appendChild(fragment);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } else {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'message ai-message';
        welcomeDiv.textContent = "Ciao! Descrivimi il tuo obiettivo principale.";
        messagesDiv.appendChild(welcomeDiv);
        chatMessages.push({ 
            text: welcomeDiv.textContent, 
            sender: 'ai', 
            deviceId: null 
        });
        localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
    }
});

// Modifica la funzione clearChat
function clearChat() {
    const hasUserMessages = chatMessages.some(msg => 
        msg.sender === 'user' && msg.deviceId === deviceId
    );

    if (!hasUserMessages) {
        alert('Puoi cancellare solo le chat che hai creato su questo dispositivo.');
        return;
    }

    if (confirm('Sei sicuro di voler cancellare tutta la cronologia delle chat?')) {
        // Mantieni solo il messaggio di benvenuto
        chatMessages = [];
        localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
        
        const messagesDiv = document.getElementById('chatMessages');
        messagesDiv.innerHTML = '';
        addMessage("Ciao! Descrivimi il tuo obiettivo principale.", 'ai');
    }
}

// Rendi la funzione accessibile globalmente
window.clearChat = clearChat; 