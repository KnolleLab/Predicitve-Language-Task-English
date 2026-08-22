<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Demographic Survey</title>
    <style>
        body {
            font-family: "OpenDyslexic", Arial, sans-serif;
            font-size: 18px;
            line-height: 1.8;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f0f8ff;
        }
        h1 { text-align: center; color: #2c3e50; font-size: 28px; }
        label { display: block; margin-top: 15px; font-weight: bold; }
        input, select, textarea { margin-top: 5px; padding: 10px; font-size: 16px; width: 100%; max-width: 400px; }
        .radio-group { margin-top: 10px; display: flex; flex-direction: column; }
        .radio-option { display: flex; align-items: center; margin-bottom: 10px; }
        .radio-option label { margin: 0; font-weight: normal; }
        input[type="radio"] { margin-right: 10px; width: 20px; height: 20px; }
        .hidden { display: none; }
        .divider { margin: 20px 0; border-bottom: 2px solid #ccc; }
        .btn { padding: 15px 40px; border: none; border-radius: 5px; cursor: pointer; font-size: 22px; background-color: #34495e; color: white; margin-top: 20px; }
        .btn:disabled { background-color: grey; cursor: not-allowed; color: #ccc; }
        #abortButton { position: fixed; top: 10px; right: 10px; z-index: 1000; padding: 10px 15px; background-color: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <!-- JATOS abort button -->
    <button id="abortButton" onclick="if(confirm('Are you sure you want to abort?')){jatos.abortStudy();}">Abort Study</button>
    
    <h1>Demographic Survey</h1>
    
    <form id="surveyForm">
        <!-- Gender -->
        <label for="gender">Gender</label>
        <select id="gender" name="gender" required>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="diverse">Non-binary/Prefer not to say</option>
        </select>

        <!-- Vision -->
        <label for="vision">Do you wear glasses, contacts, or have a visual disability?</label>
        <select id="vision" name="vision" required>
            <option value="">Select an option</option>
            <option value="glasses">Glasses</option>
            <option value="contacts">Contacts</option>
            <option value="no-restriction">No significant visual impairment</option>
        </select>
        
        <label>Are you colorblind?</label>
        <div class="radio-group">
            <div class="radio-option">
                <input type="radio" id="colorblindYes" name="colorblindness" value="yes" onclick="toggleColorblindType(true)" required>
                <label for="colorblindYes">Yes</label>
            </div>
            <div class="radio-option">
                <input type="radio" id="colorblindNo" name="colorblindness" value="no" onclick="toggleColorblindType(false)">
                <label for="colorblindNo">No</label>
            </div>
        </div>

        <div id="colorblindTypeField" class="hidden">
            <label for="colorblindType">What kind of colorblindness affects you?</label>
            <select id="colorblindType" name="colorblindType">
                <option value="">Select an option</option>
                <option value="protanopia">Protanopia</option>
                <option value="deuteranopia">Deuteranopia</option>
                <option value="tritanopia">Tritanopia</option>
                <option value="unknown">I don't know</option>
            </select>
        </div>

        <div class="divider"></div>

        <!-- Language -->
        <label for="firstLanguage">First language</label>
        <select id="firstLanguage" name="firstLanguage" onchange="toggleOtherLanguageInput(this)" required>
            <option value="">Select language</option>
            <option value="english">English</option>
            <option value="german">German</option>
            <option value="french">French</option>
            <option value="spanish">Spanish</option>
            <option value="other">Other</option>
        </select>
        <div id="otherLanguageField" class="hidden">
            <label for="otherLanguage">Please specify your first language</label>
            <input type="text" id="otherLanguage" name="otherLanguage">
        </div>

        <!-- Submit Button -->
        <div>
            <button id="submitButton" type="button" class="btn" disabled onclick="submitSurvey()">Submit</button>        
        </div>
    </form>

    <!-- Required JATOS script -->
    <script src="jatos.js"></script>

    <script>
        // --- 1. SURVEY & VALIDATION LOGIC ---
        let startTime = performance.now();

        function toggleColorblindType(show) {
            const field = document.getElementById('colorblindTypeField');
            field.classList.toggle('hidden', !show);
            const select = document.getElementById('colorblindType');
            select.required = show; // Make required only if visible
        }

        function toggleOtherLanguageInput(select) {
            const field = document.getElementById('otherLanguageField');
            const input = document.getElementById('otherLanguage');
            if (select.value === 'other') {
                field.classList.remove('hidden');
                input.required = true;
            } else {
                field.classList.add('hidden');
                input.required = false;
            }
        }

        // Monitors form and enables Submit button when all required fields are filled
        function validateForm() {
            const form = document.getElementById('surveyForm');
            const submitButton = document.getElementById('submitButton');
            submitButton.disabled = !form.checkValidity();
        }

        document.getElementById('surveyForm').addEventListener('input', validateForm);

        function submitSurvey() {
            const form = document.getElementById('surveyForm');
            const formData = new FormData(form);
            const surveyData = Object.fromEntries(formData.entries());
            surveyData["demo_time"] = (performance.now() - startTime) / 1000;

            if (typeof jatos !== 'undefined' && jatos.submitResultData) {
                jatos.submitResultData(JSON.stringify(surveyData))
                    .then(() => jatos.startNextComponent())
                    .catch(() => alert("Error submitting data to JATOS."));
            } else {
                console.log("Local Test (Not JATOS):", surveyData);
                alert("Survey Submitted successfully!");
            }
        }

        // --- 2. INACTIVITY TIMER (30 SECONDS) ---
        (function() {
            // SETTINGS
            const PROLIFIC_URL = 'https://app.prolific.com/submissions/complete?cc=COMRDA0D';
            const IDLE_TIME_LIMIT = 30;   // Seconds of no movement before warning
            const COUNTDOWN_TIME = 30;    // Seconds to wait while box is visible

            let idleSeconds = 0;
            let countdownRemaining = COUNTDOWN_TIME;
            let isWarningActive = false;
            let countdownInterval;

            // Create the Warning Box Dynamically
            const warningBox = document.createElement("div");
            warningBox.id = "inactivityPopup";
            warningBox.style = `
                display: none; 
                position: fixed; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%); 
                background: #f8d7da; 
                color: #721c24;
                padding: 30px; 
                border: 3px solid #f5c2c7; 
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                z-index: 10000; 
                text-align: center;
                font-family: sans-serif;
            `;
            warningBox.innerHTML = `
                <h2 style="margin-top:0;">Are you still there?</h2>
                <p>You have been inactive for 30 seconds.</p>
                <p>You will be redirected back to Prolific in: <br>
                   <strong style="font-size: 30px;" id="timerDisplay">30</strong> seconds</p>
                <button onclick="window.dispatchEvent(new Event('click'))" style="padding:10px 20px; cursor:pointer;">I'm back!</button>
            `;
            document.body.appendChild(warningBox);

            function resetIdleTimer() {
                idleSeconds = 0;
                if (isWarningActive) {
                    isWarningActive = false;
                    warningBox.style.display = "none";
                    clearInterval(countdownInterval);
                    console.log("Activity detected. Timer reset.");
                }
            }

            // Check idleness every second
            setInterval(function() {
                if (!isWarningActive) {
                    idleSeconds++;
                    if (idleSeconds >= IDLE_TIME_LIMIT) {
                        showWarning();
                    }
                }
            }, 1000);

            function showWarning() {
                isWarningActive = true;
                warningBox.style.display = "block";
                countdownRemaining = COUNTDOWN_TIME;
                document.getElementById("timerDisplay").textContent = countdownRemaining;

                countdownInterval = setInterval(function() {
                    countdownRemaining--;
                    document.getElementById("timerDisplay").textContent = countdownRemaining;

                    if (countdownRemaining <= 0) {
                        window.location.href = PROLIFIC_URL;
                    }
                }, 1000);
            }

            // Listen for any activity to reset the timer
            window.addEventListener("mousemove", resetIdleTimer);
            window.addEventListener("keydown", resetIdleTimer);
            window.addEventListener("click", resetIdleTimer);
            window.addEventListener("scroll", resetIdleTimer);
        })();
    </script>
</body>
</html>