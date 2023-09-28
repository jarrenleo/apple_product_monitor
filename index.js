import { config } from "dotenv";
config();

class AppleProduct {
  constructor(productId, zipcode) {
    this.productId = productId;
    this.zipcode = zipcode;

    this.startMonitor();
  }

  async checkStock() {
    try {
      const response = await fetch(
        `https://www.apple.com/sg/shop/fulfillment-messages?pl=true&mts.0=regular&mts.1=compact&parts.0=${this.productId}&location=${this.zipcode}`
      );
      if (!response.ok) throw Error("Stock check failed");

      const { body } = await response.json();
      const modelAvailabiltity =
        body.content.pickupMessage.stores[0].partsAvailability[this.productId];

      if (modelAvailabiltity.pickupDisplay === "available")
        this.sendMessage(
          modelAvailabiltity.messageTypes.regular.storePickupProductTitle
        );
    } catch (e) {
      console.log(e.message);
    }
  }

  async sendMessage(productTitle) {
    await fetch(process.env.DiSCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `<@276649462166978560> ${productTitle} restocked!`,
      }),
    });
  }

  startMonitor() {
    setInterval(() => this.checkStock(), 60000);
  }
}

new AppleProduct("MTUX3ZP/A", process.env.ZIPCODE);
