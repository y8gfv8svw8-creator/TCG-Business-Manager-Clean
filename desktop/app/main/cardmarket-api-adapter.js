'use strict';

// Vorbereitung fuer eine spaetere offizielle Cardmarket-Anbindung. Dieses Modul
// fuehrt ohne ausdrueckliche Aktivierung und einen externen Credential-Provider
// keinerlei Netzwerkzugriffe aus und speichert nie API-Schluessel in SQLite.
const CARDMARKET_API_BASE_URL = 'https://apiv2.cardmarket.com/ws/v2.0';

function text(value) {
  return String(value ?? '').trim();
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeArticle(article = {}, order = {}) {
  const product = article.product || {};
  return {
    sourceId: 'cardmarket_api',
    externalOrderId: text(order.idOrder || order.id),
    externalArticleId: text(article.idArticle || article.id),
    productId: text(article.idProduct || product.idProduct || product.id),
    cardName: text(article.productName || product.name || article.name),
    quantity: Math.max(1, Number.parseInt(article.count || article.quantity || 1, 10) || 1),
    unitPrice: number(article.price),
    language: text(article.language?.languageName || article.language || article.idLanguage),
    condition: text(article.condition),
    externalUpdatedAt: text(article.lastEdited || order.lastEdited || order.dateOfPurchase),
    raw: article
  };
}

function normalizeOrder(order = {}, tradeType = 'sale') {
  const partner = tradeType === 'purchase' ? order.seller : order.buyer;
  const articles = Array.isArray(order.article) ? order.article : (Array.isArray(order.articles) ? order.articles : []);
  return {
    sourceId: 'cardmarket_api',
    tradeType,
    externalOrderId: text(order.idOrder || order.id),
    orderNo: text(order.idOrder || order.id),
    date: text(order.dateOfPurchase || order.date || order.lastEdited).slice(0, 10),
    partner: text(partner?.username || partner?.name || partner),
    country: text(partner?.country || partner?.countryCode),
    status: text(order.state?.state || order.state || order.status),
    shipping: number(order.shippingCosts || order.shipping),
    totalValue: number(order.totalValue || order.value),
    articles: articles.map(article => normalizeArticle(article, order)),
    raw: order
  };
}

class CardmarketApiAdapter {
  constructor({ enabled = false, credentialProvider = null, fetchImpl = null } = {}) {
    this.enabled = Boolean(enabled);
    this.credentialProvider = credentialProvider;
    this.fetchImpl = fetchImpl;
  }

  getStatus() {
    return {
      sourceId: 'cardmarket_api',
      baseUrl: CARDMARKET_API_BASE_URL,
      enabled: this.enabled,
      credentialsAvailable: typeof this.credentialProvider === 'function',
      networkConfigured: typeof this.fetchImpl === 'function'
    };
  }

  async assertReady() {
    if (!this.enabled) throw new Error('Die Cardmarket-API ist noch nicht aktiviert.');
    if (typeof this.credentialProvider !== 'function') {
      throw new Error('Es ist noch kein sicherer Credential-Provider eingerichtet.');
    }
    if (typeof this.fetchImpl !== 'function') throw new Error('Es ist noch kein API-Transport eingerichtet.');
    const credentials = await this.credentialProvider();
    if (!credentials) throw new Error('Cardmarket-Zugangsdaten sind nicht verfügbar.');
    return credentials;
  }
}

module.exports = {
  CARDMARKET_API_BASE_URL,
  CardmarketApiAdapter,
  normalizeArticle,
  normalizeOrder
};
