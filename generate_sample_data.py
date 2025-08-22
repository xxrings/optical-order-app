#!/usr/bin/env python3
"""
Sample Data Generator
Creates sample catalog.json for development and testing
"""

import json
from datetime import datetime
from pathlib import Path

def generate_sample_catalog():
    """Generate a sample catalog with representative data"""
    
    catalog = {
        "metadata": {
            "version": "2.0-sample",
            "lastUpdated": datetime.now().isoformat(),
            "sourceFile": "Sample_Data_Generated",
            "validationStatus": "valid",
            "buildId": f"sample-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "tabCount": 10,
            "totalRecords": 50  # Smaller dataset for development
        },
        "materials": generate_sample_materials(),
        "treatments": generate_sample_treatments(),
        "designs": generate_sample_designs(),
        "frames": generate_sample_frames(),
        "addPowerRules": generate_sample_add_power_rules(),
        "availability": generate_sample_availability(),
        "tints": generate_sample_tints(),
        "instructionCodes": generate_sample_instruction_codes(),
        "tintCompatibility": generate_sample_tint_compatibility(),
        "indexes": {}  # Will be populated by build process
    }
    
    # Update total records count
    catalog["metadata"]["totalRecords"] = sum(
        len(catalog[key]) for key in catalog if key != "metadata" and key != "indexes"
    )
    
    return catalog

def generate_sample_materials():
    """Generate sample materials data"""
    return [
        {
            "id": "CR39",
            "displayName": "CR-39",
            "refractiveIndex": 1.5,
            "available": True,
            "rimlessAllowed": True,
            "notes": "Standard plastic lens material",
            "labOutput": "CR39 CLEAR"
        },
        {
            "id": "TRIVEX",
            "displayName": "Trivex",
            "refractiveIndex": 1.53,
            "available": True,
            "rimlessAllowed": True,
            "notes": "Impact-resistant material",
            "labOutput": "TRIVEX CLEAR"
        },
        {
            "id": "HI160",
            "displayName": "High Index 1.60",
            "refractiveIndex": 1.6,
            "available": True,
            "rimlessAllowed": True,
            "notes": "Thinner lens option",
            "labOutput": "1.60 CLEAR"
        }
    ]

def generate_sample_treatments():
    """Generate sample treatments data"""
    return [
        {
            "id": "CLEAR",
            "type": "Clear",
            "colorsAllowed": None,
            "rimlessAllowed": True,
            "notes": "No treatment applied",
            "labOutput": "CLEAR"
        },
        {
            "id": "TRANS",
            "type": "Transition",
            "colorsAllowed": "GRAY;BROWN (varies by design/material)",
            "rimlessAllowed": True,
            "notes": "Photochromic lenses",
            "labOutput": "TRANSITION"
        },
        {
            "id": "POLAR",
            "type": "Polarized",
            "colorsAllowed": "GRAY 3;BROWN 3;G-15 3 (varies)",
            "rimlessAllowed": False,
            "notes": "No rimless frames with polarized",
            "labOutput": "POLARIZED"
        }
    ]

def generate_sample_designs():
    """Generate sample designs data"""
    return [
        {
            "id": "SV",
            "category": "Single Vision",
            "segmentType": None,
            "segmentSize": None,
            "minSegmentHeight": 0,
            "discontinued": False,
            "notes": None,
            "labOutput": "SV",
            "segmentOutput": None
        },
        {
            "id": "FT28",
            "category": "Bifocal",
            "segmentType": "FT",
            "segmentSize": 28.0,
            "minSegmentHeight": 0,
            "discontinued": False,
            "notes": "Availability varies by material",
            "labOutput": "FT-28",
            "segmentOutput": 28.0
        },
        {
            "id": "PAL",
            "category": "Progressive",
            "segmentType": None,
            "segmentSize": None,
            "minSegmentHeight": 18,
            "discontinued": False,
            "notes": "Minimum segment height 18mm",
            "labOutput": "PROGRESSIVE",
            "segmentOutput": None
        }
    ]

