import re
from datetime import datetime

MASTER_HTML = "master-pillole.html"
TESTO_TXT = "testo.txt"
OUTPUT_HTML = "output.html"


def trasforma_stili(testo):
    """
    *testo* -> <b>
    _testo_ -> <i>
    """
    testo = re.sub(r"\*(.*?)\*", r"<b>\1</b>", testo)
    testo = re.sub(r"_(.*?)_", r"<i>\1</i>", testo)
    return testo


def processa_testo():
    with open(TESTO_TXT, "r", encoding="utf-8") as f:
        righe = [r.rstrip() for r in f.readlines()]

    titolo = righe[0].strip()

    corpo = []
    bibliografia = []
    bib_counter = 1
    in_biblio = False
    lista_attiva = False
    buffer_lista = []

    i = 1
    while i < len(righe):
        riga = righe[i].strip()

        if not riga:
            if lista_attiva:
                corpo.append("<ul>")
                corpo.extend(buffer_lista)
                corpo.append("</ul>")
                buffer_lista = []
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
            buffer_lista.append(f"<li>{contenuto}</li>")
            i += 1
            continue

        # Paragrafo normale
        riga = trasforma_stili(riga)
        corpo.append(f"<p>{riga}</p>")
        i += 1

    if lista_attiva:
        corpo.append("<ul>")
        corpo.extend(buffer_lista)
        corpo.append("</ul>")

    return titolo, corpo, bibliografia


def genera_html():
    with open(MASTER_HTML, "r", encoding="utf-8") as f:
        master = f.read()

    titolo, corpo, bibliografia = processa_testo()

    nuovo_blocco = []

    nuovo_blocco.append(f'<h2 id="titolo" class="mb-3"><b>{titolo}</b></h2>')
    nuovo_blocco.append('<hr style="border: 2px solid #389001; margin: 20px 0;">')

    nuovo_blocco.extend(corpo)

    if bibliografia:
        nuovo_blocco.append('<hr class="mt-4 mb-2">')
        for idx, voce in enumerate(bibliografia, start=1):
            classe = "bib first-bib" if idx == 1 else "bib"
            voce = trasforma_stili(voce)
            nuovo_blocco.append(
                f'<p id="bib{idx}" class="{classe}">{voce}</p>'
            )

    nuovo_contenuto = "\n".join(nuovo_blocco)

    pattern = re.compile(
        r"(<!-- Colonna a sinistra con il testo -->)(.*?)(<!-- Fine colonna a sinistra con il testo -->)",
        re.DOTALL,
    )

    def sostituisci(match):
        return (
            match.group(1)
            + "\n"
            + nuovo_contenuto
            + "\n"
            + match.group(3)
        )

    output = pattern.sub(sostituisci, master)

    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(output)


if __name__ == "__main__":
    genera_html()
    print("output.html generato correttamente.")
