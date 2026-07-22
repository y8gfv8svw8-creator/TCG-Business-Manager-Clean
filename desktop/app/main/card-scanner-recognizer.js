const fs = require('fs');
const path = require('path');
const { createWorker, OEM, PSM } = require('tesseract.js');
const englishData = require('@tesseract.js-data/eng');
const germanData = require('@tesseract.js-data/deu');
const ScannerRecognition = require('../shared/scanner-recognition');

const DATA_URL_PATTERN = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/i;

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
      const match = String(payload.imageDataUrl || '').match(DATA_URL_PATTERN);
      if (!match) throw new Error('Das Scanbild ist ungültig.');
      const startedAt = Date.now();
      const worker = await this.worker();
      const result = await worker.recognize(Buffer.from(match[1].replace(/\s+/g, ''), 'base64'));
      const text = String(result?.data?.text || '').trim();
      return {
        text,
        confidence: Math.max(0, Math.min(100, Number(result?.data?.confidence || 0))),
        queries: ScannerRecognition.buildQueries({ hint: payload.hint, text }),
        setCodes: ScannerRecognition.extractSetCodes(text),
        durationMs: Date.now() - startedAt,
        engine: 'tesseract-local'
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