def generate_sample_frames():
    """Generate sample frames data"""
    return [
        {
            "id": 882020000976,
            "brandModel": "7012 R",
            "sku": 882020000976,
            "color": "GREY",
            "material": "Safety",
            "dimensions": {
                "a": 55,
                "b": 34,
                "dbl": 17,
                "ed": None,
                "temple": 140,
                "framePd": 72
            },
            "collection": "Aeropostale",
            "flags": {
                "safety": True,
                "sport": False
            },
            "sideShieldSku": 882020001614,
            "heroImage": "7012_R_55_GREY_Hero.jpg",
            "discontinued": False,
            "backordered": False,
            "notes": None
        },
        {
            "id": 9398995400,
            "brandModel": "7730",
            "sku": 9398995400,
            "color": "GUNMETAL",
            "material": "Metal",
            "dimensions": {
                "a": 53,
                "b": 37,
                "dbl": 19,
                "ed": None,
                "temple": 145,
                "framePd": 72
            },
            "collection": None,
            "flags": {
                "safety": False,
                "sport": False
            },
            "sideShieldSku": None,
            "heroImage": "7730_53_GUNMETAL_Hero.jpg",
            "discontinued": False,
            "backordered": False,
            "notes": None
        }
    ]

def generate_sample_add_power_rules():
    """Generate sample ADD power rules"""
    return [
        {
            "id": "CR39_FT28_CLEAR",
            "designId": "FT28",
            "materialId": "CR39",
            "treatmentId": "CLEAR",
            "addMin": 0.75,
            "addMax": 6.0,
            "incrementRule": None,
            "notes": None
        },
        {
            "id": "CR39_PAL_CLEAR",
            "designId": "PAL",
            "materialId": "CR39",
            "treatmentId": "CLEAR",
            "addMin": 0.75,
            "addMax": 4.0,
            "incrementRule": ">+4.00 in 0.50 steps",
            "notes": "Min seg 18; else FREEFORM"
        }
    ]

def generate_sample_availability():
    """Generate sample availability rules"""
    return [
        {
            "id": "CR39_SV_CLEAR",
            "designId": "SV",
            "materialId": "CR39",
            "treatmentId": "CLEAR",
            "available": True,
            "rimlessAllowed": True,
            "colorLimits": None,
            "minSegmentHeight": 0,
            "substitution": None,
            "leadTimeWeeks": None,
            "notes": None
        },
        {
            "id": "CR39_PAL_CLEAR",
            "designId": "PAL",
            "materialId": "CR39",
            "treatmentId": "CLEAR",
            "available": True,
            "rimlessAllowed": True,
            "colorLimits": None,
            "minSegmentHeight": 18,
            "substitution": "If <18, use FREEFORM",
            "leadTimeWeeks": 4.0,
            "notes": "Add depends on total Rx"
        },
        {
            "id": "TRIVEX_SV_POLAR",
            "designId": "SV",
            "materialId": "TRIVEX",
            "treatmentId": "POLAR",
            "available": True,
            "rimlessAllowed": False,
            "colorLimits": "BROWN may vary",
            "minSegmentHeight": 0,
            "substitution": None,
            "leadTimeWeeks": None,
            "notes": None
        }
    ]

def generate_sample_tints():
    """Generate sample tints"""
    return [
        {
            "id": "BASE_GREY_SOLID",
            "category": "Base",
            "colorName": "GREY",
            "style": "SOLID",
            "percentageMin": 10.0,
            "percentageMax": 75.0,
            "fixedPercentage": None,
            "availableIn": ["Plastic", "Trivex", "Poly", "1.60", "1.67"],
            "notes": "Solid only",
            "labOutput": "GREY SOLID {PCT}%"
        },
        {
            "id": "BASE_BROWN_SOLID",
            "category": "Base",
            "colorName": "BROWN",
            "style": "SOLID",
            "percentageMin": 10.0,
            "percentageMax": 75.0,
            "fixedPercentage": None,
            "availableIn": ["Plastic", "Trivex", "Poly", "1.60", "1.67"],
            "notes": "Solid only",
            "labOutput": "BROWN SOLID {PCT}%"
        },
        {
            "id": "MIRROR_G15_FIXED",
            "category": "Mirror",
            "colorName": "G-15",
            "style": None,
            "percentageMin": None,
            "percentageMax": None,
            "fixedPercentage": 75.0,
            "availableIn": ["Glass"],
            "notes": "Glass only; fixed 75%",
            "labOutput": "G-15 MIRROR 75%"
        }
    ]

