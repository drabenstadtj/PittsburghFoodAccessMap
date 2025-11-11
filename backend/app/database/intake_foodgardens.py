# intake.py
import argparse
import json
import sys
from pathlib import Path

import pandas as pd

from app import create_app
from app.database.db import db
from app.models.food_resource import FoodResource

#  category normalization (keep simple for now) 
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
    """
    The sheet's 'category' can be pipe-delimited.
    Take the first token that maps, else 'other'.
    """
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
    # Fallback: try CSV with delimiter sniffing, but your pasted sample is TSV-like.
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
    """
    Maps one sheet row -> FoodResource(**kwargs)
    Expected columns:
      urban_grower, category, url, street_address, city, state, zip_code,
      country, latitude, longitude
    """
    name = row.get("urban_grower") or row.get("name")
    website = row.get("url")
    resource_type = first_mapped_category(row.get("category"))
    address = fmt_address(
        row.get("street_address"),
        row.get("city"),
        row.get("state"),
        row.get("zip_code"),
    )

    # Use city as neighborhood when city == Pittsburgh and there’s no better source.
    neighborhood = row.get("neighborhood")
    if not neighborhood and str(row.get("city") or "").lower().strip() == "pittsburgh":
        neighborhood = None  # leave null; you can later backfill from a polygon join

    # Coerce lat/lon
    lat = row.get("latitude")
    lon = row.get("longitude")
    latitude = float(lat) if pd.notna(lat) else None
    longitude = float(lon) if pd.notna(lon) else None

    hours = None  # sheet has no hours; keep null
    phone = None  # not provided in this sheet

    description = "Imported from Grow Pittsburgh directory"  # tweak if you want

    return dict(
        name=name,
        resource_type=resource_type,
        address=address,
        neighborhood=neighborhood,
        latitude=latitude,
        longitude=longitude,
        phone=phone,
        website=website,
        description=description,
        hours=hours,  # JSON column; None is fine
    )


def upsert_resource(row_kwargs: dict) -> tuple[str, FoodResource]:
    """
    Upsert by (name, address). Adjust if you prefer a different key.
    Returns ("created"|"updated"|"skipped", instance).
    """
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
        # Update selected fields
        for k, v in row_kwargs.items():
            setattr(existing, k, v)
        return "updated", existing

    inst = FoodResource(**row_kwargs)
    db.session.add(inst)
    return "created", inst


def import_sheet(path: Path, dry_run: bool, truncate: bool) -> dict:
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
        if truncate and not dry_run:
            FoodResource.query.delete()
            db.session.commit()

        created = updated = skipped = 0

        for _, row in df.iterrows():
            kwargs = row_to_resource_kwargs(row)
            status, _inst = upsert_resource(kwargs)
            if status == "created":
                created += 1
            elif status == "updated":
                updated += 1
            else:
                skipped += 1

        if dry_run:
            db.session.rollback()
        else:
            db.session.commit()

        return {"created": created, "updated": updated, "skipped": skipped, "dry_run": dry_run, "truncated": truncate}


def main():
    p = argparse.ArgumentParser(description="Import food resources from Excel/CSV/TSV into DB.")
    p.add_argument("path", type=Path, help="Path to .xlsx/.csv/.tsv")
    p.add_argument("--dry-run", action="store_true", help="Parse and upsert in-memory, then rollback.")
    p.add_argument("--truncate", action="store_true", help="Delete all existing FoodResource rows before import.")
    args = p.parse_args()

    summary = import_sheet(args.path, dry_run=args.dry_run, truncate=args.truncate)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
