require('dotenv').config();
const mongoose = require('mongoose');

const Product = require('../models/product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopping';

const products = [
  {
    imagePath: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Gothiccover.png',
    title: 'Gothic Video Game',
    description: 'Awesome Game...!!!',
    price: 10,
    id: 101,
  },
  {
    imagePath:
      'https://www.gannett-cdn.com/-mm-/ac688eec997d2fce10372bf71657297ff863814d/c=171-0-1195-768/local/-/media/2018/12/04/USATODAY/usatsports/call-of-duty-black-ops-iiii.jpg?width=540&height=405&fit=crop',
    title: 'Call of Duty',
    description:
      'The Xbox One release of the latest in Activision\u2019s highly successful spinoff of the "Call of Duty" series has sold over 1 million units in its first week of sales.',
    price: 30,
    id: 102,
  },
  {
    imagePath: 'https://en.wikipedia.org/wiki/Singularity_(video_game)#/media/File:Singularity_cover.jpg',
    title: 'Singularity',
    description:
      'Singularity is a 2010 first-person shooter video game developed by Raven Software and published by Activision, released for Microsoft Windows, PlayStation 3 and Xbox 360.',
    price: 35,
    id: 103,
  },
  {
    imagePath: 'https://im.ziffdavisinternational.com/ign_ap/screenshot/t/top-five-nonviolent-games/top-five-nonviolent-games_gny7.jpg',
    title: 'From Dust',
    description:
      'From Dust is a god video game, designed by \u00c9ric Chahi and developed by Ubisoft Montpellier, released for Microsoft Windows, PlayStation Network, and Xbox Live Arcade in 2011.',
    price: 15,
    id: 104,
  },
  {
    imagePath: 'https://im.ziffdavisinternational.com/ign_ap/screenshot/t/top-five-nonviolent-games/top-five-nonviolent-games_qax7.jpg',
    title: 'Walking Mars',
    description:
      'Waking Mars is a platform-adventure game produced by Tiger Style in which players jetpack through underground Mars caves and encounter a host of alien lifeforms.',
    price: 12,
    id: 105,
  },
  {
    imagePath: 'https://im.ziffdavisinternational.com/ign_ap/screenshot/t/top-five-nonviolent-games/top-five-nonviolent-games_zwef.jpg',
    title: 'Journey',
    description:
      'Journey is an arcade game released by Bally Midway in 1983, based on the rock band of the same name.',
    price: 17,
    id: 106,
  },
  {
    imagePath: 'https://im.ziffdavisinternational.com/ign_ap/screenshot/t/top-five-nonviolent-games/top-five-nonviolent-games_g11k.jpg',
    title: 'Vessel',
    description:
      'Vessel is a physics-based steampunk puzzle-platform video game, developed by Strange Loop Games and published by indiePub.',
    price: 28,
    id: 107,
  },
  {
    imagePath: 'https://en.wikipedia.org/wiki/The_Messenger_(2018_video_game)#/media/File:MessengerHeader.png',
    title: 'The Messenger',
    description:
      'The Messenger is an action-platform video game developed by Canadian indie team Sabotage Studio and published by Devolver Digital.',
    price: 19,
    id: 108,
  },
  {
    imagePath: 'https://gameranx.com/wp-content/uploads/2018/02/the-surge-2-700x395.jpg',
    title: 'Surge 2',
    description:
      'A science fiction action RPG inspired by the Souls series, set in a futuristic world where resources have been depleted by environmental collapse.',
    price: 55,
    id: 109,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to ${MONGO_URI}`);

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log(`Seeded ${products.length} products.`);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
