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
 *  C'est tout ! Chaque réponse RSVP arrive dans l'onglet « Réponses »,
 *  avec UNE LIGNE PAR PERSONNE (un trait en haut sépare chaque réponse).
 *  (Astuce : si vous modifiez le script plus tard, refaites
 *  « Déployer ▸ Gérer les déploiements ▸ Modifier ▸ Nouvelle version ».)
 * ──────────────────────────────────────────────────────────────────────
 */

var SHEET_NAME = 'Réponses';

var HEADERS = ['Horodatage', 'Prénom', 'Nom', 'Email de contact', 'Présence',
               'Nombre de personnes (réponse)', 'Personne n°', 'Adulte / Enfant',
               'Végétarien', 'Allergies / restrictions', 'Mairie 19/10', 'Brunch 21/10',
               'Musique', 'Message'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // En-têtes (créés une seule fois, à la première réponse)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Lecture des données (envoyées en JSON dans le corps de la requête)
    var data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      data = e.parameter || {};
    }

    var yesNo = function (v) { return v === 'oui' ? 'Oui' : (v === 'non' ? 'Non' : (v || '')); };
    var kind  = function (v) { return v === 'adulte' ? 'Adulte' : (v === 'enfant' ? 'Enfant' : (v || '')); };

    // Une entrée par personne. Sans détail (refus de venir, ou ancienne version
    // du formulaire), on enregistre une seule ligne à partir des champs de base.
    var people = (data.personnes && data.personnes.length)
      ? data.personnes
      : [{ prenom: data.prenom, nom: data.nom, restrictions: data.regime || '' }];

    var attending = data.presence === 'oui';
    var date = data.date || new Date().toLocaleString('fr-FR');

    var rows = people.map(function (p, k) {
      return [
        date,
        p.prenom || '',
        p.nom || '',
        data.email || '',
        yesNo(data.presence),
        attending ? (data.nb || people.length) : '',
        attending ? k + 1 : '',
        kind(p.type),
        yesNo(p.vegetarien),
        p.restrictions || '',
        yesNo(p.mairie),
        yesNo(p.brunch),
        k === 0 ? (data.musique || '') : '',
        k === 0 ? (data.message || '') : ''
      ];
    });

    var start = sheet.getLastRow() + 1;
    sheet.getRange(start, 1, rows.length, HEADERS.length).setValues(rows);
    sheet.getRange(start, 1, 1, HEADERS.length)
         .setBorder(true, null, null, null, null, null, '#b3892f', SpreadsheetApp.BorderStyle.SOLID);

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
    .createTextOutput('RSVP endpoint actif ✓ (v3 : une ligne par personne)')
    .setMimeType(ContentService.MimeType.TEXT);
}
