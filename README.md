# Predictive Language Task - English Version

## About

This project implements an English-language version of the [original German predictive language task](https://github.com/doorapr/IDP.git) investigating how semantic context influences the perception of degraded speech. The task is implemented in [jsPsych](https://www.jspsych.org/) for browser-based behavioral experiments and is packaged for JATOS via `jspsych-builder`. Data analysis and computational modelling are performed in [R](https://www.r-project.org). 

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

**Note:**`src/experiment.ts` is the shared base implementation and should not be used directly as a study module.

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
- Python 3 (only needed for `export_participant_csv.py`)

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

The experiment entrypoints include `html` in their `@assets` list. The `html/` directory contains the HTML components required by the English version of the experiment (i.e., clinical questionnaires and administrative components). `html/` must be present when building the `.jzip` file for JATOS. If `html/` does not exist, `jspsych` build/run commands for these module entrypoints fail. Additional HTML files can be added to this directory and then used as separate HTML components in JATOS.    
# Data Preprocessing and Analysis
## Participant CSV export

Use `export_participant_csv.py` to create one CSV per participant.

1. In JATOS, download results via **Export as Jatos Results Archive**.
2. Extract the archive to a folder containing `study_result_*` directories.
3. From repository root, install the required transcription dependencies:

```sh
pip install -r requirements-stt.txt
```

Then run the exporter with transcription enabled:

```sh
python preprocessing/export_participant_csv.py --results <extracted-results-folder> --transcribe both --stt-backend local-whisper --stt-model small --stt-device cpu
```

Transcription is required for preprocessing, as the subsequent preprocessing steps are performed on the transcribed responses. 

For full options and output details, see `EXPORT_PARTICIPANT_CSV.md`.
## SPQ data export
Run `spq_json_to_excel.py` to extract the Schizotypal Personality Questionnaire (SPQ) values from the JATOS results and save them as an Excel file for later merging with the participant data.
```sh
python preprocessing/spq_json_to_excel.py 
```







