/* MARCHISIO PARFAMS · CONFIGURACIÓN (lo único que tenés que tocar seguido)
   USDT_RATE: cotización en pesos de 1 USDT con la que calculás los precios del catálogo completo.
   MARKUP:    1.40 = +40% sobre el costo mayorista.
   ROUND:     redondeo del precio final (500 = al múltiplo de $500 más cercano hacia arriba).
   CATALOG_PRICES: 'consultar' oculta los precios del catálogo completo; 'aprox' muestra un valor aproximado.
   EMAIL_ENDPOINT: opcional. Pegá acá la URL de tu formulario de Formspree (https://formspree.io/f/xxxx)
                   para recibir por mail los contactos del buscador. Si queda vacío, el aviso llega por WhatsApp. */
window.MP_CONFIG = {
  USDT_RATE: 1580,
  MARKUP: 1.40,
  ROUND: 500,
  WHATSAPP: '5491156541022',
  EMAIL_ENDPOINT: '',
  CATALOG_PRICES: 'consultar'   /* 'consultar' = catálogo sin precios (hay que pedirlos) · 'aprox' = muestra un precio aproximado */
};
