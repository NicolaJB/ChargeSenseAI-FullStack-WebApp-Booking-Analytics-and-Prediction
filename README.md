# ChargeSense AI: Weekly Booking Insights Generator

ChargeSenseAI is a full-stack web application for analysing and visualising school booking charges from Excel files. It provides interactive charts and tables for customer segments, weekly charges, predicted charges, and bus usage.

⚠️ **Note:** All data in this repository is synthetic and anonymised for demonstration purposes. No real individuals’ data is included.  
The dummy data provided is limited in scope and is only intended to demonstrate the app’s functionality; results may not reflect real-world usage or full-scale datasets.

## Tech Stack

- **Frontend:** React + TypeScript + Next.js 14  
- **Charts:** Chart.js  
- **Backend:** FastAPI (Python)  
- **Data Processing:** Pandas, NumPy, scikit-learn  

## Features

- Upload Excel files (.xlsx or .xls) with student booking data
- Calculate total charges using business rules (AM, Explorers 1–3, late fees, etc.)
- Forecast weekly charges using simple linear regression
- Display top 5 student spenders with predicted charges
- Interactive charts and tables for:
  - Customer segments
  - Weekly total charges (actual vs predicted)
  - Bus usage per day/session
- Predicted charges are displayed and rounded for clarity

## Project Structure
```bash
ChargeSenseAI/
├─ chargesenseai-backend/ # FastAPI backend
│ ├─ app/
│ │ └─ main.py
│ └─ requirements.txt
├─ chargesenseai-frontend/ # Next.js frontend (React + TS)
│ ├─ app/
│ │ ├─ upload/
│ │ │ └─ page.tsx
│ │ ├─ layout.tsx
│ │ └─ page.tsx
│ ├─ components/
│ │ ├─ Charts.tsx
│ │ ├─ CustomerSummary.tsx
│ │ ├─ Dashboard.tsx
│ │ ├─ Navigation.tsx
│ │ ├─ SegmentationResults.tsx
│ │ ├─ Toast.tsx
│ │ └─ UploadForm.tsx
├─ package.json
└─ README.md
```
## Prerequisites
- Node.js 18+ with npm or yarn  
- Python 3.10+  
- pip packages: FastAPI, uvicorn, pandas, numpy, scikit-learn, openpyxl  
- Optional: PyCharm or VSCode

## Backend Setup
```bash
cd chargesenseai-backend
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 51115
```
The backend will run at http://127.0.0.1:51115.

Backend confirmation message:
```bash
{"message":"ChargeSense AI Backend is running. Use POST /upload to send Excel or CSV files."}
```

This indicates the backend is ready to receive uploaded Excel or CSV files at the /upload endpoint.

## Frontend Setup
```bash
cd ../app
npm install      # or yarn
npm run dev      # or yarn dev
```
Open http://localhost:3000.

The first page is the upload page, where you can select and upload Excel files.

## Usage
Select an Excel file with required columns, including:
```bash
Forename, Surname, Year, Charge, AM, Explorers 1, Explorers 2, Explorers 3,
Late booking charge, Charge for no booking, Late pick up charge, Late cancellation charge
```
Click Upload and view the Dashboard with explanations above each table and chart:

- Top 5 Student Spenders Table – shows total and predicted charges per student.
- Weekly Charges Chart – compares actual vs predicted charges per day.
- Bus Usage Chart – shows bookings per bus service across the week.
- Predicted charges are calculated using linear regression based on booking frequency and weekly totals.

## Notes
- Ensure the backend port matches the frontend fetch URL (http://127.0.0.1:51115/upload)
- The frontend is fully written in TypeScript with React components.
- Predicted values in tables and charts are rounded to two decimal places for readability.

## License
MIT License
