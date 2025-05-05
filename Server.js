const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');  // Pour envoyer des requêtes HTTP vers Discord

const app = express();

// Utiliser le port fourni par Railway ou le port 3000 en local
const port = process.env.PORT || 3000;

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// URL du webhook Discord
const discordWebhookURL = 'https://discord.com/api/webhooks/1336793616953376990/zBv6Mr6OL6ZGvDe6zOMAUzm0Bvqtx6MsUpZ2YAgq77t4nYKM3kokGvLXtSYGYMa3k4lG';

// Fonction pour générer un ID unique (avec timestamp et composant aléatoire)
function generateTradeID() {
    const timestamp = Date.now();  // Utilise le timestamp actuel
    const randomComponent = Math.floor(Math.random() * 900) + 100;  // Génère un nombre aléatoire entre 100 et 999
    const uniqueID = timestamp + randomComponent;  // Combine le timestamp et le composant aléatoire
    return uniqueID;
}

// Fonction pour déterminer le type de signal en fonction du message d'alerte
function determineSignalType(message) {
    if (message.includes('LONG STRONG')) {
        return '🟢 LONG STRONG';
    } else if (message.includes('SHORT STRONG')) {
        return '🔴 SHORT STRONG';
    } else if (message.includes('LONG MEDIUM')) {
        return '🟢 LONG MEDIUM';
    } else if (message.includes('SHORT MEDIUM')) {
        return '🔴 SHORT MEDIUM';
    } else if (message.includes('LONG WEAK')) {
        return '🟢 LONG WEAK';
    } else if (message.includes('SHORT WEAK')) {
        return '🔴 SHORT WEAK';
    } else {
        return '❓ NON DEFINI';  // Au cas où l'alerte ne correspond à rien de défini
    }
}

// Route pour afficher un message d'accueil lorsque tu vas à '/'
app.get('/', (req, res) => {
    res.send('Serveur fonctionne ! 🎉');
});

// Route pour recevoir les alertes
app.post('/webhook', (req, res) => {
    const alertData = req.body;  // Les données envoyées par TradingView

    // Vérifier que l'alerte contient un message avec un type de signal
    if (!alertData.message) {
        return res.status(400).send('Message de l\'alerte manquant');
    }

    // Déterminer le type de signal à partir du message
    const signalType = determineSignalType(alertData.message);

    // Générer deux TradeID uniques (un pour chaque trade)
    const tradeID1 = generateTradeID();
    const tradeID2 = generateTradeID();

    // Créer le message à envoyer à Discord
    const discordMessage = {
        content: `📢 Signal détecté - Type: ${signalType} - Trade ID 1: ${tradeID1} - Trade ID 2: ${tradeID2}`
    };

    // Envoyer l'alerte à Discord via le webhook
    axios.post(discordWebhookURL, discordMessage)
        .then(response => {
            console.log('Message envoyé à Discord');
            res.status(200).send('Alerte traitée et envoyée');
        })
        .catch(error => {
            console.error('Erreur lors de l\'envoi à Discord', error);
            res.status(500).send('Erreur serveur');
        });
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
});
