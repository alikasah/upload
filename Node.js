const express = require('express');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const app = express();

// إعداد التخزين
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const shortUrl = shortid.generate();
    // حفظ الرابط القصير والمعلومات في قاعدة البيانات (تخزين افتراضي)
    fs.writeFileSync('files.json', JSON.stringify({ 
        originalName: file.originalname, 
        shortUrl: shortUrl,
        path: file.path 
    }, null, 2));

    res.json({ shortUrl: `http://localhost:3000/${shortUrl}` });
});

// عرض أو تحميل الملف عبر الرابط القصير
app.get('/:shortUrl', (req, res) => {
    const shortUrl = req.params.shortUrl;
    const fileData = JSON.parse(fs.readFileSync('files.json'));

    if (fileData.shortUrl === shortUrl) {
        res.download(fileData.path, fileData.originalName);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
                     
