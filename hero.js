const avatar = document.getElementById("avatar");
const heroTitle = document.getElementById("hero-title");
const bio = document.getElementById("biography");
const powerstats = document.getElementById("powerstats");
const PUBLIC_API_KEY = "474d06ad31b1bbc87d2affb73d6accc4";
const PRIVATE_API_KEY = "a66783524b73b776188080329f6f6014a30976c7";
const ts = "1";

const getHash = CryptoJS.MD5(ts + PRIVATE_API_KEY + PUBLIC_API_KEY).toString();

// call the update UI method when the window loads completely
window.onload = function () {
  let windowUrl = window.location.href;
  let heroId = windowUrl.substring(windowUrl.lastIndexOf("=") + 1);
  manipulateDOM(heroId);
};

// Insert element from fetched responseData
async function manipulateDOM(id) {
  let url =`https://gateway.marvel.com/v1/public/characters/${id}?ts=${ts}&apikey=${PUBLIC_API_KEY}&hash=${getHash}`;

  let responseData = await fetchAsync(url);
  if (responseData) {
    responseData = responseData?.data?.results[0] || [];
    heroTitle.innerHTML = responseData?.name;
    avatar.src = responseData?.thumbnail?.path + '.'+responseData?.thumbnail?.extension;
    let comicsDetails = document.getElementById("comics-details");
    responseData?.comics?.items.map((item) => {
      var newLI = document.createElement('li');
      newLI.innerHTML = item?.name;
      comicsDetails.appendChild(newLI);
    });
      

    let seriesDetails = document.getElementById("series-details");
    responseData?.series?.items.map((item) => {
      var newLI = document.createElement('li');
      newLI.innerHTML = item?.name;
      seriesDetails.appendChild(newLI);
    });

    let storiesDetails = document.getElementById("stories-details");
    responseData?.stories?.items.map((item) => {
      var newLI = document.createElement('li');
      newLI.innerHTML = item?.name;
      storiesDetails.appendChild(newLI);
    });

    let eventsDetails = document.getElementById("events-details");
    responseData?.events?.items.map((item) => {
      var newLI = document.createElement('li');
      newLI.innerHTML = item?.name;
      eventsDetails.appendChild(newLI);
    });
  }
}

// API call to fetch responseData
async function fetchAsync(url) {
  try {
    let res = await fetch(url);
    let responseData = await res.json();
    return responseData;
  } catch (err) {
    console.log(err);
  }
}
