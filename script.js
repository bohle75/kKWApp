let chart;

document.getElementById("calculateButton").addEventListener("click", calculate);

async function calculate() {
    let power = Number(document.getElementById("power").value);
    let efficiency = Number(document.getElementById("eff").value);
    let lat = Number(document.getElementById("lat").value);
    let lon = Number(document.getElementById("lon").value);
    let result = document.getElementById("result");
    let button = document.getElementById("calculateButton");

    if (!power || !efficiency || !lat || !lon) {
        result.innerText = "Bitte alle Felder ausfüllen!";
        return;
    }

    result.innerText = "Sonnendaten werden geladen ...";
    button.disabled = true;

    try {
        let url =
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunshine_duration&timezone=auto`;

        let response = await fetch(url);

        if (!response.ok) {
            throw new Error("API nicht erreichbar");
        }

        let data = await response.json();
        let sunshine = data.daily.sunshine_duration;

        if (!sunshine || sunshine.length === 0) {
            throw new Error("Keine Sonnendaten gefunden");
        }

        let avgSun =
            sunshine.reduce((a, b) => a + b, 0) / sunshine.length / 3600;

        let daily = (power * avgSun * (efficiency / 100)) / 1000;
        let yearly = daily * 365;

        result.innerText =
            "Ø Sonnenstunden: " + avgSun.toFixed(2) + " h | Tagesertrag: " +
            daily.toFixed(2) + " kWh | Jahresertrag: " + yearly.toFixed(0) + " kWh";

        let factors = [0.02, 0.04, 0.09, 0.14, 0.18, 0.20, 0.21, 0.18, 0.12, 0.07, 0.03, 0.02];

        // Summe der Faktoren berechnen
        let sum = factors.reduce((a, b) => a + b, 0);

        // Monatswerte berechnen
        let monthly = factors.map(f => (yearly * f) / sum);

        let ctx = document.getElementById("chart").getContext("2d");

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
                datasets: [{
                    label: "Monatsertrag (kWh)",
                    data: monthly.map(v => v.toFixed(1))
                }]
            }
        });
    } catch (error) {
        result.innerText =
            "Die Sonnendaten konnten nicht geladen werden. Bitte Standort prüfen und später erneut versuchen.";
    } finally {
        button.disabled = false;
    }
}
