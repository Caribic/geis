// globální stav dat (v produkci pravděpodobně načítáte z LocalStorage)
let dataSvozu = {
    zbyvaFP: 30,
    zbyvaKH: 0
};

// Pole pro ukládání historie nakládek
let historieNakladek = [
    { ridic: "KINDA", fp: 15, kh: 0 }
];

// 1. FUNKCE PRO VYKRESLENÍ DAT NA OBRAZOVKU
function aktualizovatUI() {
    // Aktualizace horních počítadel
    document.getElementById('zbyva-fp').innerText = dataSvozu.zbyvaFP;
    document.getElementById('zbyva-kh').innerText = dataSvozu.zbyvaKH;

    // Vyčištění a opětovné vykreslení seznamu historie
    const container = document.getElementById('historie-list');
    container.innerHTML = '';

    historieNakladek.forEach((polozka, index) => {
        const row = document.createElement('div');
        row.className = 'historie-row';
        row.innerHTML = `
            <div class="historie-info">
                <span class="driver-name">${polozka.ridic}</span>
                <span class="load-info">Odvezeno: ${polozka.fp} FP | ${polozka.kh} KH</span>
            </div>
            <button class="btn-storno" onclick="stornoNakladky(${index})" aria-label="Stornovat">
                ×
            </button>
        `;
        container.appendChild(row);
    });
}

// 2. FUNKCE PRO POTVRZENÍ NAKLÁDKY (Zápis řidiče)
function potvrditNakladku() {
    const ridic = document.getElementById('select-ridic').value;
    const fp = parseInt(document.getElementById('input-fp').value) || 0;
    const kh = parseInt(document.getElementById('input-kh').value) || 0;

    if (fp === 0 && kh === 0) {
        alert('Zadejte nenulové množství palet.');
        return;
    }

    // Matematická operace: Odečtení z plánu
    dataSvozu.zbyvaFP -= fp;
    dataSvozu.zbyvaKH -= kh;

    // Přidání do pole historie na první místo (nové nakládky nahoře)
    historieNakladek.unshift({ ridic, fp, kh });

    // Resetování vstupních polí formuláře
    document.getElementById('input-fp').value = '';
    document.getElementById('input-kh').value = '';

    // Překreslení aplikace a uložení stavu
    aktualizovatUI();
    ulozitDoLocalStorage();
}

// 3. NOVÁ FUNKCE: STORNO NAKLÁDKY (Odstranění a přičtení zpět)
function stornoNakladky(index) {
    // Bezpečnostní pojistka
    if (index < 0 || index >= historieNakladek.length) return;

    // Získání stornovaného objektu z pole podle indexu
    const stornovanaPolozka = historieNakladek[index];

    // MATEMATICKÝ ZPĚTNÝ CHOD: Přičtení hodnot zpět do zbývajících palet
    dataSvozu.zbyvaFP += stornovanaPolozka.fp;
    dataSvozu.zbyvaKH += stornovanaPolozka.kh;

    // Odstranění položky z pole historie podle indexu
    historieNakladek.splice(index, 1);

    // Překreslení aplikace a uložení stavu
    aktualizovatUI();
    ulozitDoLocalStorage();
}

// 4. POMOCNÁ FUNKCE PRO UKLÁDÁNÍ (Zajišťuje persistence v PWA)
function ulozitDoLocalStorage() {
    localStorage.setItem('geis_zbyvaFP', dataSvozu.zbyvaFP);
    localStorage.setItem('geis_zbyvaKH', dataSvozu.zbyvaKH);
    localStorage.setItem('geis_historie', JSON.stringify(historieNakladek));
}

// Inicializační spuštění při načtení stránky
window.onload = function() {
    // Načtení dat z localStorage, pokud existují
    if(localStorage.getItem('geis_zbyvaFP')) {
        dataSvozu.zbyvaFP = parseInt(localStorage.getItem('geis_zbyvaFP'));
        dataSvozu.zbyvaKH = parseInt(localStorage.getItem('geis_zbyvaKH'));
        historieNakladek = JSON.parse(localStorage.getItem('geis_historie')) || [];
    }
    aktualizovatUI();
};
