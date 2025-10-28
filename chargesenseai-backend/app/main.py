from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="ChargeSense AI Backend")

# Allow frontend dev server connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:51115", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Helper Functions ---------------- #

def safe_number(x):
    """Convert a value to float safely. Treats 'Bus' and non-numeric strings as 0.0"""
    try:
        if pd.isna(x):
            return 0.0
        if isinstance(x, str):
            x = x.strip().replace("£", "")
            if x.lower() == "bus" or x == "":
                return 0.0
        return float(x)
    except:
        return 0.0

def is_bus(x):
    """Determine if a value represents a bus booking. Returns 1 for positive numbers or 'Bus', else 0"""
    if isinstance(x, str) and "bus" in x.lower():
        return 1
    try:
        return 1 if float(x) > 0 else 0
    except:
        return 0

# ---------------- Routes ---------------- #

@app.get("/")
async def root():
    return {"message": "ChargeSense AI Backend is running. Use POST /upload to send Excel or CSV files."}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # ---------------- Validate file type ---------------- #
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(status_code=400, detail="Unsupported file type. Upload CSV or Excel.")

    # ---------------- Read file ---------------- #
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file.file)
            sheets = {"Sheet1": df}
        else:
            xls = pd.ExcelFile(file.file)
            sheets = {sheet_name.strip(): xls.parse(sheet_name) for sheet_name in xls.sheet_names}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    # ---------------- Validate Required Tabs ---------------- #
    required_tabs = {
        "Mon": ["Mon", "Monday"],
        "Tues": ["Tues", "Tue", "Tuesday"],
        "Wed": ["Wed", "Wednesday"],
        "Thurs": ["Thurs", "Thu", "Thursday"],
        "Fri": ["Fri", "Friday"]
    }

    missing_tabs = []
    day_sheets = {}
    for key, alternatives in required_tabs.items():
        for sheet in alternatives:
            if sheet in sheets:
                day_sheets[key] = sheet
                break
        else:
            missing_tabs.append(key)

    if missing_tabs:
        raise HTTPException(status_code=400, detail=f"Missing required tabs: {', '.join(missing_tabs)}")

    # ---------------- Process Each Day ---------------- #
    customer_segments = []
    weekly_charges = []
    bus_usage = []
    all_charges = []

    numeric_cols = [
        "Charge", "AM", "Explorers 1", "Explorers 2", "Explorers 3",
        "Late booking charge", "Charge for no booking",
        "Late pick up charge", "Late cancellation charge"
    ]
    sessions = ["AM", "Explorers 1", "Explorers 2", "Explorers 3"]

    for day_key, sheet_name in day_sheets.items():
        df_day = sheets[sheet_name].copy()
        df_day.columns = [str(c).strip() for c in df_day.columns]

        # Fill missing numeric columns
        for col in numeric_cols:
            df_day[col] = df_day.get(col, 0.0).map(safe_number)

        # Ensure Notes column exists
        df_day["Notes"] = df_day.get("Notes", "").fillna("").astype(str).str.strip()

        # ---------------- Customer Segments ---------------- #
        df_day["segment"] = (df_day.get("Forename", "").astype(str).str.strip() + " " +
                             df_day.get("Surname", "").astype(str).str.strip()).str.strip()
        df_day = df_day[df_day["segment"] != ""]

        df_day["totalCharge"] = df_day[numeric_cols].sum(axis=1)
        df_day["bookingCount"] = df_day[sessions].gt(0).sum(axis=1)

        for _, row in df_day.iterrows():
            customer_segments.append({
                "segment": row["segment"],
                "day": day_key,
                "totalCharge": row["totalCharge"],
                "bookingCount": int(row["bookingCount"]),
                "notes": row["Notes"]
            })

        # ---------------- Weekly Charges ---------------- #
        weekly_charges.append({
            "day": day_key,
            "totalCharge": df_day[numeric_cols].sum().sum(),
            "predictedCharge": df_day[numeric_cols].sum().sum()
        })

        # ---------------- Bus Usage ---------------- #
        for session in sessions:
            bus_usage.append({
                "day": day_key,
                "busService": session,
                "usage": int(df_day[session].map(is_bus).sum())
            })

        # ---------------- Collect Charges ---------------- #
        for col in ["Charge", "Late booking charge", "Charge for no booking",
                    "Late pick up charge", "Late cancellation charge"]:
            all_charges.extend(df_day[col].tolist())

    # ---------------- Charge Distribution ---------------- #
    charge_distribution = []
    if all_charges:
        bins = [0, 5, 10, 15, 20, 25, 50, 100]
        s = pd.Series(all_charges)
        counts = pd.cut(s, bins=bins, right=True).value_counts().sort_index()
        charge_distribution = [{"range": str(interval), "count": int(count)} for interval, count in counts.items()]

    # ---------------- Classification Comparison ---------------- #
    classification_comparison = [{"actual": "N/A", "predicted": "N/A", "count": len(customer_segments)}]

    # ---------------- Return JSON ---------------- #
    return {
        "customerSegments": customer_segments,
        "weeklyCharges": weekly_charges,
        "chargeDistribution": charge_distribution,
        "classificationComparison": classification_comparison,
        "busUsage": bus_usage
    }
