const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { convertMdToPdf } = require('./lib/converter');

const app = express();
const port = 3000;

// Setup upload storage
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() !== '.md') {
            return cb(new Error('Only .md files are allowed'));
        }
        cb(null, true);
    }
});

// Serve static files
app.use(express.static('public'));

app.post('/convert', upload.single('markdown'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a file' });
    }

    try {
        const filePath = req.file.path;
        const mdContent = fs.readFileSync(filePath, 'utf8');

        // Clean up uploaded file immediately after reading
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error('Failed to delete temp file:', err);
        }

        const flowchartWidth = parseInt(req.body.flowchartWidth) || 70;
        const pdfBuffer = await convertMdToPdf(mdContent, req.body.paperSize || 'single', flowchartWidth);

        const originalName = req.file.originalname.replace(/\.md$/i, '');
        const filename = `${originalName}.pdf`;

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: 'Failed to convert file', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
