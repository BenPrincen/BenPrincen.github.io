# Monthly Spending Tracker

Simple GitHub Pages-friendly spending tracker with two modes:

- `Input Spending` to add an amount, category, and date
- `Current Month` to view this month's totals and category breakdown

## How to use

1. Open `index.html` locally, or deploy the repo with GitHub Pages.
2. Add entries in the input view.
3. Switch to the current month view to see totals.
4. Use `Export JSON` or `Export CSV` to save the data to a file.
5. Use `Import File` to load a previously exported file.

## Storage

The app saves entries in browser `localStorage`, which works on GitHub Pages
because it is a static hosting service. It can also import/export JSON or CSV
files for backup or bulk loading.

## GitHub Pages

GitHub Pages cannot run `server.py` or write to a server-side JSON file. Each
browser keeps its own saved data unless you export it and import it elsewhere.
