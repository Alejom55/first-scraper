const puppeteer = require("puppeteer");

const authenticate = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-gpu", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const username = "1001370617";
  const password = "1001370617";

  await page.goto(
    "https://app.udem.edu.co//ConsultasServAcadem/cargarPaginaLogin.do"
  );

  const inputElement = await page.$('input[name="login"]');
  const keyElement = await page.$("[type=password]");
  const form = await page.$('form[name="loginForm"]');

  await inputElement.type(username);
  await keyElement.type(password);

  await form.evaluate((form) => form.submit());

  setTimeout(() => {
    page.goto(
      "https://app.udem.edu.co/ConsultasServAcadem/asignaturasMat/cargarPaginaConsultar.do"
    );
  }, 500);

  setTimeout(async () => {
    const links = await page.$$("a");
    const indexToClick = 16;

    if (indexToClick >= 0 && indexToClick < links.length) {
      await links[indexToClick].click();
      console.log(`Clicked on link at index ${indexToClick}`);
    } else {
      console.log(`Invalid index: ${indexToClick}`);
    }
  }, 1000);

  setTimeout(async () => {
    const links = await page.$$("a");

    const indexToClick = 16;

    if (indexToClick >= 0 && indexToClick < links.length) {
      await links[indexToClick].click();
      console.log(`Clicked on link at index ${indexToClick}`);
    } else {
      console.log(`Invalid index: ${indexToClick}`);
    }
  }, 2000);

  setTimeout(async () => {
    const tableHandle = await page.$('.bordeTabla');
    if (tableHandle) {
      const tableHtml = await page.evaluate((table) => {
        return table ? table.outerHTML : null;
      }, tableHandle);
  
      if (tableHtml) {
        console.log("Table HTML:", tableHtml);
      } else {
        console.log("Table not found.");
      }
    } else {
      console.log("Table handle not found.");
    }
  }, 3000);
};
authenticate();
