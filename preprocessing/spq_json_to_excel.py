import pandas as pd
import json
import glob
import os

# ── CONFIGURATION ──────────────────────────────────────────────────────────────
BASE_FOLDER = "."           # parent folder containing all jatos_results_* folders
OUTPUT_FILE = "preprocessing/spq_data.xlsx"
# ───────────────────────────────────────────────────────────────────────────────

# Matches: jatos_results_*/study_result_*/comp-result_*/data.txt
# Then picks only the 7th comp-result_* folder per study_result_*
txt_files = []
for study_path in glob.glob(os.path.join(BASE_FOLDER, "jatos_results_*", "study_result_*")):
    comp_folders = sorted(glob.glob(os.path.join(study_path, "comp-result_*")))
    if len(comp_folders) >= 7:
        data_file = os.path.join(comp_folders[6], "data.txt")  # 7th = index 6
        if os.path.exists(data_file):
            txt_files.append(data_file)
    else:
        print(f"Warning: fewer than 7 comp-result folders in {study_path} (found {len(comp_folders)})")

if not txt_files:
    print(f"No data.txt files found under '{BASE_FOLDER}/jatos_results_*/study_result_*/comp-result_[7]/'")
else:
    records = []
    for filepath in txt_files:
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                records.append(data)
            except json.JSONDecodeError as e:
                print(f"Skipping {filepath} — JSON error: {e}")

    df = pd.DataFrame(records)
    df.to_excel(OUTPUT_FILE, index=False)
    print(f"Done! {len(records)} file(s) written to '{OUTPUT_FILE}'")
