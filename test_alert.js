const { marked } = require('marked');
const markedAlert = require("marked-alert");

marked.use(markedAlert());

const md = `
> [!IMPORTANT]
> Pastikan struktur ini sesuai 100%, karena semua kode di bab selanjutnya akan mengacu pada path ini (\`__DIR__\`).
`;

const html = marked.parse(md);
console.log(html);
