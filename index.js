import { config } from "dotenv";
config();

class AppleProduct {
  constructor(productId) {
    this.productId = productId;
    this.startMonitor();
  }

  async checkStock() {
    try {
      const response = await fetch(
        `https://www.apple.com/sg/shop/pickup-message-recommendations?mts.0=regular&location=${process.env.ZIPCODE}&product=${this.productId}`
      );
      if (!response.ok) throw Error("Stock check failed");

      const { body } = await response.json();
      const modelIds = body.PickupMessage.stores[0].partsAvailability;

      if (modelIds.hasOwnProperty(this.productId)) this.sendMessage();
    } catch (e) {
      console.log(e.message);
    }
  }

  async sendMessage() {
    await fetch(process.env.DiSCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "<@276649462166978560> iPhone 15 Pro restocked!",
      }),
    });
  }

  startMonitor() {
    setInterval(() => this.checkStock(), 60000);
  }
}

new AppleProduct("MTUX3ZP/A");
