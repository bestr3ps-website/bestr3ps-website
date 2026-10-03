// String export of the Google Apps Script for the user to copy
export const GOOGLE_APPS_SCRIPT_FINAL_CODE = `/**
 * =========================================================================
 * BESTR3PS - Google Sheets API
 * =========================================================================
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var allProducts = [];
  
  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2) continue;
    
    var range = sheet.getRange(1, 1, lastRow, lastCol);
    var displayValues = range.getDisplayValues();
    var formulas = range.getFormulas();
    var richTexts = range.getRichTextValues();
    var category = sheet.getName().toUpperCase().trim();
    
    for (var r = 1; r < displayValues.length; r++) {
      for (var col = 0; col < lastCol; col += 4) {
        var name = (displayValues[r][col] || "").trim();
        if (!name || name === "PRODUCT" || name === "LINK" || name === "CellImage") continue;
        
        var link = "";
        if (richTexts[r][col + 1] && typeof richTexts[r][col + 1].getLinkUrl === "function") {
          link = richTexts[r][col + 1].getLinkUrl();
        }
        if (!link && formulas[r][col + 1] && formulas[r][col + 1].indexOf("HYPERLINK") !== -1) {
          var m = formulas[r][col + 1].match(/HYPERLINK\\s*\\(\\s*["']([^"']+)["']/i);
          if (m) link = m[1];
        }
        if (!link) link = (displayValues[r][col + 1] || "").trim();
        
        var price = (displayValues[r][col + 2] || "").trim();
        var img = "";
        if (formulas[r][col + 3] && formulas[r][col + 3].indexOf("IMAGE") !== -1) {
          var im = formulas[r][col + 3].match(/IMAGE\\s*\\(\\s*["']([^"']+)["']/i);
          if (im) img = im[1];
        }
        if (!img) img = (displayValues[r][col + 3] || "").trim();
        
        try {
          var cell = sheet.getRange(r + 1, col + 4);
          var val = cell.getValue();
          if (val && typeof val.getContentUrl === "function") img = val.getContentUrl();
        } catch(e) {}
        
        if (name && (link || img)) {
          allProducts.push({
            name: name,
            sourceUrl: link,
            price: price,
            imageUrl: img,
            category: category
          });
        }
      }
    }
  }
  
  var output = ContentService.createTextOutput(JSON.stringify({ status: "success", products: allProducts }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
`;
