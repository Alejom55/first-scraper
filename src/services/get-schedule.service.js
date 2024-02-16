import cheerio from "cheerio";
import puppeteer from "puppeteer";

const authenticate = async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)

  if (username == undefined || password == undefined)
    res.status(400).json({ message: "Username and password are required." });

  const tiempoInicio = new Date();

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-gpu", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  // const username = "1001370617";
  // const password = "1001370617";

  await page.goto(
    "https://app.udem.edu.co//ConsultasServAcadem/cargarPaginaLogin.do"
  );

  await page.waitForSelector('input[name="login"]');
  await page.waitForSelector("[type=password]");
  await page.waitForSelector('form[name="loginForm"]');
  await page.type('input[name="login"]', username);
  await page.type("[type=password]", password);
  await page.evaluate(() =>
    document.querySelector('form[name="loginForm"]').submit()
  );

  await page.waitForNavigation();

  await page.goto(
    "https://app.udem.edu.co/ConsultasServAcadem/asignaturasMat/cargarPaginaConsultar.do"
  );

  const parametrosLinkConsultarAsigMat = await page.evaluate(() => {
    const link = document.querySelector(
      'a[href^="JavaScript:consultarAsigMat("]'
    );
    const regex =
      /consultarAsigMat\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\);/;
    const [, ...params] = link.href.match(regex);
    return params;
  });

  await page.evaluate((params) => {
    const carnet = params[0];
    const periodo = params[1];
    const nombre = params[2];
    const programa = params[3];
    const nombreProg = params[4];
    const fechaIni = params[5];
    const fechaFin = params[6];
    const estadoAcad = params[7];
    const nivelEstud = params[8];
    const tipoProg = params[9];
    const pensum = params[10];
    consultarAsigMat(
      carnet,
      periodo,
      nombre,
      programa,
      nombreProg,
      fechaIni,
      fechaFin,
      estadoAcad,
      nivelEstud,
      tipoProg,
      pensum
    );
  }, parametrosLinkConsultarAsigMat);

  await page.waitForNavigation();

  const parametrosLinkConsultarHorPre = await page.evaluate(() => {
    const link = document.querySelector(
      'a[href^="JavaScript:consultarHorPre("]'
    );
    const regex = /consultarHorPre\(\s*'([^']+)',\s*'([^']+)'\s*\);/;
    const [, ...params] = link.href.match(regex);
    return params;
  });
  await page.evaluate((params) => {
    const carnet = params[0];
    const periodoCon = params[1];
    consultarHorPre(carnet, periodoCon);
  }, parametrosLinkConsultarHorPre);

  await page.waitForNavigation();

  const tableHandle = await page.$(".bordeTabla");
  if (tableHandle) {
    const tableHtml = await page.evaluate((table) => {
      return table ? table.outerHTML : null;
    }, tableHandle);

    if (tableHtml) {
      const $ = cheerio.load(tableHtml);

      const filas = $("tr");

      const datosUtiles = {};

      filas.each((index, fila) => {
        const celdas = $(fila).find("td");

        const contieneDatos = celdas
          .toArray()
          .some((celda) => $(celda).text().trim() !== "");

        if (contieneDatos) {
          const datosFila = celdas
            .map((index, celda) => $(celda).text().trim())
            .get();
          const idMateria = datosFila[0];

          const horarios = {
            Monday: datosFila[4] || "",
            Tuesday: datosFila[5] || "",
            Wednesday: datosFila[6] || "",
            Thursday: datosFila[7] || "",
            Friday: datosFila[8] || "",
            Saturday: datosFila[9] || "",
            Sunday: datosFila[10] || "",
          };

          if (!datosUtiles[idMateria]) {
            datosUtiles[idMateria] = {
              Asignatura: datosFila[1],
              Grupo: datosFila[2],
              Modalidad: datosFila[3],
              Horarios: horarios,
            };
          } else {
            Object.assign(datosUtiles[idMateria].Horarios, horarios);
          }
        }
      });

      console.log(datosUtiles);
      res.status(200).json(datosUtiles);
    } else {
      console.log("Table not found.");
    }
  } else {
    console.log("Table handle not found.");
  }

  await browser.close();
  const tiempoFin = new Date();

  const tiempoTranscurrido = tiempoFin - tiempoInicio;
  console.log(`El tiempo transcurrido es: ${tiempoTranscurrido} milisegundos`);
};

// authenticate();
export default authenticate;
