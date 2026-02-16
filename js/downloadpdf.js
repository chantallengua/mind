document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;

    const downloadLink = document.querySelector('a[href$="articolo.pdf"]');
    if (!downloadLink) return;

    downloadLink.addEventListener('click', async (e) => {
        e.preventDefault();

        const doc = new jsPDF('p', 'pt', 'a4');
        const margin = 60;
        const lineHeight = 16;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        let x = margin;
        let y = margin;

        const content = document.getElementById('articolo-contenuto') || document.querySelector('body');

        const addParagraphSingleLine = (p) => {
            if (!p) return;
            if (p.classList.contains('pill-date')) return;

            const words = [];

            const parseNode = (node) => {
                if (node.nodeName === 'B') {
                    node.textContent.split(/(\s+)/).forEach(w => words.push({
                        text: w,
                        bold: w.trim() !== '',
                        italic: false,
                        link: null
                    }));
                } else if (node.nodeName === 'I') {
                    node.textContent.split(/(\s+)/).forEach(w => words.push({
                        text: w,
                        bold: false,
                        italic: w.trim() !== '',
                        link: null
                    }));
                } else if (node.nodeName === 'A') {
                    node.textContent.split(/(\s+)/).forEach(w => words.push({
                        text: w,
                        bold: false,
                        italic: false,
                        link: w.trim() !== '' ? node.href : null
                    }));
                } else if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent.split(/(\s+)/).forEach(w => words.push({
                        text: w,
                        bold: false,
                        italic: false,
                        link: null
                    }));
                } else if (node.childNodes.length > 0) {
                    node.childNodes.forEach(parseNode);
                }
            };

            p.childNodes.forEach(parseNode);

            if (p.classList.contains('bib')) {
                doc.setTextColor(136,136,136);
                doc.setFontSize(10);
                x = margin + 20;
            } else if (p.tagName === 'BLOCKQUOTE') {
                doc.setTextColor(136,136,136);
                doc.setFontSize(11);
                x = margin + 10;
            } else {
                doc.setTextColor(0,0,0);
                doc.setFontSize(11);
                x = margin;
            }

            words.forEach(word => {
                let fontStyle = 'normal';
                if (word.bold && word.italic) fontStyle = 'bolditalic';
                else if (word.bold) fontStyle = 'bold';
                else if (word.italic) fontStyle = 'italic';
                if (p.tagName === 'BLOCKQUOTE') fontStyle = 'italic';

                doc.setFont('helvetica', fontStyle);
                const textWidth = doc.getTextWidth(word.text);

                if (x + textWidth > pageWidth - margin) {
                    y += lineHeight;
                    x = p.classList.contains('bib') ? margin + 20 : (p.tagName === 'BLOCKQUOTE' ? margin + 10 : margin);
                    if (y + lineHeight > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }
                }

                if (word.link) {
                    doc.textWithLink(word.text, x, y, { url: word.link });
                } else {
                    doc.text(word.text, x, y);
                }

                x += textWidth;
            });

            y += lineHeight;
            x = margin;
        };

        // ====== BANNER ======
        const bannerUrl = 'https://raw.githubusercontent.com/chantallengua/repository/master/banner-pdf1.jpg';
        const bannerImg = await fetch(bannerUrl)
            .then(res => res.blob())
            .then(blob => new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            }));

        const bannerWidth = pageWidth;
        const bannerHeight = 50;
        doc.addImage(bannerImg, 'JPEG', 0, 0, bannerWidth, bannerHeight);
        y = bannerHeight + 40;

        // AUTORE
        const authorName = 'Antonio Lengua';
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(136,136,136);
        const authorWidth = doc.getTextWidth(authorName);
        doc.text(authorName, (pageWidth - authorWidth) / 2, y);
        y += lineHeight + 4;

        // SITO WEB
        const siteUrl = 'www.mentecielo.it';
        const siteWidth = doc.getTextWidth(siteUrl);
        const siteX = (pageWidth - siteWidth) / 2;
        doc.setTextColor(136,136,136);
        doc.textWithLink(siteUrl, siteX, y, { url: 'https://www.mentecielo.it' });

        doc.setDrawColor(136,136,136);
        doc.setLineWidth(0.3);
        doc.line(siteX, y + 2.5, siteX + siteWidth, y + 2.5);
        y += lineHeight;

        // LINEA SEPARATRICE
        const linePadding = 4;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        const lineStart = margin + 40;
        const lineEnd = pageWidth - margin - 40;
        doc.line(lineStart, y + linePadding, lineEnd, y + linePadding);
        y += lineHeight + linePadding * 2;
        y += 20;

        // Titolo
        const titleEl = content.querySelector('h2');
        let articleTitle = '';
        if (titleEl) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20);
            doc.setTextColor(77, 122, 162);
            doc.text(titleEl.innerText, margin, y);
            y += lineHeight + 10;

            articleTitle = titleEl.innerText
                .trim()
                .replace(/\s+/g, '_')
                .replace(/[^\w\-]/g, '');
        }

        // Data
        const dateEl = content.querySelector('.pill-date');
        if (dateEl) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(136,136,136);
            doc.text(dateEl.innerText, margin, y);
            y += lineHeight + 25;
        }

        // Corpo testo
        const paragraphs = Array.from(content.querySelectorAll('p, blockquote'));
        let bibStarted = false;
        paragraphs.forEach(p => {
            if (p.classList.contains('bib') && !bibStarted) {
                y += lineHeight;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.setTextColor(136,136,136);
                doc.text('Riferimenti:', margin, y);
                y += lineHeight;
                bibStarted = true;
            }
            addParagraphSingleLine(p);
        });

        const fileName = `Lengua_${articleTitle || 'articolo'}.pdf`;
        doc.save(fileName);
    });
});
