#!/usr/bin/env python3
"""
Excel Workbook Analysis Script
Analyzes the Optical_Normalized_Catalog_FULL_v2.xlsx workbook structure
"""

import pandas as pd
import sys
from pathlib import Path
import json

def analyze_workbook(file_path):
    """Analyze the Excel workbook and return detailed structure information."""
    
    print("🔍 Analyzing Excel Workbook Structure")
    print("=" * 50)
    
    try:
        # Load the workbook
        workbook = pd.ExcelFile(file_path)
        print(f"📁 File: {file_path}")
        print(f"📊 Total Sheets: {len(workbook.sheet_names)}")
        print()
        
        analysis = {
            "file_info": {
                "path": str(file_path),
                "total_sheets": len(workbook.sheet_names),
                "sheet_names": workbook.sheet_names
            },
            "sheets": {}
        }
        
        # Analyze each sheet
        for sheet_name in workbook.sheet_names:
            print(f"📋 Analyzing Sheet: '{sheet_name}'")
            print("-" * 30)
            
            try:
                # Read the sheet
                df = pd.read_excel(workbook, sheet_name=sheet_name)
                
                # Basic info
                sheet_info = {
                    "name": sheet_name,
                    "rows": len(df),
                    "columns": len(df.columns),
                    "column_names": list(df.columns),
                    "data_types": {},
                    "sample_data": {},
                    "null_counts": {},
                    "unique_counts": {}
                }
                
                print(f"   Rows: {len(df)}")
                print(f"   Columns: {len(df.columns)}")
                print(f"   Column Names: {list(df.columns)}")
                
                # Analyze each column
                for col in df.columns:
                    # Data type
                    sheet_info["data_types"][col] = str(df[col].dtype)
                    
                    # Null counts
                    null_count = df[col].isnull().sum()
                    sheet_info["null_counts"][col] = int(null_count)
                    
                    # Unique value counts
                    unique_count = df[col].nunique()
                    sheet_info["unique_counts"][col] = int(unique_count)
                    
                    # Sample data (first 3 non-null values)
                    sample_values = df[col].dropna().head(3).tolist()
                    sheet_info["sample_data"][col] = sample_values
                
                # Display column details
                print("   Column Details:")
                for col in df.columns:
                    dtype = sheet_info["data_types"][col]
                    nulls = sheet_info["null_counts"][col]
                    unique = sheet_info["unique_counts"][col]
                    samples = sheet_info["sample_data"][col]
                    print(f"     {col}: {dtype} | {unique} unique | {nulls} nulls | samples: {samples}")
                
                analysis["sheets"][sheet_name] = sheet_info
                print()
                
            except Exception as e:
                print(f"   ❌ Error reading sheet '{sheet_name}': {e}")
                analysis["sheets"][sheet_name] = {"error": str(e)}
                print()
        
        return analysis
        
    except Exception as e:
        print(f"❌ Error loading workbook: {e}")
        return None

def save_analysis(analysis, output_file):
    """Save the analysis to a JSON file."""
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
        print(f"✅ Analysis saved to: {output_file}")
    except Exception as e:
        print(f"❌ Error saving analysis: {e}")

def main():
    """Main analysis function."""
    
    # File paths
    excel_file = Path("data/Optical_Normalized_Catalog_FULL_v2.xlsx")
    output_file = Path("data/workbook_analysis.json")
    
    # Check if Excel file exists
    if not excel_file.exists():
        print(f"❌ Excel file not found: {excel_file}")
        sys.exit(1)
    
    # Analyze the workbook
    analysis = analyze_workbook(excel_file)
    
    if analysis:
        # Save analysis
        save_analysis(analysis, output_file)
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 ANALYSIS SUMMARY")
        print("=" * 50)
        print(f"Total Sheets: {analysis['file_info']['total_sheets']}")
        
        total_rows = 0
        total_columns = 0
        
        for sheet_name, sheet_info in analysis["sheets"].items():
            if "error" not in sheet_info:
                rows = sheet_info["rows"]
                cols = sheet_info["columns"]
                total_rows += rows
                total_columns += cols
                print(f"  {sheet_name}: {rows} rows, {cols} columns")
        
        print(f"\nTotal Data Rows: {total_rows}")
        print(f"Average Columns per Sheet: {total_columns / len(analysis['sheets']):.1f}")
        
        # Expected tabs check
        expected_tabs = [
            "README", "Materials", "Treatments", "Designs", 
            "AddPowerRules", "Availability", "Tints", 
            "InstructionCodes", "TintCompatibility", "Frames"
        ]
        
        print(f"\n📋 TAB VALIDATION")
        print("-" * 20)
        
        found_tabs = set(analysis['file_info']['sheet_names'])
        expected_tabs_set = set(expected_tabs)
        
        missing_tabs = expected_tabs_set - found_tabs
        extra_tabs = found_tabs - expected_tabs_set
        
        if missing_tabs:
            print(f"❌ Missing Expected Tabs: {list(missing_tabs)}")
        else:
            print("✅ All expected tabs found")
            
        if extra_tabs:
            print(f"ℹ️  Additional Tabs: {list(extra_tabs)}")
        
        print(f"\n✅ Analysis complete! Results saved to {output_file}")
        
    else:
        print("❌ Analysis failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
