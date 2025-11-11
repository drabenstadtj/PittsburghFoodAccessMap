# app/database/intake_supermarkets.py
import sys
import pandas as pd
from sqlalchemy import and_

from app import create_app
from app.database.db import db
from app.models.food_resource import FoodResource

CAT_MAP = {
    "convenience": "corner_store",
    "convenience store": "corner_store",
    "c-store": "corner_store",
    "supermarket": "grocery",
    "grocery": "grocery",
    "market": "grocery",
    "grocery store": "grocery",
    "super market": "grocery",
    "farmers market": "farmers_market",
}

def map_category(raw: str) -> str:
    if not raw:
        return "grocery"
    t = str(raw).strip().lower()
    for key, out in CAT_MAP.items():
        if key in t:
            return out
    # heuristics
    if "conven" in t:
        return "corner_store"
    if "groc" in t or "market" in t or "super" in t:
        return "grocery"
    return "grocery"

def safe_float(v):
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    try:
        return float(str(v).replace(",", "."))
    except Exception:
        return None

def normalize_df(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = (
        df.columns.str.strip().str.lower().str.replace(r"[^\w]+", "_", regex=True)
    )
    return df

def build_address(row) -> str:
    # Street # + Street Name + State + Zip
    num = str(row.get("street___", "")).strip() if "street___" in row else str(row.get("street__", "")).strip()
    # Some Excel exports collapse "Street #" -> "street_#". After normalization it's "street__" or "street___".
    if "street_" in row and "street__" not in row and "street___" not in row:
        num = str(row.get("street_", "")).strip() or num

    street = str(row.get("street_name", "")).strip()
    state = str(row.get("state", "")).strip()
    zipc = str(row.get("zip", "")).strip() or str(row.get("zip_code", "")).strip()

    parts = []
    if num and num.lower() != "nan":
        parts.append(num)
    if street and street.lower() != "nan":
        parts.append(street)
    if state and state.lower() != "nan":
        parts.append(state)
    if zipc and zipc.lower() != "nan":
        parts.append(zipc)

    return ", ".join(parts) if parts else None

def upsert_resource(payload):
    existing = FoodResource.query.filter(
        and_(
            FoodResource.name == payload["name"],
            FoodResource.latitude == payload["latitude"],
            FoodResource.longitude == payload["longitude"],
        )
    ).first()
    if existing:
        # update minimal fields
        for k, v in payload.items():
            setattr(existing, k, v)
        return "updated"
    db.session.add(FoodResource(**payload))
    return "inserted"

def load_frame(path: str) -> pd.DataFrame:
    if path.lower().endswith((".xlsx", ".xls")):
        # load all sheets and concat
        xls = pd.ExcelFile(path)
        frames = []
        for sheet in xls.sheet_names:
            frames.append(pd.read_excel(path, sheet_name=sheet))
        df = pd.concat(frames, ignore_index=True)
    else:
        df = pd.read_csv(path)
    return normalize_df(df)

def main(path: str):
    app = create_app("development")
    with app.app_context():
        df = load_frame(path)

        # expected normalized columns after normalize_df():
        # _id, client_id, name, legal_name, start_date, street___ / street__, street_name, state, zip, lat, lon, accuracy, category
        needed = ["name", "lat", "lon"]
        for n in needed:
            if n not in df.columns:
                raise SystemExit(f"Missing required column: {n}")

        inserted = updated = skipped = 0
        reasons = []

        for i, row in df.iterrows():
            name = str(row.get("name") or "").strip()
            lat = safe_float(row.get("lat"))
            lon = safe_float(row.get("lon"))
            category_raw = row.get("category")
            if not name or lat is None or lon is None:
                skipped += 1
                reasons.append((i, "missing name/lat/lon"))
                continue

            payload = {
                "name": name,
                "resource_type": map_category(category_raw),
                "address": build_address(row),
                "neighborhood": None,  # unknown in this sheet
                "latitude": lat,
                "longitude": lon,
                "phone": None,
                "website": None,
                "description": str(row.get("legal_name") or "").strip() or "Imported record",
                "hours": {},  # none in this sheet
            }

            try:
                status = upsert_resource(payload)
                if status == "inserted":
                    inserted += 1
                else:
                    updated += 1
            except Exception as e:
                db.session.rollback()
                skipped += 1
                reasons.append((i, f"DB error: {e}"))
                continue

        db.session.commit()
        print(f"Done: inserted={inserted} updated={updated} skipped={skipped}")
        if reasons:
            print("Skip reasons (first 20):")
            for r in reasons[:20]:
                print("  row", r[0], "-", r[1])

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m app.database.intake_supermarkets <path_to_file.xlsx|csv>")
        sys.exit(1)
    main(sys.argv[1])
