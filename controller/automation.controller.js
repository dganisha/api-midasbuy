const puppeteer = require("puppeteer");
const { success } = require("../base/response.base");

function log(msg, type = "info") {
  const timestamp = new Date().toLocaleTimeString();
  switch (type) {
    case "success":
      console.log(`[${timestamp}] ➤  ${msg}`);
      break;
    case "custom":
      console.log(`[${timestamp}] ➤  ${msg}`);
      break;
    case "error":
      console.log(`[${timestamp}] ➤  ${msg}`);
      break;
    case "warning":
      console.log(`[${timestamp}] ➤  ${msg}`);
      break;
    default:
      console.log(`[${timestamp}] ➤  ${msg}`);
  }
}
const MAX_RETRIES = 5; // Jumlah maksimum percobaan untuk menemukan selector

async function clickWithRetry(page, selector, description) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await page.waitForSelector(selector, { visible: true, timeout: 5000 });
      await page.click(selector);
      log(
        `Attempting to click ${description}... (Attempt ${attempt + 1})`,
        "success"
      );
      log(`${description} clicked successfully.`, "success");
      return; // Keluar dari fungsi jika berhasil
    } catch (error) {
      log(`Failed to find ${description}`, "error");
      await sleep(1000); // Tunggu sebelum mencoba lagi
    }
  }
  log(`Failed to click ${description} after ${MAX_RETRIES} attempts.`, "error");
}

function extractDiamondAndPrice(data) {
  // Regex untuk menangkap nilai diamond dan harga sebelum Rp atau OMR
  const regex = /(\d+)\n(Rp\s*[\d.,]+|[\d.]+\s*OMR|[\d.]+\s*AED)/g;
  const result = [];
  let match;

  // Loop melalui setiap kecocokan regex
  while ((match = regex.exec(data)) !== null) {
    const diamond = match[1]; // Nilai diamond
    const price = match[2]; // Harga dengan mata uang (Rp atau OMR)

    result.push({ diamond, price });
  }

  return result;
}

