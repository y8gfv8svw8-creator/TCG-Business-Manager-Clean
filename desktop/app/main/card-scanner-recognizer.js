const fs = require('fs');
const path = require('path');
const { createWorker, OEM, PSM } = require('tesseract.js');
const englishData = require('@tesseract.js-data/eng');
const germanData = require('@tesseract.js-data/deu');
const ScannerRecognition = require('../shared/scanner-recognition');

const DATA_URL_PATTERN = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/i;
const PASS_CONFIG = Object.freeze({
  title: { mode: PSM.SINGLE_LINE, whitelist: '' },
  setCode: { mode: PSM.SINGLE_LINE, whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-' },
  footer: { mode: PSM.SINGLE_LINE, whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ' }
});

function imageBuffer(dataUrl) {
  const match = String(dataUrl || '').match(DATA_URL_PATTERN);
  return match ? Buffer.from(match[1].replace(/\s+/g, ''), 'base64') : null;
}

class CardScannerRecognizer {
  constructor({ cacheRoot, logger = () => {} } = {}) {
    this.cacheRoot = path.resolve(cacheRoot || path.join(process.cwd(), '.ocr-cache'));
    this.logger = logger;
    this.workerPromise = null;
    this.queue = Promise.resolve();
  }

  prepareLanguageData() {
    fs.mkdirSync(this.cacheRoot, { recursive: true });
    for (const language of [englishData, germanData]) {
      const fileName = `${language.code}.traineddata.gz`;
      const source = path.join(language.langPath, fileName);
      const target = path.join(this.cacheRoot, fileName);
      if (!fs.existsSync(target) || fs.statSync(target).size !== fs.statSync(source).size) fs.copyFileSync(source, target);
    }
  }

  async worker() {
    if (!this.workerPromise) {
      this.prepareLanguageData();
      this.workerPromise = createWorker(['eng', 'deu'], OEM.LSTM_ONLY, {
        langPath: this.cacheRoot,
        cachePath: this.cacheRoot,
        cacheMethod: 'readOnly',
        gzip: true,
        logger: message => this.logger(message)
      }).then(async worker => {
        await worker.setParameters({
          tessedit_pageseg_mode: PSM.SPARSE_TEXT,
          preserve_interword_spaces: '1'
        });
        return worker;
      }).catch(error => {
        this.workerPromise = null;
        throw error;
      });
    }
    return this.workerPromise;
  }

  recognize(payload = {}) {
    const job = async () => {
      const originalImage = imageBuffer(payload.imageDataUrl);
      if (!originalImage) throw new Error('Das Scanbild ist ungültig.');
      const startedAt = Date.now();
      const worker = await this.worker();
      const passResults = [];
      const passes = Array.isArray(payload.passes) ? payload.passes.slice(0, 12) : [];
      for (const pass of passes) {
        const config = PASS_CONFIG[pass?.kind];
        const buffer = config ? imageBuffer(pass?.imageDataUrl) : null;
        if (!config || !buffer) continue;
        try {
          await worker.setParameters({
            tessedit_pageseg_mode: config.mode,
            preserve_interword_spaces: '1',
            tessedit_char_whitelist: config.whitelist
          });
          const result = await worker.recognize(buffer);
          passResults.push({
            kind: pass.kind,
            variant: String(pass.variant || ''),
            text: String(result?.data?.text || '').trim(),
            confidence: Math.max(0, Math.min(100, Number(result?.data?.confidence || 0)))
          });
        } catch (error) {
          passResults.push({ kind: pass.kind, variant: String(pass.variant || ''), text: '', confidence: 0, error: error.message || String(error) });
        }
      }

      const titleTexts = passResults.filter(row => row.kind === 'title' && row.text).map(row => row.text);
      const setCodeTexts = passResults.filter(row => row.kind === 'setCode' && row.text).map(row => row.text);
      const footerTexts = passResults.filter(row => row.kind === 'footer' && row.text).map(row => row.text);
      let fullText = '';
      let fullConfidence = 0;
      const targetedSetCodes = setCodeTexts.flatMap(ScannerRecognition.extractSetCodes);
      const targetedTitles = titleTexts.flatMap(ScannerRecognition.extractTitleCandidates);
      if (!passes.length || (!targetedSetCodes.length && !targetedTitles.length)) {
        await worker.setParameters({
          tessedit_pageseg_mode: PSM.SPARSE_TEXT,
          preserve_interword_spaces: '1',
          tessedit_char_whitelist: ''
        });
        const result = await worker.recognize(originalImage);
        fullText = String(result?.data?.text || '').trim();
        fullConfidence = Math.max(0, Math.min(100, Number(result?.data?.confidence || 0)));
      }
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        preserve_interword_spaces: '1',
        tessedit_char_whitelist: ''
      });
      const text = [...titleTexts, ...setCodeTexts, ...footerTexts, fullText].filter(Boolean).join('\n');
      const confidenceValues = passResults.filter(row => row.text).map(row => row.confidence);
      if (fullText) confidenceValues.push(fullConfidence);
      const setCodes = [...new Set([text, ...setCodeTexts].flatMap(ScannerRecognition.extractSetCodes))];
      const passcodes = [...new Set([text, ...footerTexts].flatMap(ScannerRecognition.extractPasscodes))];
      const edition = ScannerRecognition.extractEdition(footerTexts.join('\n')) || ScannerRecognition.extractEdition(text);
      return {
        text,
        fullText,
        confidence: confidenceValues.length ? Math.max(...confidenceValues) : 0,
        queries: ScannerRecognition.buildQueries({ hint: payload.hint, text: fullText, titleTexts, setCodeTexts }),
        titleCandidates: [...new Set(titleTexts.flatMap(ScannerRecognition.extractTitleCandidates))],
        setCodes,
        passcodes,
        edition,
        regionResults: passResults,
        durationMs: Date.now() - startedAt,
        engine: passes.length ? 'tesseract-local-regions' : 'tesseract-local'
      };
    };
    const pending = this.queue.then(job, job);
    this.queue = pending.catch(() => {});
    return pending;
  }

  async terminate() {
    const worker = await this.workerPromise?.catch(() => null);
    this.workerPromise = null;
    if (worker) await worker.terminate();
  }
}

module.exports = { CardScannerRecognizer };
