function submitRenewalRecord() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RENEWAL");

  // INPUTS
  const recordsSpreadsheetId = sheet.getRange("C4").getValue();
  const semester = sheet.getRange("F4").getValue();

  const studentId = sheet.getRange("D6").getValue();
  const studentName = sheet.getRange("D8").getValue();

  const gwa = sheet.getRange("C14").getValue();
  const gratis = sheet.getRange("D14").getValue();
  const f = sheet.getRange("E14").getValue();
  const cg = sheet.getRange("F14").getValue();
  const remarks = sheet.getRange("G14").getValue();

  if (!studentId || !semester) return;

  // DETECT SCHOOL YEAR TAB
  const startYear = studentId.toString().substring(0, 4);
  const endYear = Number(startYear) + 1;
  const targetSheetName = startYear + "-" + endYear;

  const recordsSS = SpreadsheetApp.openById(recordsSpreadsheetId);
  const targetSheet = recordsSS.getSheetByName(targetSheetName);

  if (!targetSheet) return;

  const lastRow = targetSheet.getLastRow();
  const lastCol = targetSheet.getLastColumn();

  // FIND STUDENT ROW (COLUMN C)
  const studentIds = targetSheet.getRange(1, 3, lastRow).getValues();

  let studentRow = -1;

  for (let i = 0; i < studentIds.length; i++) {
    if (studentIds[i][0].toString().trim() === studentId.toString().trim()) {
      studentRow = i + 1;
      break;
    }
  }

  if (studentRow == -1) return;

  // NORMALIZE FUNCTION (FIX SPACE ISSUE)
  function normalize(text) {
    return text
      .toString()
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  const inputSemester = normalize(semester);

  // FIND SEMESTER IN ROW 2 (MERGED CELLS)
  const mergedRanges = targetSheet.getRange(2, 1, 1, lastCol).getMergedRanges();

  let semesterCol = -1;

  mergedRanges.forEach(range => {

    const value = normalize(range.getCell(1,1).getValue());

    if (value === inputSemester) {
      semesterCol = range.getColumn();
    }

  });

  if (semesterCol == -1) return;

  // UPDATE RECORDS
  targetSheet.getRange(studentRow, semesterCol).setValue(gwa);
  targetSheet.getRange(studentRow, semesterCol + 1).setValue(gratis);
  targetSheet.getRange(studentRow, semesterCol + 2).setValue(f);
  targetSheet.getRange(studentRow, semesterCol + 3).setValue(cg);
  targetSheet.getRange(studentRow, semesterCol + 4).setValue(remarks);

  // HISTORY (ONLY NAME + SEMESTER)
  sheet.getRange("D20").setValue(sheet.getRange("D19").getValue());
  sheet.getRange("D19").setValue(sheet.getRange("D18").getValue());

  const historyText = studentName + " is NOW RENEW";
  sheet.getRange("D18").setValue(historyText);

  // CLEAR INPUT FIELDS
  sheet.getRange("D6").clearContent();
  sheet.getRange("D8").clearContent();
  sheet.getRange("D10").clearContent();
  sheet.getRange("C14:G14").clearContent();

}