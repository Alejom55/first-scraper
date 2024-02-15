const puppeteer = require("puppeteer");
const cheerio = require('cheerio');

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
        const $ = cheerio.load(tableHtml);

        // Seleccionar todas las filas (etiqueta 'tr')
        const filas = $('tr');
        
        // Objeto para almacenar los datos útiles
        const datosUtiles = {};
        
        // Iterar sobre las filas
        filas.each((index, fila) => {
          // Obtener todas las celdas de la fila (etiqueta 'td')
          const celdas = $(fila).find('td');
        
          // Verificar si la fila contiene datos útiles
          const contieneDatos = celdas.toArray().some(celda => $(celda).text().trim() !== '');
        
          if (contieneDatos) {
            // Si alguna celda contiene texto, consideramos la fila como útil
            const datosFila = celdas.map((index, celda) => $(celda).text().trim()).get();
            const idMateria = datosFila[0]; // Supongamos que el ID de la materia está en la primera celda
        
            // Obtener los horarios separados por día
            const horarios = {
              Monday: datosFila[4] || "",
              Tuesday: datosFila[5] || "",
              Wednesday: datosFila[6] || "",
              Thursday: datosFila[7] || "",
              Friday: datosFila[8] || "",
              Saturday: datosFila[9] || "",
              Sunday: datosFila[10] || ""
            };
        
            // Verificar si el ID de materia ya existe en datosUtiles
            if (!datosUtiles[idMateria]) {
              datosUtiles[idMateria] = {
                Asignatura: datosFila[1],
                Grupo: datosFila[2],
                Modalidad: datosFila[3],
                Horarios: horarios
              };
            } else {
              // Si ya existe, solo agregar los nuevos horarios
              Object.assign(datosUtiles[idMateria].Horarios, horarios);
            }
          }
        });
        
        // Imprimir los datos útiles como JSON
        console.log(datosUtiles);
        // console.log("Table HTML:", tableHtml);
      } else {
        console.log("Table not found.");
      }
    } else {
      console.log("Table handle not found.");
    }
  }, 3000);



};
authenticate();
