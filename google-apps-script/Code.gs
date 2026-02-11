/**
 * Google Apps Script - Web App endpoint for lead capture
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Paste this code into Code.gs
 * 4. Replace SPREADSHEET_ID with your Google Sheets ID
 * 5. Click Deploy > New deployment
 * 6. Select "Web app"
 * 7. Set "Execute as" to "Me"
 * 8. Set "Who has access" to "Anyone"
 * 9. Click Deploy and copy the URL
 * 10. Add the URL as PUBLIC_SHEETS_ENDPOINT in your Vercel environment variables
 *
 * GOOGLE SHEET STRUCTURE:
 * Row 1 (headers): Timestamp | Nom | Email | Telephone | Source | Objectif | Niveau | Difficulte |
 *                   UTM Source | UTM Medium | UTM Campaign | UTM Content | FBClid | Consentement Marketing
 */

var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

    // Create headers if first row is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Nom',
        'Email',
        'Telephone',
        'Source',
        'Objectif',
        'Niveau',
        'Difficulte',
        'UTM Source',
        'UTM Medium',
        'UTM Campaign',
        'UTM Content',
        'FBClid',
        'Consentement Marketing'
      ]);
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.nom || '',
      data.email || '',
      data.telephone || '',
      data.source || '',
      data.objectif || '',
      data.niveau || '',
      data.difficulte || '',
      data.utm_source || '',
      data.utm_medium || '',
      data.utm_campaign || '',
      data.utm_content || '',
      data.fbclid || '',
      data.consentementMarketing ? 'Oui' : 'Non'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Lead capture endpoint active' }))
    .setMimeType(ContentService.MimeType.JSON);
}
