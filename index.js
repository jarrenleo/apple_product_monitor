import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";
config();

class AppleProduct {
  constructor(productId, zipcode) {
    this.storeAvailability = new Set();
    this.productId = productId;
    this.zipcode = zipcode;
    this.bot = new TelegramBot(process.env.TELEGRAM_API_KEY, {
      polling: false,
    });
    this.startMonitor();
  }

  async checkStock() {
    try {
      const response = await fetch(
        `https://www.apple.com/sg/shop/fulfillment-messages?pl=true&mts.0=regular&mts.1=compact&parts.0=${this.productId}&location=${this.zipcode}`
      );
      if (!response.ok) throw Error("Stock check failed");

      const { body } = await response.json();
      const stores = body.content.pickupMessage.stores;

      for (const store of stores) {
        const storeName = store.storeName;
        const modelAvailabiltity = store.partsAvailability[this.productId];

        if (modelAvailabiltity.pickupDisplay === "unavailable") {
          if (!this.storeAvailability.has(storeName)) continue;
          this.storeAvailability.delete(storeName);
        }

        if (modelAvailabiltity.pickupDisplay === "available")
          if (!this.storeAvailability.has(storeName)) {
            this.sendNotification(
              modelAvailabiltity.messageTypes.regular.storePickupProductTitle,
              storeName
            );
            this.storeAvailability.add(storeName);
          }
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  async sendNotification(productTitle, location) {
    this.bot.sendMessage(
      process.env.TELEGRAM_GROUP_CHAT_ID,
      `${productTitle} is available at ${location}!`
    );
  }

  startMonitor() {
    setInterval(() => this.checkStock(), 60000);
  }
}

new AppleProduct("MTUW3ZP/A", process.env.ZIPCODE);
