const version = "v1";
const defaultSaveKey = "appData";
const dataTemplate = "data-template";
const app = {
  selectedData: {},
};

function defaultData() {
  return [{
    "id": "xxxxxx",
    "text": "It is always the present moment.",
  },{
      "id": "yyyyy",
      "text": "same 'old crap no matter where you go",
  }]
}

/**
 * Get's the HTML element for the data, or clones the template
 * and adds it to the DOM if we're adding a new item.
 *
 * @param {Object} data the data object
 * @return {Element} The element for the data
 */
function getDataCard(data) {
  const id = data.id;
  const card = document.getElementById(id);
  if (card) {
    return card;
  }
  const tmpl = document.getElementById(dataTemplate);
  if (!tmpl) {
    return null;
  }
  const newCard = tmpl.cloneNode(true);
  newCard.setAttribute('id', id);
  document.querySelector('main').appendChild(newCard);
  newCard.removeAttribute('hidden');
  return newCard;
}

/**
 * Get's the latest data from the network.
 *
 * @param {string} params a list of parameters
 * @return {Object} the data, if the request fails, return null.
 */
function getDataFromNetwork(params) {
  return fetch(`/api/${version}/${params}`)
      .then((response) => {
        return response.json();
      })
      .catch(() => {
        return null;
      });
}

/**
 * Get's the cached data from the caches object.
 *
 * @param {string} params the parameters for the request.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getDataFromCache(params) {
  if (!('caches' in window)) {
    return null;
  }
  const url = `${window.location.origin}/api/${version}/${params}`;
  return caches.match(url)
      .then((response) => {
        if (response) {
          return response.json();
        }
        return null;
      })
      .catch((err) => {
        console.error('Error getting data from cache', err);
        return null;
      });
}

/**
 * Gets the latest data and updates
 */
function updateData() {
  Object.keys(app.selectedData).forEach((key) => {
    const data = app.selectedData[key];
    const card = getDataCard(data);

    if (!card) {
      return 
    }
    
    getDataFromCache(data.id)
        .then((result) => {
          renderData(card, result);
        });

    // Get the data from the network.
    getDataFromNetwork(data.id)
        .then((result) => {
          renderData(card, result);
        });
  });
}

/**
 * Saves the list of data.
 *
 * @param {Object} data The list of data to save.
 */
function saveData(values, key = defaultSaveKey) {
  const data = JSON.stringify(values);
  localStorage.setItem(key, data);
}

/**
 * Loads the list of saved fortune.
 *
 * @return {Array}
 */
function loadData(key = defaultSaveKey) {
  let data = localStorage.getItem(key);
  if (data) {
    try {
      data = JSON.parse(data);
    } catch (ex) {
      data = {};
    }
  }
  if (!data || Object.keys(data).length === 0) {
    data = defaultData()
  }
  return data;
}

/**
 * Initialize the app, gets the list of data from local storage, then
 * renders the initial data.
 */
function init() {
  // Get the fortune list, and update the UI.
  app.selectedData = loadData();
  updateData();

  // Set up the event handlers for all of the buttons.
  const refresh = document.getElementById('butRefresh');

  if (refresh) {
    refresh.addEventListener('click', updateData);
  }

  if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
         navigator.serviceWorker.register('/service-worker.js')
             .then((reg) => {
               console.log('Service worker registered.', reg);
             });
      });
  }
}

init();
