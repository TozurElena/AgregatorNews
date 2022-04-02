const API_KEY = '9a86f6994bc3421387048670d17ed131';
const choicesElement = document.querySelector('.js-choice');
const newsList = document.querySelector('.news-list');
const formSearch = document.querySelector('.form-search');
const title = document.querySelector('.title');

const choices = new Choices(choicesElement, {
  searchEnabled: false, /*ubrali poisk*/
  itemSelectText: '',
})
const getdata = async(url) => {
  const response = await fetch(url, {
    headers: {
      'X-Api-Key': API_KEY,
    }
  });

  const data = await response.json(); 
  return data;
}
const getDateCorrectFormat = isoDate => {
  const date = new Date (isoDate);
  const fullDate = date.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const fullTime = date.toLocaleString('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
    
  });
  return `<span class="news-date">${fullDate}</span> ${fullTime}`
}

const getImage = url => new Promise ((resolve, reject) => {
  const image = new Image(270, 200);
  
  image.addEventListener('load', () => {
    resolve(image);
  });
  image.addEventListener('error', () => {
    image.src = 'img/noPhoto.jpg';
    resolve(image);
  });
  image.src = url || 'img/noPhoto.jpg';
  image.className = 'news-image';
  return image;
}) 
  
const renderCard =  (data) => {
  newsList.textContent = '';
  data.forEach(async ({urlToImage, title, url, description, publishedAt, author}) => {
    const card = document.createElement('li');
    card.className = 'news-item';
    const image = await getImage(urlToImage);
    image.alt  = title;
    card.append(image);
    card.insertAdjacentHTML('beforeend', `
             <h3 class="news-title">
              <a href="${url}" class="news-link" target="_blank">${title}</a>
            </h3>
            <p class="news-description">${description || ''}</p>
            <div class="news-footer">
              <time class="news-datetime" datetime="${publishedAt}">
                ${getDateCorrectFormat(publishedAt)}
              </time>
              <div class="news-aurhor">${author || ''}</div>
            </div>
    `);
    
    newsList.append(card);
  })

}
const loadNews = async () => {
  newsList.innerHTML = '<li class="preload"></li>';

  const  country = localStorage.getItem('country') || 'be';
  choices.setChoiceByValue(country);
  title.classList.add('hide');
  const data = await getdata(`https://newsapi.org/v2/top-headlines?country=${country}&pageSize=50`);
  renderCard(data.articles);
}
const loadSearch = async value => {
  
  const data = await getdata(`https://newsapi.org/v2/everything?q=${value}`);
  title.classList.remove('hide');
  title.textContent = `D'après votre demande “${value}” trouvé  ${data.articles.length} résultats`;
  renderCard(data.articles);
}

choicesElement.addEventListener('change', (event) => {
  const value = event.detail.value;
  localStorage.setItem('country', value);
  loadNews(value);
  
});

formSearch.addEventListener('submit', event => {
  event.preventDefault();
  loadSearch(formSearch.search.value);
  formSearch.reset(); // clear form
})

loadNews();