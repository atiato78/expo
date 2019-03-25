const ACCOUNT = 'baconbrix';

const posts = [
  {
    description: 'Being a 21-year-old @expo.io developer is lit 😍🔥💙',
    image: `https://scontent-sjc3-1.cdninstagram.com/vp/0ea7ffb0370dddfadd528a8b1b516573/5D186640/t51.2885-15/e35/45460185_782185418780650_4154679091114957131_n.jpg?_nc_ht=scontent-sjc3-1.cdninstagram.com`,
  },
  {
    description: 'Being a 21-year-old @expo.io developer is lit 😍🔥💙',
    image: `https://scontent-sjc3-1.cdninstagram.com/vp/38bfcc8b1412fe6e9eacf269def89ba5/5D0F993A/t51.2885-15/sh0.08/e35/c0.78.1080.1080/s640x640/50824531_117448239345934_8589191116386787248_n.jpg?_nc_ht=scontent-sjc3-1.cdninstagram.com`,
  },
  {
    description: 'Being a 21-year-old @expo.io developer is lit 😍🔥💙',
    image: `https://scontent-sjc3-1.cdninstagram.com/vp/f939678f172bbb08daec6cfe8f6c0aa1/5D4F31EB/t51.2885-15/sh0.08/e35/s640x640/44588924_315715379251262_8214353241920829455_n.jpg?_nc_ht=scontent-sjc3-1.cdninstagram.com`,
  },
  {
    description: 'enjoying a hammysammy',
    hasMulti: true,
    image: 'https://i.ytimg.com/vi/iSTUfJjtEOY/maxresdefault.jpg',
  },
  {
    description: 'enjoying a hammysammy',

    image:
      'https://m.media-amazon.com/images/M/MV5BNTE0Yzc3OTQtN2NhMS00NTdiLTlmMzAtOGRjNmQ3ZGYxN2M5XkEyXkFqcGdeQXVyMzQ3OTE4NTk@._V1_UY268_CR11,0,182,268_AL_.jpg',
  },
  {
    description: 'enjoying a hammysammy',

    image: 'https://i.ebayimg.com/images/g/MuwAAOSwax5YoZOp/s-l300.jpg',
  },
  {
    description: 'enjoying a hammysammy',
    image:
      'https://coubsecure-s.akamaihd.net/get/b115/p/coub/simple/cw_timeline_pic/3ad828e8989/ffa93af652a155a7911d2/big_1473465663_1382481140_image.jpg',
  },
  {
    description: 'enjoying a hammysammy',
    image: 'https://regularshowwiki.weebly.com/uploads/7/4/1/1/7411048/8617815_orig.png',
  },
].map(item => ({ author: ACCOUNT, source: { uri: item.image }, ...item }));

export default posts;

// {
//     key: 'item-a',
//     description: 'New selfie, might take it down, idk, give me likes',
//     author: '@baconbrix',
//     source: {
//       uri:
//         'https://resize-parismatch.ladmedia.fr/r/940,628/l/logo/img/var/news/storage/images/paris-match/actu/economie/elon-musk-force-de-demissionner-du-poste-de-president-du-ca-de-tesla-1577422/25590649-1-fre-FR/Elon-Musk-force-de-demissionner-du-poste-de-president-du-CA-de-Tesla.jpg',
//     },
//   },
// {
//   key: 'item-b',
//   description: 'New selfie, might take it down, idk, give me likes',
//   author: '@baconbrix',
//   source: {
//     uri:
//       'https://media.novinky.cz/511/695110-top_foto1-5ir4w.jpg?1537214402',
//   },
// },
// {
//   key: 'item-c',
//   description: 'New selfie, might take it down, idk, give me likes',
//   author: '@baconbrix',
//   source: {
//     uri:
//       'https://resize-parismatch.ladmedia.fr/r/940,628/l/logo/img/var/news/storage/images/paris-match/actu/economie/elon-musk-force-de-demissionner-du-poste-de-president-du-ca-de-tesla-1577422/25590649-1-fre-FR/Elon-Musk-force-de-demissionner-du-poste-de-president-du-CA-de-Tesla.jpg',
//   },
// },
// {
//   key: 'item-d',
//   description: 'New selfie, might take it down, idk, give me likes',
//   author: '@baconbrix',
//   source: {
//     uri:
//       'https://cdn2.i-scmp.com/sites/default/files/styles/landscape/public/images/methode/2018/04/20/c0d961b2-43b0-11e8-ab09-36e8e67fb996_1280x720_125123.JPG?itok=SYeH_4My',
//   },
// },
// {
//   key: 'item-e',
//   description: 'New selfie, might take it down, idk, give me likes',
//   author: '@baconbrix',
//   source: {
//     uri:
//       'https://resize-parismatch.ladmedia.fr/r/940,628/l/logo/img/var/news/storage/images/paris-match/actu/economie/elon-musk-force-de-demissionner-du-poste-de-president-du-ca-de-tesla-1577422/25590649-1-fre-FR/Elon-Musk-force-de-demissionner-du-poste-de-president-du-CA-de-Tesla.jpg',
//   },
// },