def generate_sample_instruction_codes():
    """Generate sample instruction codes"""
    return [
        {
            "code": "\\SI:ARC",
            "label": "Anti-Reflective Coating",
            "valueType": "ENUM",
            "allowedValues": "ARC",
            "outputTemplate": "\\SI:ARC"
        },
        {
            "code": "\\TI11",
            "label": "SOLID TINT",
            "valueType": "NUMBER_PCT",
            "allowedValues": "10-75",
            "outputTemplate": "\\TI11:SOLID TINT"
        },
        {
            "code": "\\SI1",
            "label": "Tint Percent (x10)",
            "valueType": "NUMBER_RAW",
            "allowedValues": "100-750",
            "outputTemplate": "\\SI1:{PCT}0"
        }
    ]

def generate_sample_tint_compatibility():
    """Generate sample tint compatibility matrix"""
    compatibility = []
    
    # Generate combinations for each design/material/treatment/tint
    designs = ["SV", "FT28", "PAL"]
    materials = ["CR39", "TRIVEX", "HI160"]
    treatments = ["TINT"]  # Only tint treatment allows tints
    tints = ["BASE_GREY_SOLID", "BASE_BROWN_SOLID", "MIRROR_G15_FIXED"]
    
    for design in designs:
        for material in materials:
            for treatment in treatments:
                for tint in tints:
                    # G-15 mirror only available in glass (not in our sample materials)
                    if tint == "MIRROR_G15_FIXED" and material != "GLASS":
                        allowed = False
                    else:
                        allowed = True
                    
                    compat = {
                        "designId": design,
                        "materialId": material,
                        "treatmentId": treatment,
                        "tintId": tint,
                        "allowed": allowed,
                        "styleRequired": "match" if allowed else None,
                        "percentageMin": 10.0 if allowed and tint != "MIRROR_G15_FIXED" else None,
                        "percentageMax": 75.0 if allowed and tint != "MIRROR_G15_FIXED" else None,
                        "notes": "Base tint 10–75% (G-15 fixed 75%)"
                    }
                    compatibility.append(compat)
    
    return compatibility

def main():
    """Generate sample catalog and save to file"""
    
    print("🔄 Generating sample catalog data...")
    
    # Generate sample catalog
    catalog = generate_sample_catalog()
    
    # Create output directory if it doesn't exist
    output_dir = Path("data")
    output_dir.mkdir(exist_ok=True)
    
    # Save to file
    output_path = output_dir / "sample_catalog.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    
    # Generate summary
    print(f"✅ Sample catalog generated: {output_path}")
    print(f"📊 Data Summary:")
    print(f"   Materials: {len(catalog['materials'])}")
    print(f"   Treatments: {len(catalog['treatments'])}")
    print(f"   Designs: {len(catalog['designs'])}")
    print(f"   Frames: {len(catalog['frames'])}")
    print(f"   ADD Power Rules: {len(catalog['addPowerRules'])}")
    print(f"   Availability Rules: {len(catalog['availability'])}")
    print(f"   Tints: {len(catalog['tints'])}")
    print(f"   Instruction Codes: {len(catalog['instructionCodes'])}")
    print(f"   Tint Compatibility: {len(catalog['tintCompatibility'])}")
    print(f"   Total Records: {catalog['metadata']['totalRecords']}")
    
    # Also create a minimal version for quick testing
    minimal_catalog = {
        "metadata": catalog["metadata"],
        "materials": catalog["materials"][:2],
        "treatments": catalog["treatments"][:2],
        "designs": catalog["designs"][:2],
        "frames": catalog["frames"][:1],
        "addPowerRules": catalog["addPowerRules"][:1],
        "availability": catalog["availability"][:2],
        "tints": catalog["tints"][:2],
        "instructionCodes": catalog["instructionCodes"][:2],
        "tintCompatibility": catalog["tintCompatibility"][:4],
        "indexes": {}
    }
    
    minimal_catalog["metadata"]["totalRecords"] = sum(
        len(minimal_catalog[key]) for key in minimal_catalog if key != "metadata" and key != "indexes"
    )
    minimal_catalog["metadata"]["version"] = "2.0-minimal"
    
    minimal_path = output_dir / "minimal_catalog.json"
    with open(minimal_path, 'w', encoding='utf-8') as f:
        json.dump(minimal_catalog, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Minimal catalog generated: {minimal_path}")
    print(f"   Total Records: {minimal_catalog['metadata']['totalRecords']}")

if __name__ == "__main__":
    main()
