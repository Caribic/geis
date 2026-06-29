// Globální stav aplikace
let dataSvozu = {
    zbyvaFP: 30,
    zbyvaKH: 0
};

// Výchozí pole historie nakládek
let historieNakladek = [
    { ridic: "KINDA", fp: 15, kh: 0 }
];

// 1. VYKRESLENÍ AKTIVNÍCH DAT DO STRÁNKY
function aktualizovatUI() {
    const fpElem = document.getElementById('zbyva-fp');
    const khElem = document.getElementById('zbyva-kh');
    if (fpElem) fpElem.innerText = dataSvozu.zbyvaFP;
    if (khElem) khElem.innerText = dataSvozu.zbyvaKH;

    const container = document.getElementById('historie-list');
    if (!container) return;
    container.innerHTML = '';

    // Generování řádků historie včetně indexovaného storno tlačítka
    historieNakladek.forEach((polozka, index) => {
        const row = document.createElement('div');
        row.className = 'historie-row';
        row.innerHTML = `
            <div class="historie-info">
                <span class="driver-name">${polozka.ridic}</span>
                <span class="load-info">Odvezeno: ${polozka.fp} FP | ${polozka.kh} KH</span>
            </div>
            <button class="btn-storno" onclick="stornoNakladky(${index})" aria-label="Stornovat nakládku">
                ×
            </button>
        `;
        container.appendChild(row);
    });
}

// 2. POTVRZENÍ NAKLÁDKY A ODEČTENÍ Z PLÁNU
function potvrditNakladku() {
    const ridic = document.getElementById('select-ridic').value;
    const fp = parseInt(document.getElementById('input-fp').value) || 0;
    const kh = parseInt(document.getElementById('input-kh').value) || 0;

    if (fp === 0 && kh === 0) {
        alert('Zadejte prosím množství palet k odečtení.');
        return;
    }

    // Odečtení z celkového zbývajícího plánu svozu
    dataSvozu.zbyvaFP -= fp;
    dataSvozu.zbyvaKH -= kh;

    // Vložení na začátek pole historie (nejnovější záznamy nahoře)
    historieNakladek.unshift({ ridic, fp, kh });

    // Vyčištění políček formuláře pro další zápis
    document.getElementById('input-fp').value = '';
    document.getElementById('input-kh').value = '';

    aktualizovatUI();
    ulozitDoLocalStorage();
}

// 3. FUNKCE STORNA (Smazání záznamu a navrácení hodnot zpět)
function stornoNakladky(index) {
    if (index < 0 || index >= historieNakladek.length) return;

    // Načtení dat mazané položky
    const stornovanaPolozka = historieNakladek[index];

    // MATEMATICKÝ ZPĚTNÝ CHOD: Přičtení hodnot zpět do zbývajících palet
    dataSvozu.zbyvaFP += stornovanaPolozka.fp;
    dataSvozu.zbyvaKH += stornovanaPolozka.kh;

    // Vymazání záznamu z pole historie
    historieNakladek.splice(index, 1);

    // Obnova zobrazení a uložení stavu
    aktualizovatUI();
    ulozitDoLocalStorage();
}

// 4. PERSISTENCE DAT (LocalStorage pro spolehlivý PWA běh)
function ulozitDoLocalStorage() {
    localStorage.setItem('geis_zbyvaFP', dataSvozu.zbyvaFP);
    localStorage.setItem('geis_zbyvaKH', dataSvozu.zbyvaKH);
    localStorage.setItem('geis_historie', JSON.stringify(historieNakladek));
}

// Bezpečné načtení dat při kompletním dokončení struktury DOMu
window.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('geis_zbyvaFP')) {
        dataSvozu.zbyvaFP = parseInt(localStorage.getItem('geis_zbyvaFP'));
        dataSvozu.zbyvaKH = parseInt(localStorage.getItem('geis_zbyvaKH'));
        historieNakladek = JSON.parse(localStorage.getItem('geis_historie')) || [];
    }
    aktualizovatUI();
});

// REGISTRACE SERVICE WORKERU (Pro správné cachování a offline režim PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker úspěšně registrován.', reg))
            .catch(err => console.log('Registrace Service Workera selhala.', err));
    });
}
