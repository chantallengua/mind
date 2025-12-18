import re
from datetime import datetime

MASTER_HTML = "master-pillole.html"
TESTO_TXT = "testo.txt"
OUTPUT_HTML = "output.html"


MESI = {
    "Gennaio": "Gennaio",
    "Febbraio": "Febbraio",
    "Marzo": "Marzo",
    "Aprile": "Aprile",
    "Maggio": "Maggio",
    "Giugno": "Giugno",
    "Luglio": "Luglio",
    "Agosto": "Agosto",
    "Settembre": "Settembre",
    "Ottobre": "Ottobre",
    "Novembre": "Novembre",
    "Dicembre": "Dicembre",
}


def formatta_data(riga):
    """
    Converte 'Agosto 2025' in '11 Agosto 2025'
    Usa il giorno corrente.
    """
    oggi = datetime.now().day
    parti = riga.strip().split()
    if len(parti) == 2:
        mese, anno = parti
        return f"{oggi} {mese} {anno}"
    return riga.strip()


def trasforma_stili(testo):
    """
    *grassetto* -> <b>
    _corsivo_   -> <i>
    """
    testo = re.sub(r"\*(.*?)\*", r"<b>\1</b>", testo)
    testo = re.sub(r"_(.*?)_", r"<i>\1</i>", testo)
    return testo


def processa_testo():
    with open(TESTO_TXT, "r", encoding="utf-8") as f:
        righe = [r.rstrip() for r in f.readlines()]

    titolo = righe[0]
    data = formatta_data(righe[1])

    corpo = []
    bibliografia = []
    bib_counter = 1
    in_biblio = False
    lista_attiva = False
    ul_buffer = []

    i = 2
    while i < len(righe):
        riga = righe[i].strip()

        if not riga:
            if lista_attiva:
                corpo.append("<ul>")
                corpo.extend(ul_buffer)
                corpo.append("</ul>")
                ul_buffer = []
                lista_attiva = False
            i += 1
            continue

        # Bibliografia
        if re.match(r"\[\d+\]", riga):
            in_biblio = True

        if in_biblio:
            bibliografia.append(riga)
            i += 1
            continue

        # Quote
        if riga.lower().startswith("quote:"):
            citazione = righe[i + 1].strip()
            citazione = trasforma_stili(citazione)
            corpo.append(
                f'<blockquote class="pills-quote">{citazione} '
                f'<sup><a href="#bib{bib_counter}">[{bib_counter}]</a></sup></blockquote>'
            )
            bib_counter += 1
            i += 2
            continue

        # Liste puntate
        if riga.startswith("- ") or riga.startswith("• "):
            lista_attiva = True
            contenuto = trasforma_stili(riga[2:])
            ul_buffer.append(f"<li>{contenuto}</li>")
            i += 1
            continue

        # Paragrafo normale
        riga = trasforma_stili(riga)
        corpo.append(f"<p>{riga}</p>")
        i += 1

    if lista_attiva:
        corpo.append("<ul>")
        corpo.extend(ul_buffer)
        corpo.append("</ul>")

    return titolo, data, corpo, bibliografia


def genera_html():
    with open(MASTER_HTML, "r", encoding="utf-8") as f:
        master = f.read()

    titolo, data, corpo, bibliografia = processa_testo()

    nuovo_contenuto = []

    nuovo_contenuto.append(f'<p class="pill-date" id="data">{data}</p>')
    nuovo_contenuto.append(f'<p id="titolo"><b>{titolo}</b></p>')
    nuovo_contenuto.extend(corpo)

    if bibliografia:
        nuovo_contenuto.append('<hr class="mt-4 mb-2">')
        for idx, voce in enumerate(bibliografia, start=1):
            classe = "bib first-bib" if idx == 1 else "bib"
            voce = trasforma_stili(voce)
            nuovo_contenuto.append(
                f'<p id="bib{idx}" class="{classe}">{voce}</p>'
            )

    nuovo_blocco = "\n".join(nuovo_contenuto)

    pattern = re.compile(
        r"(<!-- Colonna a sinistra con il testo -->)(.*?)(<!-- Fine colonna a sinistra con il testo -->)",
        re.DOTALL,
    )

    def sostituisci(match):
        return (
            match.group(1)
            + "\n"
            + nuovo_blocco
            + "\n"
            + match.group(3)
        )

    output = pattern.sub(sostituisci, master)

    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(output)


if __name__ == "__main__":
    genera_html()
    print("File output.html generato correttamente.")
