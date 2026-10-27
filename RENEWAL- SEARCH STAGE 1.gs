function fetchStudentInfo() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getName() !== "RENEWAL") return;

  const studentId = String(sheet.getRange("D6").getValue()).trim();

  if (!studentId) {
    sheet.getRange("D8").clearContent();
    sheet.getRange("D10").clearContent();
    sheet.getRange("D16").clearContent();
    return;
  }

  const sourceSheetId = sheet.getRange("C4").getValue().toString().trim();
  if (!sourceSheetId) {
    sheet.getRange("D16").setValue("PLEASE ENTER SOURCE SHEET ID IN C4");
    return;
  }

  let sourceSS;
  try {
    sourceSS = SpreadsheetApp.openById(sourceSheetId);
  } catch (err) {
    sheet.getRange("D16").setValue("CANNOT ACCESS SOURCE SHEET – CHECK PERMISSIONS");
    return;
  }

  const allSheets = sourceSS.getSheets();
  let found = false;

  // ✅ Loop only through tabs with names like YYYY-YYYY
  const yearTabs = allSheets.filter(tab => /^\d{4}-\d{4}$/.test(tab.getName()));

  for (let t = 0; t < yearTabs.length; t++) {
    const tab = yearTabs[t];
    const data = tab.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const sourceId = String(data[i][2]).trim(); // Column C = Student ID
      if (sourceId === studentId) {
        sheet.getRange("D8").setValue(data[i][3]); // Column D = Name
        sheet.getRange("D10").setValue(data[i][5]); // Column F = Course
        sheet.getRange("D16").setValue("STUDENT FOUND (tab: " + tab.getName() + ")");
        found = true;
        break;
      }
    }

    if (found) break;
  }

  if (!found) {
    sheet.getRange("D8").clearContent();
    sheet.getRange("D10").clearContent();
    sheet.getRange("D16").setValue("STUDENT ID NOT FOUND");
  }
}
