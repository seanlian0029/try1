/* Google OAuth client ID and restricted browser API key copied from your fellowship example.
   Add the new GitHub Pages origin to this OAuth client in Google Cloud, or use a new web client.
   Never include an OAuth client SECRET or service-account private key here. */
window.SCHOLARSHIP_CONFIG = {
  apiKey: 'AIzaSyBDHHZ0uYqL9H-AHMREsdlyO1mnvRpApYE',
  clientId: '759488111791-k2omumkdn92q5umrvrcd4l3me0bdtjtj.apps.googleusercontent.com',
  // Spreadsheet containing year tabs such as 2021-2022, 2023-2024.
  // This replaces the destination ID formerly entered in RENEWAL!C4.
  recordsSpreadsheetId: '1e-sol4dMlCPP_DiYjXPDo-v_4dYAy6BBFlVx2vXVVcs',
  // Google spreadsheet previously bound to the existing Apps Script;
  // tabs STUDENT INFORMATION and RENEWED are here.
  informationSpreadsheetId: '1doVn5P-wsqN0INmkFS7rVvgTwNiSJcSQkLl89hhuMZc',
  informationSheet: 'STUDENT INFORMATION',
  renewedSheet: 'RENEWED',
  // Optional one-account UI check. All three stages remain available.
  // This is NOT a security boundary: restrict Sheets sharing and OAuth too.
  allowedEmails: ['scholarship@grc.edu.ph'],
  requireAllowedEmail: true
};
