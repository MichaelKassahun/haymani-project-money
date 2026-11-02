HAYMANI PROJECT MONEY / BUSINESS & LIFE OS - V6 (Ethiopian calendar + Smart SMS importer)

CALENDAR
All dates are entered and shown in the Ethiopian calendar (E.C.): day / month / year pickers with the 13 months
(Meskerem ... Pagume). Pagume has 5 days, or 6 in a leap year (2019 E.C. is a leap year). Under each picker the
Gregorian equivalent is shown for reference. Records are stored internally as ISO Gregorian dates, so sorting, backups
and the Excel exports stay reliable. Reports use Ethiopian periods: this week (Monday-today), this Ethiopian month,
this Ethiopian year (Meskerem 1 - today), custom range, or all dates. The CSV export has both a "Date (E.C.)" and a
"Date (Gregorian)" column.

FEATURES (from V3 + earlier versions)
- Projects with customer, quotation no., quoted price, expected cost, ADVANCE, START DATE, DEADLINE and NOTES; Edit project.
- Project money: expenses and customer payments; Edit / Delete any transaction from the project ledger.
- The project's advance is kept as one linked customer payment in the ledger (editing either keeps them in sync).
- Non-project (overhead) expenses; opening cash/bank balance; net cash on the Home screen.
- Weekly / monthly / yearly / custom reports, Print / Save as PDF, CSV for Excel, JSON backup and restore.
- Master Plan (DOCX) and Control Workbook (XLSX). Both already use 2019 E.C. and calendar-neutral M1-M12 / W1-W52 labels.

NET CASH NOTE
Net cash on the Home screen counts entries dated up to TODAY. An entry dated in the future is included in totals
and reports for its period, but not in today's cash balance.

INSTALL / UPDATE
1. Extract the ZIP. Upload the CONTENTS of the haymani_app folder to the root of your HTTPS hosting repository
   (e.g. GitHub Pages), replacing the old files. index.html must stay at the published root.
2. Before updating, download a JSON backup (More > Download full JSON backup).
3. Open the app online once. The new version appears the next time you open it. If it still looks old, close the app
   completely and reopen it.
4. Existing data is kept. Data from the earlier Project Money tracker is converted automatically.

DATA STORAGE
Records are stored in the browser on this phone only. The Home Screen app and Safari keep separate storage, so use one
of them consistently and export backups regularly.

PDF ON IPHONE
Generate a report, then "Print / Save report as PDF". If a new tab is blocked, the page itself is printed instead; on
iPhone use the share/print sheet to save the PDF.

SMART BANK SMS IMPORTER (SMS tab)
- Paste CBE / Telebirr messages (or choose a .txt export) and tap Analyze. The app cannot read the phone's SMS inbox;
  import is manual and stays on this device.
- Every message goes to a review queue. Nothing is saved until you approve it. You choose: customer income (optionally
  linked to a project), project expense, Haymani overhead, transfer between your own accounts (not counted), personal
  (excluded), or keep pending.
- The transaction date is an Ethiopian date picker, pre-filled from the message, so a provisional date can be corrected
  before saving. Bank fees/VAT are saved separately as Bank Fees overheads.
- Duplicates are blocked by transaction reference + message fingerprint. If you DELETE a transaction that came from an
  SMS, the message can be imported again and re-classified.
- Income that is not linked to a project appears under Projects > "Unassigned money", where you can assign it to a
  project (Edit) or delete it. It always counts in cash and reports.
- Only the CBE and Telebirr message wordings supplied during development are recognised. Other messages are skipped,
  not guessed. Always check date, amount, recipient and purpose before approving.
