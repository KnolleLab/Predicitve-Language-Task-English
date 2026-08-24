# Predictive Language Task - English Version

## About

This project implements an **English-language version** of the [original German predictive language task](https://github.com/doorapr/IDP.git) investigating how semantic context influences the perception of degraded speech. The task is implemented in [jsPsych](https://www.jspsych.org/) for browser-based behavioral experiments and is packaged for JATOS via `jspsych-builder`. Data analysis and computational modelling are performed in [R](https://www.r-project.org). 

# Experiment setup and deployment
## Quick start (non-technical)

If you just want to run and deploy the experiment:

1. Install Node.js from [nodejs.org](https://nodejs.org/).
2. Open this project folder in a terminal.
3. Run `npm install` once.
4. Start one experiment locally with `npm start <experiment-file>` (examples below).
5. Build a JATOS package with `npm run jatos <experiment-file>`.
6. Import the created `.jzip` into JATOS.

## Which experiment file to use

Use the module entrypoint `src/experiment-en.ts` directly.

**Note:** `src/experiment.ts` is the shared base implementation and should not be used directly as a study module.

## Module behavior

The module files above enforce these settings in code:

| Module | Language | Prior question |
| --- | --- | --- |
| `experiment-en.ts` | `en` | `false` |
| `experiment-en-prior.ts` | `en` | `true` |

## JATOS setup

### Importing

1. Build a `.jzip` (see commands below) or download one from Releases.
2. In JATOS: **Studies** → **+** → **Import Study**.
3. Select the generated `.jzip`.

No mandatory JATOS `Study input` configuration is required for normal usage of the module entrypoints.

### Optional Study input keys

If provided, these optional flags are read by `experiment.ts`:

| Key | Values | Effect |
| --- | --- | --- |
| `consent` | `true` / `false` | Shows consent form when `true`. |
| `survey_questions` | `true` / `false` | Enables pre/post survey questions when `true`. |

Keys such as `lang_task`, `lang_task_training`, `question_prior`, `titration.*`, and `selected_language` are not needed for these modules.

## Prerequisites

- [Node.js](https://nodejs.org/) (includes npm)
- Python 3 

## Install

```sh
npm install
```

## Run locally

You can start a specific experiment directly:

```sh
npm start experiment-en
npm start experiment-en-prior
```

If you want the equivalent explicit `jspsych` call:

```sh
npm run jspsych -- run <experiment-file>
```

## Create `.jzip` for JATOS

Use:

```sh
npm run jatos <experiment-file>
```

Examples:

```sh
npm run jatos experiment-en
npm run jatos experiment-en-prior
```

`npm run jatos` (without an experiment file) builds the base `experiment` entrypoint.

## Additional HTML modules/assets

The experiment entrypoints include `html` in their `@assets` list. The `html/` directory contains the HTML components required by the **English-language version** of the experiment (i.e., clinical questionnaires and administrative components). `html/` must be present when building the `.jzip` file for JATOS. If `html/` does not exist, `jspsych` build/run commands for these module entrypoints fail. Additional HTML files can be added to this directory and then used as separate HTML components in JATOS.    
# Data Preprocessing 
## Participant CSV export

Use `export_participant_csv.py` to create one CSV per participant.

1. In JATOS, download results via **Export as Jatos Results Archive**.
2. Extract the archive to a folder containing `study_result_*` directories.
3. From repository root, install the required transcription dependencies:

```sh
pip install -r requirements-stt.txt
```

Then run the exporter with **transcription enabled**:

```sh
python preprocessing/export_participant_csv.py --results <extracted-results-folder> --transcribe both --stt-backend local-whisper --stt-model small --stt-device cpu
```

Transcription is required for preprocessing, as the subsequent preprocessing steps are performed on the transcribed responses. 

For full options and output details, see `EXPORT_PARTICIPANT_CSV.md`.
## SPQ data export
Run `spq_json_to_excel.py` to extract the Schizotypal Personality Questionnaire (SPQ) values from the JATOS results (per participant) and save them as `spq_data.xlsx` for later merging with the experiment data.
```sh
python preprocessing/spq_json_to_excel.py 
```
`spq_data.xlsx` will be saved in the `preprocessing/` folder.
## Preprocess exported data 
Use `preprocessing/01_preprocessing_PLang_EN.Rmd` to merge and clean participant-level experiment data.

**The script**:
- merges all participant CSV files into a single dataset;
- cleans and standardizes transcribed responses;
- calculates several **string distance measures**;
- classifies transcribed responses based on **Levenshtein** and **Jaro-Winkler** distance cutoffs;
- adds participant SPQ scores; and 
- saves the resulting preprocessed dataset as a dated CSV file.

### Input
The script expects:
- CSV files per participant in `demo_results/participant_exports/`;
- `spq_data.xlsx` in the `preprocessing/` folder.
### Run the preprocessing
Open `preprocessing/01_preprocessing_PLang_EN.Rmd` in [RStudio](https://rstudio-education.github.io/hopr/starting.html) and run the script.
The resulting dataset will be saved as `final_data_MMDDYY.csv` in your `preprocessing/` folder.

## Prepare data for modelling
Use `preprocessing/02_response_proportions_PLang_EN.Rmd` to prepare the preprocessed dataset for downstream analyses.

**The script**:
- calculates subject-level response proportions for Levenshtein and Jaro-Winkler classifications;
- calculates response proportions and mean clarity/ confidence ratings by experimental condition and trial block
- calculates cloze probabilities; and 
- saves the resulting dataset for subsequent modelling.

### Input
The script expects:
- the preprocessed `final_data_MMDDYY.csv` dataset generated by `01_preprocessing_PLang_EN.Rmd`
### Run the script
Open `preprocessing/02_response_proportions_PLang_EN.Rmd` in [RStudio](https://rstudio-education.github.io/hopr/starting.html) and run the script.
The resulting dataset will be saved as `PlangEnglish_data.csv` in your `preprocessing/` folder.
# Modelling
Run the following scripts in order:
1. `03_modelling_experiment_and_data.Rmd`: Creates the 'mini' (60 trials), 'midi' (120 trials), and 'maxi' (200 trials) datasets from the preprocessed data. 
2. `04_modelling_preprocessing.Rmd`: Further prepares the data for modelling by excluding invalid trials, creating the response accuracy variable, and standardizing model predictors.
3. `05_model_3dir.Rmd`: Runs the Bayesian direct-effects model in Stan separately for 'mini', 'midi', and 'maxi' and saves the fitted models.
### Input
The script expects:
- the `PlangEnglish_data.csv` dataset generated by `02_response_proportions_PLang_EN.Rmd`
- the `modelling/` folder (which contains the 3 modelling scripts and `/src` folder)
- an empty `data/` folder at the repository root (where the outputs are saved)
### Run the modelling
Open the 3 modelling scripts and run them in order in [RStudio](https://rstudio-education.github.io/hopr/starting.html). Each script uses the output of the previous script. The fitted models will be saved separately for 'mini' `stanfit_model_3dir_mini.rds`, midi `stanfit_model_3dir_midi.rds`, and 'maxi' `stanfit_model_3dir_maxi.rds` in your `data/` folder.











