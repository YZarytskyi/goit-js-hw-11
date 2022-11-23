import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const formRef = document.querySelector('.search-form');
const galleryRef = document.querySelector('.gallery');
const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '31488628-c834a527c2d0d1c920b3fe01a';
const PER_PAGE = 40;
let page = 1;
let simpleLightbox = new SimpleLightbox('.gallery a');

formRef.addEventListener('submit', onSubmitHandler);

let options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
}
let loadMorePhotos = function(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      page += 1;
      fetchPhotos(formRef.searchQuery.value.trim(), page)
      .then(({data}) => {
        const markup = createMarkup(data.hits);
        galleryRef.insertAdjacentHTML('beforeend', markup);
  
        simpleLightbox.refresh();

        if (data.totalHits - (page * PER_PAGE) > 0) {
          const item = document.querySelector('.photo-card:last-child');
          observer.observe(item);
        }
      })
      .catch((err) => console.log(err))
    }
  });
};
let io = new IntersectionObserver(loadMorePhotos, options);


function onSubmitHandler(e) {
  e.preventDefault();
  page = 1;
  galleryRef.innerHTML = "";
  const value = e.currentTarget.searchQuery.value.trim();
  fetchPhotos(value)
    .then(({ data }) => {
      if (!data.total) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      Notify.success(
        `Hooray! We found ${data.totalHits} images.`
      );

      const markup = createMarkup(data.hits);
      galleryRef.innerHTML = markup;

      simpleLightbox.refresh();
      
      if (data.totalHits > PER_PAGE) {
        const item = document.querySelector('.photo-card:last-child');
        io.observe(item);
      } 
    })
    .catch(err => console.log(err));
}

function fetchPhotos(value, page = 1) {
  const searchParams = {
    params: {
      key: API_KEY,
      q: value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      per_page: 40,
      page: page,
    },
  };
  return axios.get(BASE_URL, searchParams)
}

function createMarkup(arr) {
  return arr.map(el => {
    return `
    <div class="photo-card">
      <a href="${el.largeImageURL}">
        <img src=${el.webformatURL} alt=${el.tags} class="gallery-img" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes ${el.likes}</b>
        </p>
        <p class="info-item">
          <b>Views ${el.views}</b>
        </p>
        <p class="info-item">
          <b>Comments ${el.comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads ${el.downloads}</b>
        </p>
      </div>
    </div>`
  }).join("")
}