const puppeteer = require("puppeteer")
// import readline from "readline-sync";
// import chalk from "chalk";
const {
  success,
} = require("../base/response.base");

exports.getProducts = async (_, res) => {
  const data = await getData();
  res.status(200).json(success("Success", data, "200"))
}

const getData = async () => {
  const browser = await puppeteer.launch({
    headless: true, // Ubah menjadi true untuk server tanpa GUI
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",          // Mengurangi penggunaan memori shared
        "--single-process",                 // Mode single-process untuk stabilitas di VPS
        "--disable-gpu",                    // Nonaktifkan GPU jika tidak dibutuhkan
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
        "--no-zygote",                      // Nonaktifkan proses zygote yang kadang bermasalah di VPS
        "--disable-extensions"              // Nonaktifkan ekstensi untuk mempercepat proses
    ],
  });
  await sleep(500);
  const page = await browser.newPage();
  await sleep(500);
  await page.goto("https://www.midasbuy.com/midasbuy/om/buy/whiteoutsurvival", {
    timeout: 0,
  });
  console.log("Navigated to the website.", "success");
  await sleep(500);
  page.on("response", async (response) => {});
  await sleep(500);

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
  const products = []
  for (let index = 0; index < extractedData.length; index++) {
    const product = {
      id: index,
      price: `${extractedData[index].price}`,
      diamond: `${extractedData[index].diamond} Diamond`
    }
    products.push(product)
  }
  await browser.close();
  return products;
}

exports.getPayment = async (req, res) => {
  const data = await getPayment(req)
  res.status(200).json(success("Success", data, "200"))
}

