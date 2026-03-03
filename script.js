document.addEventListener("DOMContentLoaded", function () {

    var form = document.getElementById("bmiForm");
    var unitToggle = document.getElementById("unitToggle");
    var metricInputs = document.getElementById("metricInputs");
    var imperialInputs = document.getElementById("imperialInputs");
    var resultSection = document.getElementById("resultSection");
    var resetBtn = document.getElementById("resetBtn");
    var clearHistoryBtn = document.getElementById("clearHistory");
    var historyContainer = document.getElementById("historyContainer");

    unitToggle.addEventListener("change", toggleUnits);
    form.addEventListener("submit", handleSubmit);
    resetBtn.addEventListener("click", resetForm);
    clearHistoryBtn.addEventListener("click", clearHistory);

    loadHistory();

    function toggleUnits() {
        if (unitToggle.checked) {
            metricInputs.classList.add("hidden");
            imperialInputs.classList.remove("hidden");
        } else {
            imperialInputs.classList.add("hidden");
            metricInputs.classList.remove("hidden");
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        clearErrors();

        var name = document.getElementById("name").value.trim();
        if (!name) {
            showError("nameError", "Name is required");
            return;
        }

        var weightKg = parseFloat(document.getElementById("weightKg").value);
        if (!validatePositive(weightKg, "weightKgError")) return;

        var heightMeters = 0;

        if (!unitToggle.checked) {
            var heightCm = parseFloat(document.getElementById("heightCm").value);
            if (!validatePositive(heightCm, "heightCmError")) return;
            heightMeters = heightCm / 100;
        } else {
            var ft = parseFloat(document.getElementById("heightFt").value);
            var inch = parseFloat(document.getElementById("heightIn").value);
            if (!validatePositive(ft, "heightFtError") ||
                !validatePositive(inch, "heightInError")) return;

            var totalInches = (ft * 12) + inch;
            heightMeters = totalInches * 0.0254;
        }

        var bmi = weightKg / (heightMeters * heightMeters);
        bmi = bmi.toFixed(2);

        var category = getCategory(bmi);
        displayResult(name, bmi, category);
        saveHistory(name, bmi, category);
        loadHistory();
    }

    function validatePositive(value, errorId) {
        if (!value || value <= 0) {
            showError(errorId, "Enter valid value");
            return false;
        }
        return true;
    }

    function showError(id, message) {
        document.getElementById(id).textContent = message;
    }

    function clearErrors() {
        var errors = document.querySelectorAll(".error");
        for (var i = 0; i < errors.length; i++) {
            errors[i].textContent = "";
        }
    }

    function getCategory(bmi) {
        bmi = parseFloat(bmi);
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal weight";
        if (bmi < 30) return "Overweight";
        return "Obese";
    }

    function displayResult(name, bmi, category) {
        resultSection.className = "result-card";
        resultSection.classList.remove("hidden");

        var colorClass = "";
        var interpretation = "";

        if (category === "Underweight") {
            colorClass = "blue";
            interpretation = "You are below the healthy range.";
        } else if (category === "Normal weight") {
            colorClass = "green";
            interpretation = "You are in a healthy range.";
        } else if (category === "Overweight") {
            colorClass = "orange";
            interpretation = "You are above the healthy range.";
        } else {
            colorClass = "red";
            interpretation = "Health risk is higher than normal.";
        }

        resultSection.classList.add(colorClass);
        document.getElementById("resultName").textContent = name;
        document.getElementById("bmiValue").textContent = bmi;
        document.getElementById("bmiCategory").textContent = category;
        document.getElementById("interpretation").textContent = interpretation;
    }

    function resetForm() {
        form.reset();
        resultSection.classList.add("hidden");
        clearErrors();
    }

    function saveHistory(name, bmi, category) {
        var history = JSON.parse(localStorage.getItem("bmiHistory")) || [];
        history.push({
            name: name,
            bmi: bmi,
            category: category,
            time: new Date().toLocaleString()
        });
        localStorage.setItem("bmiHistory", JSON.stringify(history));
    }

    function loadHistory() {
        historyContainer.innerHTML = "";
        var history = JSON.parse(localStorage.getItem("bmiHistory")) || [];

        for (var i = 0; i < history.length; i++) {
            createHistoryCard(history[i], i);
        }
    }

    function createHistoryCard(item, index) {
        var card = document.createElement("div");
        card.className = "history-card";

        var deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = "&times;";

        deleteBtn.addEventListener("click", function () {
            removeHistoryItem(index);
        });

        card.appendChild(deleteBtn);

        var content =
            "<h3>" + item.name + "</h3>" +
            "<p>BMI: " + item.bmi + "</p>" +
            "<p>" + item.category + "</p>" +
            "<small>" + item.time + "</small>";

        var wrapper = document.createElement("div");
        wrapper.innerHTML = content;
        card.appendChild(wrapper);

        historyContainer.appendChild(card);
    }

    function removeHistoryItem(index) {
        var history = JSON.parse(localStorage.getItem("bmiHistory")) || [];
        history.splice(index, 1);
        localStorage.setItem("bmiHistory", JSON.stringify(history));
        loadHistory();
    }

    function clearHistory() {
        localStorage.removeItem("bmiHistory");
        loadHistory();
    }
});