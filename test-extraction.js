const {PDFParse} = require('pdf-parse');
const fs = require('fs');

function cleanExtractedText(raw) {
    let text = raw;
    text = text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '');
    text = text.replace(/\b([A-Z])(?:\s+[A-Z]){3,}\b/g, (m) => m.replace(/\s+/g, ''));
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

function normalizeForMatch(text) {
    const deSpaced = (text || '').replace(/\b(?:[A-Za-z]\s+){2,}[A-Za-z]\b/g, (m) => m.replace(/\s+/g, ''));
    return deSpaced.toLowerCase().replace(/[^a-z0-9+#./\-\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeRegExp(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function canonicalKeywordVariants(keyword) {
    const k = normalizeForMatch(keyword);
    const variants = new Set([k]);
    if (k === '.net 8') { variants.add('net 8'); variants.add('.net8'); }
    if (k === '.net') { variants.add('net'); variants.add('.net core'); variants.add('.net 8'); }
    if (k === 'ci/cd') { variants.add('ci cd'); variants.add('continuous integration'); }
    if (k === 'angular 18') { variants.add('angular'); }
    if (k === 'microsoft azure') variants.add('azure');
    if (k === 'azure') variants.add('microsoft azure');
    if (k === 'entity framework') variants.add('ef');
    if (k === 'nosql') { variants.add('no sql'); variants.add('no-sql'); }
    if (k === 'rdbms') { variants.add('relational database'); variants.add('mysql'); variants.add('postgresql'); }
    if (k === 'tailwindcss') { variants.add('tailwind css'); variants.add('tailwind'); }
    if (k === 'docker') variants.add('containerization');
    if (k === 'nestjs') { variants.add('nest.js'); variants.add('nest js'); }
    if (k === 'typeorm') { variants.add('type orm'); }
    return Array.from(variants).filter(Boolean);
}

function containsKeyword(resumeNorm, keyword) {
    const variants = canonicalKeywordVariants(keyword);
    return variants.some((v) => {
        if (!v) return false;
        const p = new RegExp('(^|\\s)' + escapeRegExp(v) + '(\\s|$)', 'i');
        return p.test(resumeNorm);
    });
}

async function test() {
    const buf = fs.readFileSync('C:\\Users\\nihad_a7e0bkc\\Downloads\\Tailored_CV_Nihad_Soltanov (4).pdf');
    const parser = new PDFParse({data: buf});
    const result = await parser.getText();
    await parser.destroy();
    const text = cleanExtractedText(result.text);
    console.log('=== CLEANED TEXT ===');
    console.log('Length:', text.length);
    console.log('First 300:', text.slice(0, 300));
    console.log();
    
    const resumeNorm = normalizeForMatch(text);
    console.log('=== NORMALIZED (first 300) ===');
    console.log(resumeNorm.slice(0, 300));
    console.log();
    
    // JD keywords that ATS should find
    const jdKeywords = ['angular 18', 'typescript', '.net 8', 'entity framework', 'nestjs', 'typeorm', 'microsoft azure', 'pm2', 'tailwindcss', 'docker', 'rdbms', 'nosql'];
    
    const found = [];
    const missing = [];
    for (const kw of jdKeywords) {
        if (containsKeyword(resumeNorm, kw)) found.push(kw);
        else missing.push(kw);
    }
    
    console.log('=== KEYWORD MATCHING ===');
    console.log('FOUND (' + found.length + '/' + jdKeywords.length + '):', found.join(', '));
    console.log('MISSING (' + missing.length + '):', missing.join(', '));
    console.log('Match rate:', Math.round(found.length / jdKeywords.length * 100) + '%');
}

test().catch(e => console.error(e));