const getPayment = async (req) => {
  // const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  // const strauth = Buffer.from(b64auth, 'base64').toString()
  // const splitIndex = strauth.indexOf(':')
  // const email = strauth.substring(0, splitIndex)
  // const password = strauth.substring(splitIndex + 1)
  const email = req.body.emailLogin
  const password = req.body.passwordLogin
  const id = '297253814'
  const loop = 1

  const browser = await puppeteer.launch({
    headless: true, // Ubah menjadi true untuk server tanpa GUI
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",          // Mengurangi penggunaan memori shared
        "--single-process",                 // Mode single-process untuk stabilitas di VPS
        "--disable-gpu",                    // Nonaktifkan GPU jika tidak dibutuhkan
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
        "--no-zygote",                      // Nonaktifkan proses zygote yang kadang bermasalah di VPS
        "--disable-extensions"              // Nonaktifkan ekstensi untuk mempercepat proses
    ],
  });
  await sleep(500)
  const page = await browser.newPage();
  await sleep(500)
  await page.goto("https://www.midasbuy.com/midasbuy/om/buy/whiteoutsurvival", {
    timeout: 0,
  });
  await sleep(500)
  console.log("Navigated to the website.", "success");
  page.on("response", async (response) => {});
  await sleep(500)
  // Menangkap log dari console di halaman
  page.on("console", (msg) => {});
  await sleep(500)
  await page.waitForSelector(
    "#root > div > div.container_wrap > div:nth-child(2) > div > div > div.flex_module > div.box_wrap > div > div"
  );
  await sleep(500)
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
  const pilihan = 2;
  try {
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
      timeout: 5000,
    });
    const elementHandle = await page.$("#login-iframe");
    const frame = await elementHandle.contentFrame();

    // Masukkan email
    await clickWithRetry(
      frame,
      "#login-sdk-app > div.pop-mode-box > div > div.mess > div > div.item > div > div > div > div.input-box > p > input[type=email]",
      "email input"
    );
    await frame.type(
      "#login-sdk-app > div.pop-mode-box > div > div.mess > div > div.item > div > div > div > div.input-box > p > input[type=email]",
      email,
      { sleep: 100 }
    );
    log("Email typed successfully.", "success");
    await sleep(1000);

    // Klik tombol lanjut
    await clickWithRetry(
      frame,
      "#login-sdk-app > div.pop-mode-box > div > div.mess > div > div.btn-wrap.btn-wraps.btn-wrap-spacing > div",
      "continue button"
    );
    await sleep(1000);

    // Masukkan password
    await clickWithRetry(
      frame,
      "#login-sdk-app > div.pop-mode-box > div > div.mess > div.form-box > div:nth-child(2) > div:nth-child(2) > div > input[type=password]",
      "password input"
    );
    await frame.type(
      "#login-sdk-app > div.pop-mode-box > div > div.mess > div.form-box > div:nth-child(2) > div:nth-child(2) > div > input[type=password]",
      password,
      { sleep: 100 }
    );
    log("Password typed successfully.", "success");
    await sleep(1000);

    // Klik tombol login
    await clickWithRetry(
      frame,
      "#login-sdk-app > div.pop-mode-box > div > div.mess > div.btn-wrap.btn-wraps > div",
      "login button"
    );

    await sleep(1000);

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
        "#root > div > div.BindLoginPop_pop_mode_box__rQwbx.BindLoginPop_m_pop__xNR-M.BindLoginPop_active__xl7ac > div.BindLoginPop_pop_mess__8gYyc > div.BindLoginPop_login_box__cCh9l > div > div.BindLoginPop_input_wrap_box__jx4ht > div > div > div.Input_input__s4ezt > input[type=text]",
        "custom ID input"
      );
      await page.keyboard.down("Control");
      await page.keyboard.press("A");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.type(
        "#root > div > div.BindLoginPop_pop_mode_box__rQwbx.BindLoginPop_m_pop__xNR-M.BindLoginPop_active__xl7ac > div.BindLoginPop_pop_mess__8gYyc > div.BindLoginPop_login_box__cCh9l > div > div.BindLoginPop_input_wrap_box__jx4ht > div > div > div.Input_input__s4ezt > input[type=text]",
        id
      );
      await clickWithRetry(
        page,
        "#root > div > div.BindLoginPop_pop_mode_box__rQwbx.BindLoginPop_m_pop__xNR-M.BindLoginPop_active__xl7ac > div.BindLoginPop_pop_mess__8gYyc > div.BindLoginPop_login_box__cCh9l > div > div.BindLoginPop_btn_wrap__eiPwz > div > div",
        "Click ID custom"
      );
      log("ID entered successfully.", "success");
      await sleep(1000);
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
      try {
        await clickWithRetry(
          page,
          "#root > div > div.container_wrap > div.ChannelListB_pop_mode_box__N5jHh.ChannelListB_l_pop__q7l41.ChannelListB_main_pop__IDQkc.ChannelListB_in__9OBKY.ChannelListB_active__gvs2K.visible > div.ChannelListB_pop_mess__c4pMc > div > div.ChannelListB_left_box__mjFxm > div.ChannelListB_list_box__4jwaa > div:nth-child(1) > div > div:nth-child(1) > div.ChannelPayList_payment_box__oDb6Q > div > div.ChannelPayList_payment_wrap__s0YPx > div.ChannelPayList_link_box__y0E7V",
          "try click use card others"
        );
        await page.waitForSelector(
          "#root > div > div.container_wrap > div.SelectingCard_pop_mode_box__hTBLF.SelectingCard_m_pop__vI88g.SelectingCard_active__kWEvm.visible > div.SelectingCard_pop_mess__Lcr2H > ul"
        );

        // Klik elemen menggunakan page.evaluate
        const list = await page.evaluate(async () => {
          let textContent = "";
          while (!textContent) {
            const element = document.querySelector(
              "#root > div > div.container_wrap > div.SelectingCard_pop_mode_box__hTBLF.SelectingCard_m_pop__vI88g.SelectingCard_active__kWEvm.visible > div.SelectingCard_pop_mess__Lcr2H > ul"
            );
            textContent = element ? element.innerText : "";
            await new Promise((resolve) => setTimeout(resolve, 100)); // Jeda 100 ms sebelum mencoba lagi
          }
          return textContent;
        });
        const datalist = list.split("\n\n");
        const payments = []
        for (let index = 0; index < datalist.length; index++) {
          const element = datalist[index];
          const payment = {
            id: index,
            cardNumber: element
          }
          payments.push(payment)
        }
        await browser.close();
        return payments;
      } catch (e) {
        console.log(e)
        await browser.close();
        return e.message;
      }
    }
  } catch(e) {
    console.log(e)
    await browser.close();
    return e.message;
  }
}

function extractDiamondAndPrice(data) {
  // Regex untuk menangkap nilai diamond dan harga sebelum Rp atau OMR
  const regex = /(\d+)\n(Rp\s*[\d.,]+|[\d.]+\s*OMR)/g;
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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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
const MAX_RETRIES = 5; // Jumlah maksimum percobaan untuk menemukan selector