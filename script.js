document.addEventListener("DOMContentLoaded", function () {
  const apiUrlBase =
    "https://api.bitget.com/api/mix/v1/market/ticker?symbol=";
  let previousPrices = {
    BTC: null,
    ETH: null,
    BNB: null,
    BGB: null,
  };

  // 更新日期和时间
  function updateDateTime() {
    try {
      const now = new Date();
      const dateString = now.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const timeString = now.toLocaleTimeString("zh-CN", {
        hour12: false,
      });

      const dateElement = document.getElementById("current-date");
      const timeElement = document.getElementById("current-time");

      if (dateElement) dateElement.textContent = dateString;
      if (timeElement) timeElement.textContent = timeString;
    } catch (error) {
      console.error("Error updating date/time:", error);
    }
  }

  // 每秒更新一次时间
  setInterval(updateDateTime, 1000); // 改为1000毫秒(1秒)
  updateDateTime(); // 初始化显示

  async function fetchPrice(symbol) {
    try {
      const response = await fetch(`${apiUrlBase}${symbol}USDT_UMCBL`);
      const data = await response.json();
      return parseFloat(data.data.last);
    } catch (error) {
      console.error("Error fetching price:", error);
      return null;
    }
  }

  function getPriceClass(symbol, currentPrice) {
    const previousPrice = previousPrices[symbol];
    if (previousPrice === null) return "";
    if (currentPrice > previousPrice) return "positive";
    if (currentPrice < previousPrice) return "negative";
    return "";
  }

  async function updatePrices() {
    try {
      // 使用Promise.all并行请求所有价格
      const [
        btcPrice,
        ethPrice,
        bnbPrice,
        BGBPrice,
      ] = await Promise.all([
        fetchPrice("BTC"),
        fetchPrice("ETH"),
        fetchPrice("BNB"),
        fetchPrice("BGB"),
      ]);

      // 单独处理每个价格，即使某个请求失败也不影响其他
      const coins = [
        {
          id: "btc",
          symbol: "BTC",
          price: btcPrice !== null ? Math.floor(btcPrice) : "Error",
        },
        {
          id: "eth",
          symbol: "ETH",
          price: ethPrice !== null ? Math.floor(ethPrice) : "Error",
        },
        {
          id: "bnb",
          symbol: "BNB",
          price: bnbPrice !== null ? bnbPrice.toFixed(2): "Error",
        },
        {
          id: "BGB",
          symbol: "BGB",
          price: BGBPrice !== null ? BGBPrice.toFixed(3) : "Error",
        }
      ];

      coins.forEach(({ id, symbol, price }) => {
        const priceElement = document.getElementById(`${id}-price`);
        priceElement.textContent = price;

        // 只有价格有效时才更新样式
        if (price !== "Error") {
          const priceClass = getPriceClass(symbol, price);
          priceElement.className = ""; // 清除所有类
          if (priceClass) priceElement.classList.add(priceClass);
        }
      });

      // 更新标题
      if (btcPrice !== null && ethPrice !== null && BGBPrice !== null && bnbPrice !== null) {
        document.title = `${Math.floor(btcPrice)} ${Math.floor(ethPrice)} ${BGBPrice.toFixed(3)} ${bnbPrice.toFixed(2)}`;
      }

      // 保存当前价格用于比较
      previousPrices = {
        BTC: btcPrice !== null ? btcPrice : previousPrices.BTC,
        ETH: ethPrice !== null ? ethPrice : previousPrices.ETH,
        BNB: bnbPrice !== null ? bnbPrice : previousPrices.BNB,
        BGB: BGBPrice !== null ? BGBPrice : previousPrices.BGB,
      };
    } catch (error) {
      console.error("Error updating prices:", error);
    } finally {
      // 无论成功失败都继续轮询
      setTimeout(updatePrices, 1000);
    }
  }

  updatePrices();

  // Big mode button functionality
  const bigModeButton = document.getElementById('big-mode-button');
  if (bigModeButton) {
    bigModeButton.addEventListener('click', function() {
      document.body.classList.toggle('big-mode');
    });
  }
}); 