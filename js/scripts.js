// == HTML references  ==
const headerInnerContainerRef = document.getElementsByClassName('header-inner-container')[0];
const searchContainerRef = document.getElementsByClassName('search-container')[0];
const modalContainerRef = document.getElementsByClassName('modal-container')[0];
const galleryRef = document.getElementById('gallery');

// array to hold user data from API call
let fetchedUsers = [];

// send a single API request to get 12 random users
fetch('https://randomuser.me/api/?results=12&nat=us')
  .then(response => response.json())
  .then(data =>  {
    fetchedUsers = refactorFetchedUsers(data.results); // store user data in array
    createSearchBar(); // create searchbar
    createPeopleCards(data.results); // create people cards
 })
 .catch(err => displayFailedFetch(err));

// == HELPER FUNCTIONS ==
// function to display error message if fetching fails
const displayFailedFetch = (err) => {
  const errorH1 = `<h1 class="failed-fetch">${err} :( No data from the API...</h1>`;
  galleryRef.innerHTML = errorH1;
};

// function to refactor some properties of fetched users from API
const refactorFetchedUsers = (users) => {
  return users.map(user => {
    // create full name property
    user.name.fullName = `${user.name.first} ${user.name.last}`;
    // format birthdate to mm/dd/yyyy format
    user.dob.date = new Intl.DateTimeFormat('en-US').format(new Date(user.dob.date));
    // format phone to (XXX) XXX-XXXX so just replace first dash with space
    user.phone = user.phone.replace('-', ' ');
    return user;
  });
};

// function to determine whether to display prev/next buttons on modal
const displayBtn = (btn, person) => {
  let index = fetchedUsers.findIndex(user => user.email === person.email);
  // if user index = first(hide prev btn) or last(hide next btn)
  if(btn === 'prev' && index === 0) return 'none';
  if(btn === 'next' && index === fetchedUsers.length-1) return 'none';
}

// function to filter users by search input
const filterSearchResults = search => {
  // turn search into lowercase regexp
  search = new RegExp(search.toLowerCase()); 
  // filter user array by testing user name against search 
  const filteredResults = fetchedUsers.filter(user => {
    return search.test(user.name.fullName.toLowerCase());
  });
  return filteredResults;
};


// == HTML CREATION FUNCTIONS ==
// function to create search bar
const createSearchBar = () => {
  const searchBarHTML = `
    <form action="#" method="get">
      <input type="search" id="search-input" class="search-input" placeholder="Search...">
      <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
    </form> 
  `;
  searchContainerRef.insertAdjacentHTML('beforeend', searchBarHTML);
};

// function to create people cards
const createPeopleCards = (peopleArray) => {
  // map each user in array as a html card
  const peopleCardsHTML = peopleArray.map(user => {
    return `
      <div class="card">
        <div class="card-img-container">
            <img class="card-img" src="${user.picture.large}" alt="profile picture">
        </div>
        <div class="card-info-container">
            <h3 id="name" class="card-name cap">${user.name.fullName}</h3>
            <p class="card-text card-email">${user.email}</p>
            <p class="card-text cap">${user.location.city}, ${user.location.state}</p>
        </div>
      </div>
  `;
  }).join('');
  // insert user cards html into gallery div
  galleryRef.innerHTML = peopleCardsHTML;
};

// function to create person modal
const createPersonModal = (person) => {
  const modalHTML = `
    <div class="modal">
      <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
      <div class="modal-info-container">
          <img class="modal-img" src="${person.picture.large}" alt="profile picture">
          <h3 id="name" class="modal-name cap">${person.name.fullName}</h3>
          <p class="modal-text modal-email">${person.email}</p>
          <p class="modal-text cap">${person.location.city}</p>
          <hr>
          <p class="modal-text"><strong>Phone: </strong>${person.phone}</p>
          <p class="modal-text">
            <strong>Address: </strong>${person.location.street.number}
            ${person.location.street.name}, 
            ${person.location.city}, 
            ${person.location.state} ${person.location.postcode}
          </p>
          <p class="modal-text"><strong>Birthday: </strong>${person.dob.date}</p>
      </div>

      <div class="modal-btn-container">
        <button type="button" id="modal-prev" class="modal-prev btn" style="display: ${displayBtn('prev', person)}">Prev</button>
        <button type="button" id="modal-next" class="modal-next btn" style="display: ${displayBtn('next', person)}">Next</button>
       </div>
    </div>
`;
  // insert modal html into modal container
  modalContainerRef.innerHTML = modalHTML;
};

// == CALLBACK FUNCTIONS == 
// clicking one of users create modal
const userClickCallback = e => {
  const element = e.target;
  // check if the clicked area is card, not the galleryDiv
  if(element !== galleryRef) {
    // get the card div
    const cardRef = element.closest('.card');
    // get the users email from card & find the its index from the fetchedUsers array
    const userEmail = cardRef.getElementsByClassName('card-email')[0].textContent;
    const curIndex = fetchedUsers.findIndex(user => user.email === userEmail);
    // display persons modal
    modalContainerRef.style.display = 'inherit';
    createPersonModal(fetchedUsers[curIndex]);
  }
};

// callback for clicks in users modal
const modalCallback = e => {
  const modalElement = e.target;

  // get the users email from card & find the its index from the fetchedUsers array
  const userEmail = modalContainerRef.getElementsByClassName('modal-email')[0].textContent;
  const curIndex = fetchedUsers.findIndex(user => user.email === userEmail);
    
  // check if target is close/exit button
  if(modalElement.closest('#modal-close-btn')) {
    const userModalRef = document.getElementsByClassName('modal')[0];
    userModalRef.remove();
    modalContainerRef.style.display = 'none';
  }
  
  // check if target is prev/next button and display persons modal
  if(modalElement.id === 'modal-next' && curIndex < fetchedUsers.length - 1){
    createPersonModal(fetchedUsers[curIndex+1]);
  }else if(modalElement.id === 'modal-prev' && curIndex > 0){
    createPersonModal(fetchedUsers[curIndex-1]);
  }
}

// callback for keyboard/paste input in search field
const searchInputCallback = e => {
  // store user search
  const search = e.target.value;
  // filter and display users based on search results
  const filtered = filterSearchResults(search);
  createPeopleCards(filtered);
}

// callback for either clicking search icon or pressing enter in search field
const searchSubmitCallback = () => {
  // get input field and get the current value
  const inputFieldRef = document.getElementById('search-input');
  const search = inputFieldRef.value;
  // filter and display users based on search results
  const filtered = filterSearchResults(search);
  createPeopleCards(filtered);
};


// == EVENT LISTENERS ==
galleryRef.addEventListener('click', userClickCallback);
modalContainerRef.addEventListener('click', modalCallback);
searchContainerRef.addEventListener('input', searchInputCallback);
searchContainerRef.addEventListener('submit', searchSubmitCallback);