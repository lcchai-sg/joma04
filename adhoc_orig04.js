const { MessageStation, timeout } = require("@cosmos/utils");
const joma = require('./joma04');

(async function () {
  const mqHost = process.env.MESSAGE_HOST || 'vulture.rmq.cloudamqp.com';
  const mqUser = process.env.MESSAGE_USER || 'kswsdxln';
  const mqPass = process.env.MESSAGE_PASS || 'ZsZJndMGqhVPo-hxbJ-Tg9Y-Mn18TGCP';
  const mqVhost = process.env.MESSAGE_VHOST || 'kswsdxln';
  const station = await MessageStation
    .connect({
      host: mqHost,
      user: mqUser,
      pass: mqPass,
      vhost: mqVhost
    });
  const messenger = await station.createMessenger({
      exchange: 'scraper',
      exType: 'topic',
      route: 'scrape.data.raw',
      queue: 'scraper-data'
    });

  const interval = 5000;
  const lang = "en";
  const source = "jomashop";
  const targets = joma;
  const ps = [];
  for (let i=0; i<targets.length; i++) {
    // for (const target of targets) {
    const p = messenger
      .request("crawler", {
        dryRun: false,
        payload: {
          strategy: "jomashop",
          command: "extraction",
          context: {
            entry: targets[i].url,
            brand: targets[i].brand,
            brandID: targets[i].brandID,
            productID: targets[i].productID,
            lang: targets[i].lang,
            collection: targets[i].collection,
            price: targets[i].price,
            thumbnail: targets[i].thumbnail,
            retail: targets[i].retail,
            gender: targets[i].gender,
          }
        }
      }, { replyTo: "distiller" })
      .then((result) => {
        // update data
        const { url, code, } = result;
        console.debug('url:', url, 'code:', code,);
      });
    ps.push(p);
    await timeout(interval);
  }
  await Promise.all(ps);
})();
