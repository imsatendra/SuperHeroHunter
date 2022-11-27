const searchHero = document.getElementById("search-hero");
const searchResultsContainer = document.getElementById("all-characters");

const PUBLIC_API_KEY = "474d06ad31b1bbc87d2affb73d6accc4";
const PRIVATE_API_KEY = "a66783524b73b776188080329f6f6014a30976c7";
const ts = "1";
const paginationNumbers = document.getElementById("pagination-numbers");
let params = (new URL(document.location)).searchParams;

let pageNo = params.get('page') || 1;
let offset = params.get('offset') || 0;

// fetching 10 records per page....
const perPage = 10;
// creating md5 hash...
const getHash = CryptoJS.MD5(ts + PRIVATE_API_KEY + PUBLIC_API_KEY).toString();
let url = `https://gateway.marvel.com/v1/public/characters?ts=${ts}&apikey=${PUBLIC_API_KEY}&hash=${getHash}`;
const pageWrapper = document.querySelector('.pages');


// trigger event listener
triggerEventListeners();

// fetching all super hero data initially
fetchData();
function triggerEventListeners() {
  searchHero.addEventListener("keyup", handleSearch);
}
// pagination
function generatePagination(totalCount) {
  if (totalCount > 0) {
    let pages = Math.floor(totalCount / perPage);
    let count = totalCount;
    const reservedPage = [1, 2];
    if (pageNo > count) pageNo = count;

    if (count >= perPage) {
      let initialPages = [1, 2, 3];
      if (reservedPage.indexOf(+pageNo) > -1) {
        initialPages.push('...');
        initialPages.push(+pageNo + 3);
      } else {
        initialPages.push('...');
        initialPages.push(Math.floor(count / perPage) != +pageNo ? +pageNo + 1 : Math.floor(count / perPage));
      }
      if (+pageNo != Math.floor(count / perPage)) {
        initialPages.push('...');
        initialPages.push(Math.floor(count / perPage));
      }
      pages = initialPages;
    } else pages = [];

    pageWrapper.innerHTML = '';
    pages.forEach(page => {
      if (page == '...') pageWrapper.innerHTML += page;
      else {
        const button = Object.assign(document.createElement('a'), {
          className: 'button',
          innerText: page,
          href: "?page=" + page + "&offset=" + perPage * page
        });

        pageWrapper.append(button);
        if (page == pageNo) button.classList.add('active');
      }
    });
  } else {
    pageWrapper.innerHTML = null;
  }
}


// when a user clicks enter in the search bar redirects him to superhero page
async function handleEnter(nameToSearch) {
  let data = await fetchAsync(`${url}&nameStartsWith=${nameToSearch}`);
  // redirect to super hero page if success
  if (data.response === "success") {
    let heroPagePath = `${window.location.pathname} + /../hero.html#id=${data.results[0].id}`;
    window.open(heroPagePath);
  }
}

// handle search Input
async function handleSearch(e) {
  // trim the name to be searched
  let nameToSearch = e.target.value.trim();
  // if user has hit enter in the search bar
  if (e.keyCode === 13 && nameToSearch.length > 0) {
    handleEnter(nameToSearch);
  }
  if (nameToSearch.length == 0) {
    await clearSearchResults();
  }
  // fetch complete data
  fetchData(nameToSearch);
}

// calling api to fetch super heroes list
async function fetchData(search) {
  let searchUrl = `${url}&limit=${perPage}&offset=${offset}`;
  if (search) {
    searchUrl = `${url}&nameStartsWith=${search}`;
  }
  let responseData = await fetchAsync(searchUrl);
  if (responseData) {
    searchResultsContainer.innerHTML = "";
    let favorites = getFavourites();
    responseData = responseData.data;
    generatePagination(responseData?.total);

    if (responseData.results.length == 0) {
      searchResultsContainer.innerHTML = "No results found.";
    }
    // create elements using DOM for appending to search results and add event listeners
    for (let i = 0; i < responseData.results.length; i++) {
      let searchItem = document.createElement("div");
      searchItem.className = "search-result";

      let heroImage = document.createElement("img");
      heroImage.setAttribute("src", `${responseData.results[i].thumbnail.path}.${responseData.results[i].thumbnail.extension}`);
      heroImage.setAttribute("id", `${responseData.results[i].id}`);
      heroImage.addEventListener("click", displayHeroPage);

      searchItem.appendChild(heroImage);

      let heroInfo = document.createElement("div");
      heroInfo.className = "hero-info";
      heroInfo.setAttribute("id", `${responseData.results[i].id}`);

      searchItem.appendChild(heroInfo);

      let heroName = document.createElement("span");
      heroName.innerText = responseData.results[i].name;
      heroInfo.appendChild(heroName);

      let optionButton = document.createElement("button");
      if (favorites.includes(responseData.results[i].id)) {
        optionButton.innerHTML = "Remove from favourites";
        optionButton.addEventListener("click", removeFromFavourites);
      } else {
        optionButton.innerHTML = "Add to favourites";
        optionButton.addEventListener("click", addToFavourites);
      }
      heroInfo.appendChild(optionButton);

      searchResultsContainer.appendChild(searchItem);
    }
  } else {
    await clearSearchResults();
  }
}
// API Call
async function fetchAsync(url) {
  try {
    let res = await fetch(url);
    let data = await res.json();
    return data;
  } catch (err) {
    await clearSearchResults();
  }
}

// clear all search results
async function clearSearchResults() {
  let i = searchResultsContainer.childNodes.length;
  while (i--) {
    searchResultsContainer.removeChild(searchResultsContainer.lastChild);
  }
}

// redirect to a super hero page with respective id
async function displayHeroPage(e) {
  let heroPagePath = `${window.location.pathname} + /../hero.html#id=${e.target.id}`;
  window.open(heroPagePath);
}

// return the list of favourite hero id's which is stored in local storage
function getFavourites() {
  let favourites;
  if (localStorage.getItem("favHeros") === null) {
    favourites = [];
  } else {
    favourites = JSON.parse(localStorage.getItem("favHeros"));
  }
  return favourites;
}

// add superhero to favourites
async function addToFavourites(e) {
  let itemId = e.target.parentElement.id;
  let favorites = getFavourites();
  if (!favorites.includes(itemId)) {
    favorites.push(itemId);
  }
  localStorage.setItem("favHeros", JSON.stringify(favorites));
  e.target.innerHTML = "Remove from favourites";
  e.target.removeEventListener("click", addToFavourites);
  e.target.addEventListener("click", removeFromFavourites);
}

// remove superhero from favourites
async function removeFromFavourites(e) {
  let itemId = e.target.parentElement.id;
  console.log("itemId remove", itemId);
  let favourites = getFavourites();

  let updatedFavorites = favourites.filter(function (val) {
    return val != itemId;
  });
  localStorage.setItem("favHeros", JSON.stringify(updatedFavorites));
  e.target.innerHTML = "Add to favourites";
  e.target.removeEventListener("click", removeFromFavourites);
  e.target.addEventListener("click", addToFavourites);
}
