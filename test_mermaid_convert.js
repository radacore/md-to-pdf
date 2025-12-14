const fs = require('fs');
const { convertMdToPdf } = require('./lib/converter');

async function test() {
    console.log('Reading test_mermaid.md...');
    const mdContent = fs.readFileSync('./test_mermaid.md', 'utf8');

    console.log('Converting to PDF...');
    const pdfBuffer = await convertMdToPdf(mdContent, 'a4');

    console.log('Saving to test_mermaid_output.pdf...');
    fs.writeFileSync('./test_mermaid_output.pdf', pdfBuffer);

    console.log('Done! Check test_mermaid_output.pdf');
}

test().catch(console.error);
