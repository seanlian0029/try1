# Scholarship Management Portal — GitHub Pages version

## What is deployed where?

**Website:** GitHub Pages (`index.html`, `style.css`, `script.js`, `api.js`, `auth.js`, `config.js`).
**Student records:** Your existing Google Sheets.
**Connect Google:** OAuth account selection, like the uploaded attendance website. The selected Google account must have Editor permission on BOTH spreadsheets. One connected account can switch freely among all three stages.
**Apps Script:** Not required to deploy this browser-to-Sheets version. Your original `.gs` files are included **unchanged for reference**, but cannot execute directly inside GitHub Pages.

## 1. Configure your spreadsheet IDs (edit `config.js`)

- `recordsSpreadsheetId`: destination spreadsheet that your existing `RENEWAL!C4` used (school-year tabs `2021-2022`, etc.).
- `informationSpreadsheetId`: the spreadsheet to which the previous Apps Script was attached, containing `STUDENT INFORMATION` and `RENEWED` tabs. It can be the same spreadsheet ID as the records spreadsheet if that's how you store data.
- `informationSheet` and `renewedSheet` must match exact tab names.
- **Do not put OAuth client secrets, passwords, access tokens, or service-account JSON in GitHub.** The browser API key and web client ID are public identifiers; restrict their use in Google Cloud.

## 2. Google Cloud setup

The browser API key and OAuth **web client ID** from your uploaded `fellowship-main` example have already been inserted into `config.js`. They are not secret passwords. You may replace them with a new pair if preferred. In Google Cloud Console:

1. Enable **Google Sheets API**.
2. Create or select an OAuth **Web application** client; under **Authorized JavaScript origins**, add `https://YOUR-USERNAME.github.io` (origin only; not `/repo-name`).
3. Set consent screen / test users correctly for the authorized staff accounts.
4. Restrict the browser API key by website referrer `https://YOUR-USERNAME.github.io/*` and restrict API usage to Google Sheets API. Restrict OAuth users and Google Sheet sharing too.
5. The **browser API key** and **OAuth Web client ID** are already in `config.js`; verify that this OAuth client allows the new GitHub Pages origin.
6. `allowedEmails` in `config.js` is initially set to `scholarship@grc.edu.ph`; change it if your intended Google account is different. With `requireAllowedEmail: true`, the interface checks that email after Google sign-in. There are no stage assignments; the connected account can access Stage 1, 2, and 3.
7. Share BOTH spreadsheets only with your chosen account (and any necessary owners/admins), giving it Editor permission. Remove unnecessary access. Restrict the OAuth consent screen to the intended account(s) where applicable.

## 3. Deploy to GitHub Pages

1. Make a **new** repository and upload all six website files at the repository root. (Don't overwrite your Attendance repository.)
2. Settings → Pages → Deploy from branch → `main` / `(root)` → Save.
3. Open the published `https://YOUR-USERNAME.github.io/REPOSITORY/` site using HTTPS.
4. Click **Connect Google**, choose the staff's approved Google account, and authorize Sheets permission.
5. Test with sample data, check both the destination year tab and `RENEWED` column B.

## 4. How the three stages work

- Stage 1 searches the `YYYY-YYYY` tabs for the ID in C, name in D, course in F. Submission locates the merged **row 2** semester heading, and writes **GWA, Gratis, Fellowship, Caregroup** to the four consecutive columns. The semester typed in the form remains after submitting.
- Stage 2 searches `STUDENT INFORMATION` column A; existing A:H fields can be completed or edited. An unknown ID offers **Add New Student**, appending information in A:H.
- Stage 3 finds the same year tab + semester, loads all five record fields, allows corrections, writes **GWA, Gratis, Fellowship, Caregroup, Remarks** to those same cells, and adds Student ID to `RENEWED` column **B**, unless it's already listed.
- Remarks dropdown: RENEW, SKTK, EXIT, OTHERS (typing field).
- Automatic Student ID formatting: `20210700227` → `2021-07-00227`.

## Important limits of this architecture

- **The frontend `allowedEmails` check is NOT strong access control.** It can be bypassed by someone modifying the public GitHub-hosted code. Only share the Google Sheets with trusted accounts and configure the OAuth application appropriately. Any account with spreadsheet Editor access may change any cells allowed by Google Sheets.
- To *enforce* different staff permissions securely, use a protected backend (for example Apps Script with properly validated authentication, or Cloud Run) that checks roles server-side. OAuth through Google Cloud Identity and secured backend requires additional setup; do not assume that hiding a stage makes it private.
- Because Sheets API calls are independent, simultaneous users can race when appending new students or renewing the same ID. Do not use this browser-only version when strict duplicate prevention or guaranteed multi-station atomic writes are required without backend locking.
- Original `submitRenewalRecord()` uses spreadsheet cell addresses and Apps Script, so it **cannot be called unchanged from a GitHub Pages browser**. The browser version reproduces its destination and merged-heading logic using Sheets API; the original script files remain unchanged.
- Stage 1 does **not** insert a new student row in the school-year records; it updates an existing matching record, just like your original function.
- Stage 3 only adds the ID to `RENEWED` column B; it does not fill CTRL No / Name / Course / Scholarship / % columns because your stated requirement specified column B. Those can be added after confirming the destination column rules.
- Google OAuth authorization tokens are kept only in browser memory and are cleared on disconnect or page refresh. Semester text alone is saved locally to preserve your semester input.
- If the browser reports an error after writing, **check the sheet** before resubmitting.

### Troubleshooting

- `origin_mismatch`: Authorized JavaScript origin must match the **GitHub Pages origin**, not full path.
- `403` or permission denied: signed-in user must have appropriate Google Sheets access and API enabled.
- Semester not found: your records spreadsheet must have the semester text **in a merged row-2 range**, consistent with your original code.
- Student not found: make sure the ID is stored as plain text with the dashes and the relevant year tab uses columns C/D/F.

## Important: Source of Google connection settings

`config.js` includes the browser API key and OAuth web-client ID found in your uploaded `fellowship-main(1).zip`, rather than generating new credentials. **Google may reject the new GitHub Pages origin** until you add that site under Authorized JavaScript origins in Google Cloud. You still must supply the destination spreadsheet IDs and permitted staff emails. Never publish an OAuth client secret.

## Updated connection behavior

- The **Connect Google** button opens the Google account chooser.
- `scholarship@grc.edu.ph` is the initial allowed email in `config.js` (editable).
- Once connected, **all Stage 1 / Stage 2 / Stage 3 tabs** are visible; no station-role lock.
- Only the chosen account should be granted spreadsheet access for the requested single-account workflow.
- After uploading updated files to GitHub, force-refresh the page (Ctrl+Shift+R) to discard the old cached JavaScript.
