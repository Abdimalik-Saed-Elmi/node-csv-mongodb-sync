import express, { Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import mongoose, { Schema, Document } from 'mongoose';
import path from 'path';

const app = express();
const PORT = 5000;

// ====== TypeScript Interface ======
interface IStudent extends Document {
    LIST: number;
    STUDENTS: string;
    CLASS: string;
    Tarbiyo: number;
    Somali: number;
    Carabi: number;
    English: number;
    C_Bulshada: number;
    Xisaab: number;
    Saynis: number;
    Teknoloji: number;
    Wadar: number;
    Celcelis: number;
}

// ====== MongoDB Connection ======
mongoose.connect('mongodb://127.0.0.1:27017/csv_uploading?replicaSet=rs0')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ====== MongoDB Schema ======
const StudentSchema: Schema = new Schema({
    LIST: Number,
    STUDENTS: String,
    CLASS: String,
    Tarbiyo: Number,
    Somali: Number,
    Carabi: Number,
    English: Number,
    C_Bulshada: Number,
    Xisaab: Number,
    Saynis: Number,
    Teknoloji: Number,
    Wadar: Number,
    Celcelis: Number
});

const Student = mongoose.model<IStudent>('Student', StudentSchema);

// ====== Multer Setup ======
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== '.csv') {
            return cb(new Error('Only CSV files are allowed!'));
        }
        cb(null, true);
    }
});

// ====== Upload Route ======
app.post('/upload', upload.single('file'), (req: Request, res: Response): any => {
    if (!req.file) return res.status(400).json({ error: 'Fadlan file soo dooro' });

    const results: any[] = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            if (row.STUDENTS && row.STUDENTS.trim() !== "") {
                results.push(row);
            }
        })
        .on('end', async () => {
            try {
                await Student.insertMany(results);
                if (req.file) fs.unlinkSync(req.file.path); // Safe cleanup
                res.json({ 
                    status: "Success", 
                    message: `${results.length} Arday waa la keydiyey.`,
                    data: results[0]
                });
            } catch (err: any) {
                res.status(500).json({ error: 'Cilad baa dhacday', details: err.message });
            }
        });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});