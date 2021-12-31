const API_ENDPOINT = "https://api.disneyapi.dev/characters";

// Selectors
const buttonSelector = document.querySelector("#button");
const ouputSelector = document.querySelector("#output");
const timeSelector = document.querySelector("#time");
const princessSelector = document.querySelector("#princess");
const vocalsSelector = document.querySelector("#vocals");
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
  let allData = [];
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

  let morePagesAvailable = true;
  let currentPage = 0;

  try {
    setLoaderState(true);
    setButtonDisableState(true);
    setButtonCta(false);
    // Dado el sistema de paginación de la api se hacen consultas consecutivamente hasta
    // pasar por todas las paginas (149 en este momento), en cada una de ellas se obtienen
    // 50 personajes y se itera sobre ellos revisando uno por uno cuantas veces contienen
    // en su nombre la palabra 'princess' y lo mismo con cada vocal, sumando esos números
    // al resultado almacenado en la variable output.
    while (morePagesAvailable) {
      currentPage++;
      const response = await fetch(`${API_ENDPOINT}?page=${currentPage}`);
      let { data, totalPages } = await response.json();
      // Se itera sobre cada uno de los 50 personajes de cada pagina
      for (const character of data) {
        // Se llama a la función que obtiene la cantidad de ocurrencias en el nombre
        ({ princessOcurrences, vocalOcurrences } = getOcurrences(
          princessOcurrences,
          character.name,
          vocalOcurrences
        ));
      }
      // Se almacenan todos los datos en una variable global (para revisión)
      allData = [...allData, ...data];
      morePagesAvailable = currentPage < totalPages;
    }
    // Obtiene el tiempo transcurrido y asigna la cuenta de ocurrencias a su respectiva llave
    const duration = Date.now() - start;
    output[0].time = `${duration / 1000} s`;
    output[0].data[0]["count"] = princessOcurrences;
    output[0].data[1]["count"] = vocalOcurrences;

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
