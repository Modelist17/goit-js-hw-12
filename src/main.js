import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { fetchImages } from './js/pixabay-api';
import { appendImages } from './js/render-functions';

const form = {
  searchForm: document.querySelector('.search-form'),
  input: document.querySelector('[type="text"]'),
};

export const galleryContainer = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const moreLoader = document.querySelector('.loader.moreLoader');

export const loadMoreBtn = document.querySelector('.loadBtn');

let currentPage = 1;
let currentQuery = '';
export const perPage = 15;

form.searchForm.addEventListener('submit', onSearchImg);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearchImg(event) {
  event.preventDefault();
  const searchQuery = form.input.value.trim();
  if (!searchQuery) {
    iziToast.error({
      message: 'Fill in the input field!',
      position: 'topRight',
    });
    return;
  }
  // showing the loader:
  loader.style.display = 'block';

  currentQuery = searchQuery;
  currentPage = 1;

  // Виклик запиту до сервера та отримання даних:
  try {
    const images = await fetchImages(currentQuery, currentPage);
    displayImages(images.hits);
  } catch (error) {
    iziToast.error({
      message: 'An error occurred while fetching images!',
      position: 'topRight',
    });
  } finally {
    // Приховати індикатор завантаження після завершення запиту
    loader.style.display = 'none';
  }

  form.searchForm.reset();
}

async function onLoadMore() {
  // hide the Load more button_:
  loadMoreBtn.style.display = 'none';

  // show the loader_2:
  moreLoader.style.display = 'block';

  currentPage++;
  try {
    const images = await fetchImages(currentQuery, currentPage);
    appendImages(images.hits);

    // how many pages (dynam.):
    const totalPages = Math.ceil(images.totalHits / perPage);

    if (currentPage >= totalPages) {
      loadMoreBtn.style.display = 'none';
      return iziToast.info({
        position: 'topRight',
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      // Показати кнопку Load more
      loadMoreBtn.style.display = 'block';
    }

    // Прокрутити сторінку на висоту однієї карточки галереї
    const itemHeight = getGalleryItemHeight();
    window.scrollBy({
      top: itemHeight * 2, // Прокрутка на дві висоти карточки галереї
      behavior: 'smooth', // Плавна анімація прокрутки
    });
  } catch (error) {
    console.log(error);
    iziToast.error({
      message: 'An error occurred while fetching more images!',
      position: 'topRight',
    });
  } finally {
    // hiding the loader:
    moreLoader.style.display = 'none';
  }
}

function displayImages(images) {
  // clean the exicting gallery:
  galleryContainer.innerHTML = '';
  appendImages(images);
}

//Функція, яка отримує висоту однієї карточки галереї за допомогою getBoundingClientRect:
function getGalleryItemHeight() {
  const galleryItem = document.querySelector('.gallery-item');
  const itemHeight = galleryItem.getBoundingClientRect().height;
  return itemHeight;
}
