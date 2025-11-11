# intake.py
import argparse
import json
import sys
from pathlib import Path

import pandas as pd

from app import create_app
from app.database.db import db
from app.models.food_resource import FoodResource

# category normalization (simple)
RAW_TO_RESOURCE_TYPE = {
    "community-farm": "community_farm",
    "community-garden": "community_garden",
    "school-garden": "school_garden",
    "commercial-urban-farm": "urban_farm",
    "allegheny-grows-site": "program_site",
    "grow-pittsburgh-site": "partner_site",
    "sustainability-fund-site": "funded_site",
    "other": "other",
}

def first_mapped_category(raw: str) -> str:
    """Take first pipe-delimited token that maps, else 'other'."""
    if not raw or pd.isna(raw):
        return "other"
    for tok in str(raw).split("|"):
        tok = tok.strip()
        if tok in RAW_TO_RESOURCE_TYPE:
            return RAW_TO_RESOURCE_TYPE[tok]
    return "other"


# --- IO helpers ---
def read_tabular(path: Path) -> pd.DataFrame:
    if path.suffix.lower() in {".xlsx", ".xls"}:
        return pd.read_excel(path)
    try:
        return pd.read_csv(path)
    except Exception:
        return pd.read_csv(path, sep="\t")


def fmt_address(street, city, state, zip_code):
    parts = [p for p in [street, city, state] if p and not pd.isna(p)]
    tail = str(zip_code).split(".")[0] if pd.notna(zip_code) else None
    if tail:
        return f"{', '.join(parts)} {tail}"
    return ", ".join(parts) if parts else None


def row_to_resource_kwargs(row: pd.Series) -> dict:
    name = row.get("urban_grower") or row.get("name")
    website = row.get("url")
    resource_type = first_mapped_category(row.get("category"))
    address = fmt_address(
        row.get("street_address"),
        row.get("city"),
        row.get("state"),
        row.get("zip_code"),
    )

    neighborhood = row.get("neighborhood")
    if not neighborhood and str(row.get("city") or "").lower().strip() == "pittsburgh":
        neighborhood = None

    lat = row.get("latitude")
    lon = row.get("longitude")
    latitude = float(lat) if pd.notna(lat) else None
    longitude = float(lon) if pd.notna(lon) else None

    return dict(
        name=name,
        resource_type=resource_type,
        address=address,
        neighborhood=neighborhood,
        latitude=latitude,
        longitude=longitude,
        phone=None,
        website=website,
        description="Imported from Grow Pittsburgh directory",
        hours=None,
    )


def upsert_resource(row_kwargs: dict) -> tuple[str, FoodResource]:
    """Upsert by (name, address)."""
    name = (row_kwargs.get("name") or "").strip()
    address = (row_kwargs.get("address") or "").strip()
    if not name:
        return "skipped", None

    q = FoodResource.query.filter(
        FoodResource.name == name,
        FoodResource.address == address if address else FoodResource.address.is_(None),
    )
    existing = q.first()
    if existing:
        for k, v in row_kwargs.items():
            setattr(existing, k, v)
        return "updated", existing

    inst = FoodResource(**row_kwargs)
    db.session.add(inst)
    return "created", inst


def import_sheet(path: Path, truncate: bool) -> dict:
    df = read_tabular(path)
    expected = {
        "urban_grower",
        "category",
        "url",
        "street_address",
        "city",
        "state",
        "zip_code",
        "country",
        "latitude",
        "longitude",
    }
    missing = [c for c in expected if c not in df.columns]
    if missing:
        print(f"Warning: missing columns: {missing}", file=sys.stderr)

    app = create_app("development")
    with app.app_context():
        if truncate:
            FoodResource.query.delete()
            db.session.commit()

        created = updated = skipped = 0

        for _, row in df.iterrows():
            status, _inst = upsert_resource(row_to_resource_kwargs(row))
            if status == "created":
                created += 1
            elif status == "updated":
                updated += 1
            else:
                skipped += 1

        db.session.commit()

        return {"created": created, "updated": updated, "skipped": skipped, "truncated": truncate}


def main():
    p = argparse.ArgumentParser(description="Import food resources from Excel/CSV/TSV into DB.")
    p.add_argument("path", type=Path, help="Path to .xlsx/.csv/.tsv file")
    p.add_argument("--truncate", action="store_true", help="Delete all existing FoodResource rows before import.")
    args = p.parse_args()

    summary = import_sheet(args.path, truncate=args.truncate)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
