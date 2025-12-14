const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { marked } = require('marked');
const { gfmHeadingId } = require("marked-gfm-heading-id");
const { mangle } = require("marked-mangle");
const markedAlert = require("marked-alert");
const hljs = require('highlight.js');

// Configure marked
marked.use(gfmHeadingId());
marked.use(mangle());
marked.use(markedAlert());

/**
 * Safely splits HTML code by newlines.
 * Robust implementation attempting to preserve tag balance.
 */
function splitHtmlWithTags(html) {
    // Ensure html is a string
    const safeHtml = String(html || '');
    if (!safeHtml) return [''];

    // Simplistic split might break tags like <span ...>\n...</span>
    // We will use a stack-based approach.
    const lines = [];
    let currentLine = '';
    const tagStack = [];

    // Regex matches tags or newlines
    const regex = /(<\/?([^>\s]+)[^>]*>)|(\r\n|\n|\r)/g;
    let lastIndex = 0;
    let match;

    try {
        while ((match = regex.exec(safeHtml)) !== null) {
            currentLine += safeHtml.substring(lastIndex, match.index);

            if (match[3]) { // Newline
                // Close open tags
                const closers = tagStack.slice().reverse().map(tag => `</${tag.name}>`).join('');
                currentLine += closers;
                lines.push(currentLine);

                // Re-open tags for next line
                const openers = tagStack.map(tag => tag.full).join('');
                currentLine = openers;
            } else { // Tag
                const fullTag = match[1];
                const tagName = match[2];
                const isClosing = fullTag.startsWith('</');
                const isSelfClosing = fullTag.endsWith('/>') || ['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tagName.toLowerCase());

                if (!isClosing && !isSelfClosing) {
                    tagStack.push({ name: tagName, full: fullTag });
                } else if (isClosing) {
                    if (tagStack.length > 0 && tagStack[tagStack.length - 1].name === tagName) {
                        tagStack.pop();
                    }
                }
                currentLine += fullTag;
            }
            lastIndex = regex.lastIndex;

            if (lines.length > 20000) {
                console.warn("Too many lines in code block, truncating splitting.");
                break;
            }
        }
        currentLine += safeHtml.substring(lastIndex);
        lines.push(currentLine);
    } catch (e) {
        console.error("Splitter Error:", e);
        // Fallback: simple split 
        return safeHtml.split(/\r\n|\n|\r/);
    }

    return lines;
}

// Counter for unique mermaid IDs
let mermaidCounter = 0;

const renderer = {
    code(tokenOrCode, infostring) {
        // Handle new marked signature where first arg might be a token object
        let codeContent = tokenOrCode;
        let langStr = infostring;

        if (typeof tokenOrCode === 'object' && tokenOrCode !== null) {
            codeContent = tokenOrCode.text || '';
            langStr = tokenOrCode.lang || infostring;
        }

        // Defensive: ensure code is a string
        const safeCode = String(codeContent || '');
        const lang = (langStr || '').match(/\S*/)[0];

        // === MERMAID TOGGLE ===
        // Set to true to enable Mermaid diagram rendering (requires CDN)
        // Set to false to render mermaid as code blocks (faster, no CDN needed)
        const ENABLE_MERMAID = true;

        // Helper to escape HTML entities in Mermaid code (prevents <script> from being executed)
        const escapeHtmlInMermaid = (code) => {
            return code
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };

        // Handle Mermaid diagrams
        if (lang === 'mermaid') {
            if (ENABLE_MERMAID) {
                const id = `mermaid-${mermaidCounter++}`;
                const codeLower = safeCode.trim().toLowerCase();

                // Detect diagram type for different widths
                let containerClass = 'mermaid-container';
                if (codeLower.startsWith('erdiagram')) {
                    containerClass = 'mermaid-container mermaid-er';
                } else if (codeLower.startsWith('flowchart tb') || codeLower.startsWith('flowchart td') || codeLower.startsWith('flowchart lr')) {
                    containerClass = 'mermaid-container mermaid-tb';
                }

                // Escape HTML to prevent <script> tags from being executed
                const escapedCode = escapeHtmlInMermaid(safeCode);

                return `
                    <div class="${containerClass}">
                        <pre class="mermaid" id="${id}">${escapedCode}</pre>
                    </div>`;
            }
            // When disabled, fall through to render as regular code block
        }

        let highlighted = '';
        try {
            // For PHP, use php-template to highlight embedded HTML
            let effectiveLang = lang;
            if (lang === 'php') {
                effectiveLang = 'php-template';
            }

            // Force language if possible, else auto
            if (effectiveLang && hljs.getLanguage(effectiveLang)) {
                highlighted = hljs.highlight(safeCode, { language: effectiveLang }).value;
            } else {
                highlighted = hljs.highlightAuto(safeCode).value;
            }
        } catch (e) {
            // Fallback to simple escaping
            highlighted = safeCode
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        }

        // Try to split
        let lines = [];
        try {
            lines = splitHtmlWithTags(highlighted);
        } catch (e) {
            console.error("Split Error, fallback:", e);
            lines = safeCode.split('\n');
        }

        // Build Table
        let tableRows = '';
        lines.forEach((lineContent, index) => {
            if (index === lines.length - 1 && lineContent === '') return;

            const lineNum = index + 1;
            tableRows += `
                <tr>
                    <td class="blob-num" data-line-number="${lineNum}"></td>
                    <td class="blob-code">${lineContent || ' '}</td>
                </tr>`;
        });

        return `
            <div class="highlight ${lang ? 'language-' + lang : ''}">
                <table class="highlight-table">
                    <tbody>${tableRows}</tbody>
                </table>
            </div>`;
    }
};

marked.use({ renderer });

async function convertMdToPdf(mdContent, paperSize = 'single') {
    // Reset mermaid counter for each conversion
    mermaidCounter = 0;

    try {
        const htmlContent = marked.parse(mdContent);

        const cssPath = path.join(__dirname, 'pdf-styles.css');
        let css = '';
        try {
            css = fs.readFileSync(cssPath, 'utf8');
        } catch (e) {
            console.warn('Could not read layout CSS', e);
        }

        const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        ${css}
        
        /* Mermaid diagram styling */
        .mermaid-container {
            display: block;
            width: 100%;
            margin: 1.5em 0;
            page-break-inside: avoid;
        }
        .mermaid {
            background: #fff;
            padding: 1em;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            width: 100%;
            text-align: center;
        }
        .mermaid svg {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
        }
        /* ER Diagram - smaller width, centered */
        .mermaid-er {
            width: 30%;
            margin-left: auto;
            margin-right: auto;
        }
        .mermaid-er .mermaid svg {
            width: auto !important;
            max-width: 100% !important;
        }
        /* Flowchart - 70% width, centered */
        .mermaid-tb {
            width: 70%;
            margin-left: auto;
            margin-right: auto;
        }
        .mermaid-tb .mermaid svg {
            width: auto !important;
            max-width: 100% !important;
        }
    </style>
</head>
<body>
    <div class="markdown-body">
        ${htmlContent}
    </div>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
        });
    </script>
</body>
</html>
      `;

        let browser = await puppeteer.launch({
            headless: 'new',
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            protocolTimeout: 180000
        });
        let page = await browser.newPage();

        // Check if content has Mermaid diagrams
        const hasMermaid = fullHtml.includes('mermaid-container');
        console.log('Has Mermaid diagrams:', hasMermaid);

        let contentLoaded = false;
        try {
            console.log('Loading page content...');
            // First, set content with domcontentloaded (fast)
            await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
            console.log('DOM loaded');

            if (hasMermaid) {
                console.log('Waiting for Mermaid CDN and render...');
                // Give time for CDN to load and Mermaid to render
                await new Promise(resolve => setTimeout(resolve, 5000));
                console.log('Mermaid wait complete');
            }

            contentLoaded = true;
            console.log('Page loaded successfully');
        } catch (err) {
            console.log('Error loading page:', err.message);
            console.log('Trying without Mermaid...');
            await browser.close();

            // Create new browser and load without Mermaid CDN
            browser = await puppeteer.launch({
                headless: 'new',
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            page = await browser.newPage();

            // Remove Mermaid CDN from HTML
            const htmlNoMermaid = fullHtml
                .replace(/<script src="https:\/\/cdn\.jsdelivr\.net[^"]*mermaid[^"]*"><\/script>/g, '')
                .replace(/<script>\s*mermaid\.initialize[\s\S]*?<\/script>/g, '');

            await page.setContent(htmlNoMermaid, { waitUntil: 'domcontentloaded' });
            console.log('Page loaded without Mermaid (diagrams will show as code)');
        }

        let pdfOptions;

        if (paperSize === 'a4') {
            // A4 multi-page
            pdfOptions = {
                format: 'A4',
                margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
                printBackground: true
            };
        } else if (paperSize === 'letter') {
            // US Letter multi-page
            pdfOptions = {
                format: 'Letter',
                margin: { top: '0.75in', right: '0.5in', bottom: '0.75in', left: '0.5in' },
                printBackground: true
            };
        } else {
            // Single page (auto height) - default
            const bodyHeight = await page.evaluate(() => {
                const content = document.querySelector('.markdown-body');
                if (content) {
                    return content.scrollHeight + content.offsetTop;
                }
                // Fallback with null checks
                const bodyH = document.body ? document.body.scrollHeight : 0;
                const docH = document.documentElement ? document.documentElement.scrollHeight : 0;
                return Math.max(bodyH, docH, 1000); // Minimum 1000px
            });
            const pdfHeight = bodyHeight + 200;

            pdfOptions = {
                width: '210mm',
                height: pdfHeight + 'px',
                margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
                printBackground: true
            };
        }

        const pdfBuffer = await page.pdf(pdfOptions);

        await browser.close();
        return pdfBuffer;
    } catch (err) {
        console.error("Critical Conversion Error:", err);
        throw err;
    }
}

module.exports = { convertMdToPdf };