exports.startAutomation = async (req, res) => {
  const id = req.body.userId;
  const loop = req.body.loop ? req.body.loop : 1;
  const email = req.body.emailLogin;
  const password = req.body.passwordLogin;
  const pilihan = req.body.productId;
  const indexToClick = req.body.paymentId;
  const indexToClick2 = req.body.paymentId2;
  const country = req.body.country;
  const reff_number = req.body.reff_number;

  let urlMidas = "https://www.midasbuy.com/midasbuy/om/buy/whiteoutsurvival"
  if(country == "OMR"){
    urlMidas = "https://www.midasbuy.com/midasbuy/om/buy/whiteoutsurvival"
  }else if(country == "AED"){
    urlMidas = "https://www.midasbuy.com/midasbuy/ae/buy/whiteoutsurvival"
  }

  if(id == 297253814 || id == "297253814"){
    res.status(500).json(success("Failed, ID input is 297253814. Change to another ID", null, "500"));
    return;
  }

  const browser = await puppeteer.launch({
    headless: true, // Ubah menjadi true untuk server tanpa GUI
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // Mengurangi penggunaan memori shared
      "--single-process", // Mode single-process untuk stabilitas di VPS
      "--disable-gpu", // Nonaktifkan GPU jika tidak dibutuhkan
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      "--no-zygote", // Nonaktifkan proses zygote yang kadang bermasalah di VPS
      "--disable-extensions", // Nonaktifkan ekstensi untuk mempercepat proses
    ],
  });

  const page = await browser.newPage();
  await page.goto(urlMidas, {
    timeout: 0,
  });
  log("Navigated to the website.", "success");
  page.on("response", async (response) => {});

  // Menangkap log dari console di halaman
  page.on("console", (msg) => {});
  await page.waitForSelector(
    "#root > div > div.container_wrap > div:nth-child(2) > div > div > div.flex_module > div.box_wrap > div > div"
  );
  const data = await page.evaluate(async () => {
    let textContent = "";
    while (!textContent) {
      const element = document.querySelector(
        "#root > div > div.container_wrap > div:nth-child(2) > div > div > div.flex_module > div.box_wrap > div > div"
      );
      textContent = element ? element.innerText : "";
      await new Promise((resolve) => setTimeout(resolve, 100)); // Jeda 100 ms sebelum mencoba lagi
    }
    return textContent;
  });

  const extractedData = extractDiamondAndPrice(data.replaceAll("\n\n", "\n"));
  for (let index = 0; index < extractedData.length; index++) {
    console.log(
      `[${index}] => ${extractedData[index].price} [Diamond ${extractedData[index].diamond}]`
    );
  }
  try {
    log("PROCESS TO TRY");
    await page.screenshot({ path: '/var/www/html/api-midasbuy/screenshots/check-first-page.png' });
    
    const closeButtonSelector = '.PatFacePopWrapper_close-btn__erWAb';
    const isPopupPromo = await page.$(closeButtonSelector);
    if (isPopupPromo) {
      // Klik tombol jika elemen ditemukan
      await page.click(closeButtonSelector);
      console.log(`[${new Date().toLocaleTimeString()}] ➤ Popup Promo closed successfully.`);
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] ➤ No Popup Promo found.`);
    }

    await page.screenshot({ path: '/var/www/html/api-midasbuy/screenshots/after-popup-promo.png' });
    // Klik pertama
    await clickWithRetry(
      page,
      "#root > div > div.PopCookie_pop_mode_box__WhyPT.PopCookie_c_pop__4PD8p.undefined.PopCookie_active__UWi7E > div.PopCookie_btn_wrap_block__26ldQ > div:nth-child(1) > div > div > div > div",
      "enable cookie"
    );

    // Klik banner
    await clickWithRetry(
      page,
      "#root > div > div.Banner_banner_wrap__vQSMq > div.Banner_x_main__EmLds > div > div.Banner_area_wrap__UCAMc > div.Banner_user_tab_box__Bp6NY > div > div > div",
      "try to login page"
    );
    await sleep(1000);
    log("Waiting for login iframe...", "success");
    await page.waitForSelector("#login-iframe", {
      visible: true,
      timeout: 15000,
    });
    const elementHandle = await page.$("#login-iframe");
    const frame = await elementHandle.contentFrame();

    // Masukkan email
    await clickWithRetry(
      frame,
      "div.input-box > p > input[type=email]",
      "email input"
    );
    await frame.type(
      "div.input-box > p > input[type=email]",
      email,
      { sleep: 100 }
    );
    log("Email typed successfully.", "success");
    await sleep(1000);

    // Klik tombol lanjut
    await clickWithRetry(
      frame,
      "div.btn-wrap.btn-wraps.btn-wrap-spacing > div",
      "continue button"
    );
    await sleep(1000);

    // Masukkan password
    await clickWithRetry(
      frame,
      "div:nth-child(2) > div:nth-child(2) > div > input[type=password]",
      "password input"
    );
    await frame.type(
      "div:nth-child(2) > div:nth-child(2) > div > input[type=password]",
      password,
      { sleep: 100 }
    );
    log("Password typed successfully.", "success");
    await sleep(1000);

    // Klik tombol login
    await clickWithRetry(
      frame,
      "div.btn-wrap.btn-wraps > div",
      "login button"
    );

    await sleep(1000);
    isPassKey = await frame.waitForSelector('.pop-mode-box', { timeout: 5000 });
      if (isPassKey) {
          const success = await frame.evaluate(() => {
              const popModeBox = document.querySelector('.pop-mode-box');
              const closeButton = popModeBox?.style.display === 'block' && popModeBox.querySelector('.close-btn');
              if (closeButton) {
                  closeButton.click();
                  return true;
              }
              return false;
          });
          if (success) console.log(`[${new Date().toLocaleTimeString()}] ➤  Passkey popup closed successfully.`);
      }

    sleep(2000);
    log('Check Again Passkey Popup is has closed or not');
    isPassKey2 = await frame.waitForSelector('.passkey-mode', { timeout: 5000 });
    if(isPassKey2){
      const success = await frame.evaluate(() => {
          const popModeBox = document.querySelector('.passkey-mode');
          const closeButton = popModeBox?.style.display === 'block' && popModeBox.querySelector('.close-btn');
          if (closeButton) {
            closeButton.click();
            return true;
          }
          return false;
      });
      if(success){
        log('Passkey popup (2x) closed successfully');
      }
    }else{
      log('Passkey popup is already closed before');
    }

    await page.screenshot({ path: '/var/www/html/api-midasbuy/screenshots/check-cookie.png' });
    // Proses pilihan berdasarkan ID
    if (id.toLowerCase() === "t") {
      await clickWithRetry(
        page,
        "#root > div > div.BindLoginPop_pop_mode_box__rQwbx.BindLoginPop_m_pop__xNR-M.BindLoginPop_active__xl7ac > div.PopTitle_2_pop_title__CzNzt.PopTitle_2_no_border__PDiPd.PopTitle_2_m_pop__o4rT- > div > i",
        "close popup for ID 't'"
      );
    } else {
      await clickWithRetry(
        page,
        "#root > div > div.BindLoginPop_pop_mode_box__rQwbx > div.BindLoginPop_pop_mess__8gYyc > div.BindLoginPop_login_box__cCh9l > div.BindLoginPop_login_channel_box__n1AuR > div.SelectServerBox_SelectServerBox_wrap__r5LGW > div > div > input[type=text]",
        "custom ID input"
      );
      await page.keyboard.down("Control");
      await page.keyboard.press("A");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.type(
        "#root > div > div.BindLoginPop_pop_mode_box__rQwbx > div.BindLoginPop_pop_mess__8gYyc > div.BindLoginPop_login_box__cCh9l > div.BindLoginPop_login_channel_box__n1AuR > div.SelectServerBox_SelectServerBox_wrap__r5LGW > div > div > input[type=text]",
        id
      );
      await clickWithRetry(
        page,
        "#root > div > div.BindLoginPop_pop_mode_box__rQwbx > div.BindLoginPop_pop_mess__8gYyc > div.BindLoginPop_login_box__cCh9l > div.BindLoginPop_btn_wrap__eiPwz > div.Button_btn_wrap__utZqk > div.Button_btn__P0ibl > div> div",
        "Click ID custom"
      );
      log("ID entered is : " + id + "(orderid " + reff_number + ")", "success");
      log("ID entered successfully.", "success");
      await sleep(1000);

      const checkErrorID = '.Input_error_text__Pd7xh';
      const isErrorID = await page.$(checkErrorID);
      if (isErrorID) {
        log('ID is invalid. Please check the ID');
        // console.log(`[${new Date().toLocaleTimeString()}] ➤ Popup Promo closed successfully.`);
        res.status(500).json(success("ID is invalid. Please check the ID.", null, "500"));
        return;
      }
    }

    for (let index = 0; index < loop; index++) {
      // Klik tombol submit terakhir
      await sleep(1000);
      await page.waitForSelector(
        `#root > div > div.container_wrap > div:nth-child(2) > div > div > div.flex_module > div.box_wrap > div > div > div:nth-child(${
          parseInt(pilihan) + 1
        })`
      );
      await page.click(
        `#root > div > div.container_wrap > div:nth-child(2) > div > div > div.flex_module > div.box_wrap > div > div > div:nth-child(${
          parseInt(pilihan) + 1
        })`
      );
      await sleep(1000);

      await page.waitForSelector('div.ChannelUserBox_sub_text__UR2zE', {
        visible: true,
        timeout: 60000,
      });

      // Ambil teks dari elemen
      const userIdInputed = await page.$eval('div.ChannelUserBox_sub_text__UR2zE', (element) => {
        // Bersihkan teks jika perlu
        return element.textContent.trim().replace(/["()]/g, '');
      });
      log("Orderid " + reff_number + " Entered ID is " + id + " | set value bot : " + userIdInputed);
      if(userIdInputed == 297253814 || userIdInputed == "297253814"){
        res.status(500).json(success("ID is not valid (297253814), please try to order again.", null, "500"));
        return;
      }else if(userIdInputed != id){
        res.status(500).json(success("ID not valid (request : " + id + " | inputed : " + userIdInputed +")", null, "500"));
        return;
      }

      try {
        await page.screenshot({ path: '/var/www/html/api-midasbuy/screenshots/after-click-use-card-others.png' });
        await clickWithRetry(
          page,
          "#root > div > div.container_wrap > div.ChannelListB_pop_mode_box__N5jHh.ChannelListB_l_pop__q7l41.ChannelListB_main_pop__IDQkc.ChannelListB_in__9OBKY.ChannelListB_active__gvs2K.visible > div.ChannelListB_pop_mess__c4pMc > div > div.ChannelListB_left_box__mjFxm > div.ChannelListB_list_box__4jwaa > div:nth-child(1) > div > div:nth-child(1) > div.ChannelPayList_payment_box__oDb6Q > div > div.ChannelPayList_payment_wrap__s0YPx > div.ChannelPayList_link_box__y0E7V",
          "try click use card others"
        );
        await page.waitForSelector(
          ".SelectingCard_pop_mess__Lcr2H > ul"
        );

        // Klik elemen menggunakan page.evaluate
        const list = await page.evaluate(async () => {
          let textContent = "";
          while (!textContent) {
            const element = document.querySelector(
              ".SelectingCard_pop_mess__Lcr2H > ul"
            );
            textContent = element ? element.innerText : "";
            await new Promise((resolve) => setTimeout(resolve, 100)); // Jeda 100 ms sebelum mencoba lagi
          }
          return textContent;
        });
        const datalist = list.split("\n\n");
        for (let index = 0; index < datalist.length; index++) {
          const element = datalist[index];
          log(`[${index}] ${element}`, "success");
        }
        await page.waitForSelector(
          ".SelectingCard_pop_mess__Lcr2H > ul > li"
        );

        // Ambil elemen-elemen <li> dan klik elemen pada indeks yang diinginkan
        const listItems = await page.$$(
          ".SelectingCard_pop_mess__Lcr2H > ul > li"
        );

        if (listItems[indexToClick]) {
          await listItems[indexToClick].click();
          log(`Clicked element at index ${indexToClick}`, "success");
        } else {
          console.error("Elemen dengan indeks tersebut tidak ditemukan");
        }
      } catch (error) {
        log(error.toString(), "error");
      }
      await page.waitForSelector('div[data-channel-id="CREDIT_CARD"]', {
        visible: true,
        timeout: 60000,
      });
      await page.click('div[data-channel-id="CREDIT_CARD"]');
      await sleep(1000);
      await page.waitForSelector(
        'div.Button_btn__P0ibl.Button_btn_primary__1ncdM[data-pay-button="true"]',
        { visible: true, timeout: 60000 }
      );

      // Klik elemen menggunakan page.evaluate
      await page.evaluate(() => {
        const button = document.querySelector(
          'div.Button_btn__P0ibl.Button_btn_primary__1ncdM[data-pay-button="true"]'
        );
        if (button) {
          button.click();
        }
      });
      await sleep(1000);
      await page.waitForSelector(
        "#root > div > div.container_wrap > div.OrderInfo_pop_mode_box__P-hF9.OrderInfo_m_pop__8j8Hz.OrderInfo_m_pop__8j8Hz.OrderInfo_active__ihp1K.visible > div.OrderInfo_pop_mess__cYRTn > div:nth-child(5) > div > div > div > div > div",
        { visible: true, timeout: 60000 }
      );

      // Klik elemen menggunakan page.evaluate
      await page.evaluate(() => {
        const button = document.querySelector(
          "#root > div > div.container_wrap > div.OrderInfo_pop_mode_box__P-hF9.OrderInfo_m_pop__8j8Hz.OrderInfo_m_pop__8j8Hz.OrderInfo_active__ihp1K.visible > div.OrderInfo_pop_mess__cYRTn > div:nth-child(5) > div > div > div > div > div"
        );
        if (button) {
          button.click();
        }
      });
      await sleep(1000);
      try {
        await page.waitForSelector("div.Button_btn_wrap__utZqk", {
          visible: true,
          timeout: 100000,
        });
      } catch (error) {
        log("Error Timeout choose payment", "error");
        res.status(500).json(success("Error timeout when choose payment", error, "500"));
        return;
      }

      // await page.screenshot({ path: '/var/www/html/api-midasbuy/screenshots/before-click.png' });
      // Klik elemen menggunakan page.evaluate
      await page.evaluate(() => {
        const button = document.querySelector("div.Button_btn_wrap__utZqk");
        if (button) {
          button.click();
        }
      });
      // await page.screenshot({ path: '/var/www/html/api-midasbuy/screenshots/after-click.png' });
      try {
        await page.waitForSelector(
          "#root > div > div.PaymentResult_container_wrap__ddHmB > div > div.PurchaseContainer_title_box__kWFnk > div > div",
          { visible: true, timeout: 600000 }
        );
        // await page.screenshot({ path: '/var/www/html/api-midasbuy/screenshots/after-wait-for-selector.png' }); // Screenshot jika elemen ditemukan
      } catch (error) {
        // console.error('Element not found or timeout exceeded:', error);
        log("Error Timeout", "error");
        res.status(500).json(success("Error Order timeout exceeded", error, "500"));
        return;
        // await page.screenshot({ path: '/var/www/html/api-midasbuy/screenshots/error-debug.png' }); // Screenshot jika ada error
      }

      // Klik elemen menggunakan page.evaluate
      const finalPayment = await page.evaluate(async () => {
        let textContent = "";
        while (!textContent) {
          const element = document.querySelector(
            "#root > div > div.PaymentResult_container_wrap__ddHmB > div > div.PurchaseContainer_title_box__kWFnk > div > div"
          );
          textContent = element ? element.innerText : "";
          await new Promise((resolve) => setTimeout(resolve, 100)); // Jeda 100 ms sebelum mencoba lagi
        }
        return textContent;
      });
      log(finalPayment, "success");
      log("Process completed successfully.", "success");
      log("Orderid " + reff_number + " is success order", "success");
      await page.goto(
        urlMidas,
        {
          timeout: 0,
        }
      );
      // res.status(200).json(success("Success", null, "200"));
      const responseData = { reff_number: reff_number };
      res.status(200).json(success("Success", responseData, "200"));
    }
  } catch (error) {
    log("An error occurred:" + error, "error");
    if (error.message.includes("No element found")) {
      res
        .status(500)
        .json(success("Saldo tidak mencukupi", error.message, "500"));
      return;
    } else {
      res.status(500).json(success("Error", error.message, "500"));
      return;
    }
  }finally {
    if (browser.isConnected()) {
      console.log("Menutup browser...");
      await browser.close();
      console.log("Browser berhasil ditutup.");
    } else {
      console.log("Browser sudah tertutup sebelumnya.");
    }
  }
  // await browser.close();
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
