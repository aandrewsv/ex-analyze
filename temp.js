const API_ENDPOINT = "https://api.disneyapi.dev/characters";

// Selectors
const buttonSelector = document.querySelector("#button");
const ouputSelector = document.querySelector("#output");
const errorContainerSelector = document.querySelector("#error-container");
const loaderSelector = document.querySelector("#loader");
const buttonCtaSelector = document.querySelector("#cta");

// Funciones para estilos
const setLoaderState = (value) => {
  loaderSelector.style.display = `${value ? "block" : "none"}`;
};

const setButtonCta = (error) => {
  const buttonCta = error ? "Try again" : "Get data again";
  buttonCtaSelector.innerHTML = buttonCta;
};

const setButtonDisableState = (value) => {
  if (value) {
    buttonSelector.setAttribute("disabled", "disabled");
  } else {
    setTimeout(() => {
      buttonSelector.removeAttribute("disabled");
    }, 1500);
  }
  const buttonCtaState = value ? "none" : "block";
  buttonCtaSelector.style.display = buttonCtaState;
};

const getAllDataFromResponses = (data) =>
  data.map((response) => response.data.data);

// Funcion que determina las ocurrencias; se transforma el nombre
// a minúsculas y se utilizan expresiones regulares para determinar
// la cantidad de ocurrencias al mismo tiempo que se suman a la variable
// que las almacena
const getOcurrences = (princessOcurrences, name, vocalOcurrences) => {
  princessOcurrences += (name.toLowerCase().match(/princess/g) || []).length;
  vocalOcurrences += (name.toLowerCase().match(/a/g) || []).length;
  vocalOcurrences += (name.toLowerCase().match(/e/g) || []).length;
  vocalOcurrences += (name.toLowerCase().match(/i/g) || []).length;
  vocalOcurrences += (name.toLowerCase().match(/o/g) || []).length;
  vocalOcurrences += (name.toLowerCase().match(/u/g) || []).length;
  return { princessOcurrences, vocalOcurrences };
};

const fetchMetaData = async () => {
  let allData;
  let output = [
    {
      time: 0,
      data: [
        {
          value: "princess",
        },
        {
          value: "a, e, i, o, u",
        },
      ],
    },
  ];
  const start = Date.now();
  let princessOcurrences = 0;
  let vocalOcurrences = 0;

  try {
    setLoaderState(true);
    setButtonDisableState(true);
    setButtonCta(false);

    // Hace una primera llamada para checkear el total de páginas
    let firstResponse = await axios.get("https://api.disneyapi.dev/characters");
    const firstResponseData = firstResponse.data;
    const totalPages = firstResponseData.totalPages;

    // Se crea un objeto que almacena todas las solicitudes correspondientes a la cantidad
    // de páginas que obtuvimos en la primera llamadda.
    const pagesRequests = {};
    for (let i = 1; i <= totalPages; i++) {
      pagesRequests[i] = axios.get(`${API_ENDPOINT}?page=${i}`);
    }
    console.log({ pagesRequests });

    await axios.all(Object.values(pagesRequests)).then(
      axios.spread((...allResponses) => {
        allData = getAllDataFromResponses(allResponses);
      })
    );

    // Se itera sobre un arreglo de 149 arreglos de 50 elementos
    for (const page of allData) {
      // Se itera sobre cada uno de los 50 elementos calculando el número de ocurrencias
      for (const character of page) {
        ({ princessOcurrences, vocalOcurrences } = getOcurrences(
          princessOcurrences,
          character.name,
          vocalOcurrences
        ));
      }
    }

    // Asigna la cuenta de ocurrencias a su respectiva llave y obtiene el tiempo transcurrido.
    output[0].data[0]["count"] = princessOcurrences;
    output[0].data[1]["count"] = vocalOcurrences;
    const duration = Date.now() - start;
    output[0].time = `${duration / 1000} s`;

    // Se muestra en la página y se llevan a la consola la totalidad de los datos
    ouputSelector.innerHTML = JSON.stringify(output, undefined, 8);
    console.log({ allData });
    console.log({ output });
  } catch (error) {
    errorContainerSelector.style.display = "block";
    setButtonCta(true);
    console.log("Request failed");
    console.log({ error });
  } finally {
    setLoaderState(false);
    setButtonDisableState(false);
  }
};

buttonSelector.addEventListener("click", fetchMetaData);
