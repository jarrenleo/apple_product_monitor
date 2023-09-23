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
      const modelColours = body.PickupMessage.stores[0].partsAvailability;

      for (const modelColour in modelColours) {
        if (modelColour === this.productId) await this.sendMessage();
      }
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
        content: "<@276649462166978560> Wake up, iPhone restocked!",
      }),
    });
  }

  startMonitor() {
    setInterval(() => this.checkStock(), 300000);
  }
}

new AppleProduct("MTUX3ZP/A");
