from bs4 import BeautifulSoup, Comment
import re
import os

INPUT_FILE = "newsletter.html"
OUTPUT_FILE = "output-pill-newsletter.html"


def extract_sections(html):
    soup = BeautifulSoup(html, "html.parser")

    comments = soup.find_all(string=lambda t: isinstance(t, Comment))

    start_comment = None
    end_comment = None

    for c in comments:
        if "Contenuto principale" in c:
            start_comment = c
        elif "Riga sottile" in c and start_comment:
            end_comment = c
            break

    if not start_comment or not end_comment:
        raise ValueError("Marker 'Contenuto principale' o 'Riga sottile' non trovati.")

    elements = []
    current = start_comment.next_sibling

    while current and current != end_comment:
        if getattr(current, "name", None) == "tr":
            elements.append(current)
        current = current.next_sibling

    return elements


def extract_date(html):
    match = re.search(r"\d{1,2}\s+\w+\s+\d{4}", html)
    return match.group(0) if match else ""


def convert_to_blocks(tr_elements):
    blocks = []
    title = None

    for tr in tr_elements:
        td = tr.find("td")
        if not td:
            continue

        content_html = td.decode_contents().strip()
        text_only = BeautifulSoup(content_html, "html.parser").get_text().strip()

        if not text_only:
            continue

        style = td.get("style", "")
        is_box = "background-color:#de5f5a" in style

        if is_box:
            blocks.append(("quote", content_html))
        else:
            if title is None:
                title = text_only
            else:
                blocks.append(("paragraph", content_html))

    return title, blocks


def build_full_html(title, date, blocks):
    content_parts = []

    for block_type, html_content in blocks:
        if block_type == "paragraph":
            content_parts.append(f"<p>{html_content}</p>")
        elif block_type == "quote":
            content_parts.append(
                f'<blockquote class="pills-quote">{html_content}</blockquote>'
            )

    article_content = "\n".join(content_parts)

    template = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
<meta name="description" content="" />
<meta name="author" content="Antonio Lengua" />
<title>Mente Cielo</title>
<link rel='icon' href='../assets/img/logo/logo.ico'/>
<script src="https://use.fontawesome.com/releases/v6.3.0/js/all.js" crossorigin="anonymous"></script>
<link href="https://fonts.googleapis.com/css?family=Varela+Round" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,700,800,900" rel="stylesheet" />
<link href="../css/styles.css" rel="stylesheet" />
</head>
<body id="page-top">

<header class="masthead-pills"></header>

<section class="projects-section projects-section-pillole pt-5">
<div class="container mt-lg-4 px-lg-5">
<div class="row gx-5">
<div class="col-lg-9 pl-4">
<div class="featured-text text-left pillole" id="articolo-contenuto">

<h2 id="titolo" class="mb-3"><b>{title}</b></h2>
<hr class="blue line">
<p class="pill-date" id="data">{date}</p>

{article_content}

</div>
</div>

<div class="col-lg-3 sidebar-column"></div>

</div>
</div>
</section>

<footer class="footer bg-black small text-center text-white-50">
<div class="container">Copyright &copy; Antonio e Chantal Lengua 2026</div>
</footer>

</body>
</html>
"""
    return template


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"File '{INPUT_FILE}' non trovato nella cartella corrente.")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        original_html = f.read()

    tr_elements = extract_sections(original_html)
    title, blocks = convert_to_blocks(tr_elements)
    date = extract_date(original_html)

    final_html = build_full_html(title, date, blocks)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(final_html)

    print(f"Creato file: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
