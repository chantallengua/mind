document.addEventListener('DOMContentLoaded', () => { 
    const { jsPDF } = window.jspdf;

    const downloadLink = document.querySelector('a[href$="articolo.pdf"]');
    if (!downloadLink) return;

    downloadLink.addEventListener('click', async (e) => {
        e.preventDefault();

        const doc = new jsPDF('p', 'pt', 'a4');
        const margin = 60; // margine più ampio
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
                    node.textContent.split(/(\s+)/).forEach(w => words.push({ text: w, bold: w.trim() !== '', italic: false, link: null }));
                } else if (node.nodeName === 'I') {
                    node.textContent.split(/(\s+)/).forEach(w => words.push({ text: w, bold: false, italic: w.trim() !== '', link: null }));
                } else if (node.nodeName === 'A') {
                    node.textContent.split(/(\s+)/).forEach(w => words.push({ text: w, bold: false, italic: false, link: w.trim() !== '' ? node.href : null }));
                } else if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent.split(/(\s+)/).forEach(w => words.push({ text: w, bold: false, italic: false, link: null }));
                } else if (node.childNodes.length > 0) {
                    node.childNodes.forEach(parseNode);
                }
            };

            p.childNodes.forEach(parseNode);

            // Imposta stile e indentazione
            if (p.classList.contains('bib')) {
                doc.setTextColor(136,136,136); // grigio
                doc.setFontSize(10);
                x = margin + 20; // indentazione
            } else if (p.tagName === 'BLOCKQUOTE') {
                doc.setTextColor(136,136,136); // grigio
                doc.setFontSize(11); // blockquote pt 11
                x = margin + 10; // indentazione leggera
            } else {
                doc.setTextColor(0,0,0); // nero normale
                doc.setFontSize(11); // testo leggermente più piccolo
                x = margin;
            }

            words.forEach(word => {
                let fontStyle = 'normal';
                if (word.bold && word.italic) fontStyle = 'bolditalic';
                else if (word.bold) fontStyle = 'bold';
                else if (word.italic) fontStyle = 'italic';

                // Se è blockquote, forza il corsivo
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

        // Titolo h2
        const titleEl = content.querySelector('h2');
        let articleTitle = '';
        if (titleEl) {
            y += 20; // margin-top sopra titolo principale
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20); // titolo leggermente più grande
            doc.setTextColor(56, 144, 1); // verde #389001
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
            y += lineHeight + 10;
        }

        // Paragrafi
        const paragraphs = Array.from(content.querySelectorAll('p, blockquote'));

        let bibStarted = false;
        paragraphs.forEach(p => {
            // Aggiungi titolo Riferimenti prima dei paragrafi bib
            if (p.classList.contains('bib') && !bibStarted) {
                y += lineHeight; // piccolo spazio prima
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.setTextColor(136,136,136); // grigio
                doc.text('Riferimenti:', margin, y);
                y += lineHeight; // spazio dopo titolo
                bibStarted = true;
            }

            addParagraphSingleLine(p);
        });

        // Salva file
        const fileName = `Lengua_${articleTitle || 'articolo'}.pdf`;
        doc.save(fileName);
    });
});
