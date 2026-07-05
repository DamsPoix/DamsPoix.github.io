/**
 * ──────────────────────────────────────────────────────────────────────
 *  RSVP du mariage → Google Sheet
 *  Script Google Apps Script à coller dans votre feuille Google Sheets.
 * ──────────────────────────────────────────────────────────────────────
 *
 *  ÉTAPES D'INSTALLATION (5 minutes) :
 *
 *  1. Allez sur https://sheets.google.com et créez une NOUVELLE feuille.
 *     Renommez-la par ex. « RSVP Mariage Pauline & Damien ».
 *
 *  2. Dans le menu : Extensions ▸ Apps Script.
 *     Une fenêtre de code s'ouvre.
 *
 *  3. Effacez tout le contenu par défaut, puis COLLEZ tout ce fichier.
 *     Enregistrez (icône disquette ou Ctrl/Cmd + S).
 *
 *  4. Cliquez sur « Déployer » (en haut à droite) ▸ « Nouveau déploiement ».
 *       • Type        : Application Web
 *       • Description  : RSVP
 *       • Exécuter en tant que : Moi
 *       • Qui a accès  : Tout le monde   ← IMPORTANT
 *     Cliquez « Déployer », autorisez l'accès à votre compte si demandé.
 *
 *  5. Copiez l'URL « Application Web » qui se termine par /exec.
 *     Ouvrez infos.html et collez cette URL dans la ligne :
 *         const SHEET_ENDPOINT = "";   ←  entre les guillemets
 *
 *  C'est tout ! Chaque réponse RSVP arrivera comme une nouvelle ligne
 *  dans la feuille. (Astuce : si vous modifiez le script plus tard,
 *  refaites « Déployer ▸ Gérer les déploiements ▸ Modifier ▸ Nouvelle version ».)
 * ──────────────────────────────────────────────────────────────────────
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // En-têtes (créés une seule fois, à la première réponse)
    var headers = ['Horodatage', 'Prénom', 'Nom', 'Email', 'Présence',
                   'Nombre de personnes', 'Enfants présents', 'Nombre d\'enfants', 'Régime alimentaire', 'Message'];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    // Lecture des données (envoyées en JSON dans le corps de la requête)
    var data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      data = e.parameter || {};
    }

    sheet.appendRow([
      data.date     || new Date().toLocaleString('fr-FR'),
      data.prenom   || '',
      data.nom      || '',
      data.email    || '',
      data.presence || '',
      data.nb       || '',
      data.enfants  || '',
      data.enfantsNb|| '',
      data.regime   || '',
      data.message  || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Permet de vérifier rapidement que le déploiement répond (ouvrez l'URL /exec dans le navigateur).
function doGet() {
  return ContentService
    .createTextOutput('RSVP endpoint actif ✓')
    .setMimeType(ContentService.MimeType.TEXT);
}
