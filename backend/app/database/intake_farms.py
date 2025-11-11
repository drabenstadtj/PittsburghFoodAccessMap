# app/database/intake_markets_by_coords.py
import sys
import pandas as pd
from sqlalchemy import and_

from app import create_app
from app.database.db import db
from app.models.food_resource import FoodResource

def norm_cols(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = (
        df.columns.str.strip().str.lower().str.replace(r"[^\w]+", "_", regex=True)
    )
    return df

def ffloat(v):
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    try:
        return float(str(v).strip())
    except Exception:
        return None

def clean_phone(p, ext=None):
    if not p or str(p).strip().lower() in ("nan", "none"):
        return None
    s = "".join(ch for ch in str(p) if ch.isdigit())
    if ext and str(ext).strip():
        s += f" x{ext}"
    return s or None

def map_type(market_type: str) -> str:
    t = (market_type or "").strip().lower()
    if "farm" in t:  # "farm market" or "farm stand"
        return "farmers_market"
    return "farmers_market"

def address(row) -> str:
    parts = [
        (row.get("address1") or "").strip(),
        (row.get("city") or "").strip(),
        (row.get("state") or "").strip(),
        str(row.get("zip_code") or "").strip(),
    ]
    return ", ".join([p for p in parts if p])

def upsert_by_coords(payload):
    existing = FoodResource.query.filter(
        and_(
            FoodResource.name == payload["name"],
            FoodResource.latitude == payload["latitude"],
            FoodResource.longitude == payload["longitude"],
        )
    ).first()
    if existing:
        for k, v in payload.items():
            setattr(existing, k, v)
        return "updated"
    db.session.add(FoodResource(**payload))
    return "inserted"

def load_any(path: str) -> pd.DataFrame:
    if path.lower().endswith((".xlsx", ".xls")):
        xls = pd.ExcelFile(path)
        frames = [pd.read_excel(path, sheet_name=s) for s in xls.sheet_names]
        df = pd.concat(frames, ignore_index=True)
    else:
        df = pd.read_csv(path)
    return norm_cols(df)

def main(path: str):
    app = create_app("development")
    with app.app_context():
        df = load_any(path)

        # required columns after normalization
        for col in ["market_name", "latitude", "longitude"]:
            if col not in df.columns:
                raise SystemExit(f"Missing column: {col}")

        inserted = updated = skipped = 0
        for _, row in df.iterrows():
            name = str(row.get("market_name") or "").strip()
            lat = ffloat(row.get("latitude"))
            lon = ffloat(row.get("longitude"))
            if not name or lat is None or lon is None:
                skipped += 1
                continue

            payload = {
                "name": name,
                "resource_type": map_type(row.get("market_type")),
                "address": address(row),
                "neighborhood": None,  # unknown; you can map later
                "latitude": lat,
                "longitude": lon,
                "phone": clean_phone(row.get("phone"), row.get("phone_ext")),
                "website": None,
                "description": f"{row.get('market_type') or ''} • County: {row.get('county') or ''}".strip(" •"),
                "hours": {},  # not provided
            }

            try:
                status = upsert_by_coords(payload)
                inserted += status == "inserted"
                updated  += status == "updated"
            except Exception as e:
                db.session.rollback()
                skipped += 1
                print(f"Skip due to DB error: {e}")

        db.session.commit()
        print(f"Done: inserted={inserted} updated={updated} skipped={skipped}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m app.database.intake_farms <path_to_xlsx_or_csv>")
        sys.exit(1)
    main(sys.argv[1])
