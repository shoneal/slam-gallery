const basicLink = "https://shoneal.github.io/slam-gallery/images/covers/";

const setupImageWithContainer = (img) => {
  return new Promise((resolve) => {
    const onLoadOrError = () => {
      img.style.opacity = "1";
      img.removeEventListener("load", onLoadOrError);
      img.removeEventListener("error", onLoadOrError);
      resolve(img);
    };

    if (img.complete) {
      onLoadOrError();
    } else {
      img.addEventListener("load", onLoadOrError);
      img.addEventListener("error", onLoadOrError);
    }
  });
}; // Функция для настройки прозрачности изображения

// Всё, что касается шапки с изображениями
const randomCovers = Object.keys(covers)
  .sort(() => Math.random() - 0.5)
  .slice(0, 20); // 20 случайных обложек
const header = document.querySelector(".header");
const animationList = document.querySelector(".animation_list");
const getImageExtension = (itemKey) => {
  const extensionMap = { LaMeloBall: "png" };
  return extensionMap[itemKey] || "jpg";
};
const addRandomImages = () => {
  let loaded = 0;
  const total = randomCovers.length;

  randomCovers.forEach((image, index) => {
    const item = document.createElement("div");
    item.classList.add("animation_item");
    item.style.transform = `rotate(${
      index * 18
    }deg) translateY(calc(-1 * 970px))`;
    const img = document.createElement("img");
    img.alt = "SLAM Cover";
    img.src = `${basicLink}${image}/thumb.${getImageExtension(image)}`;

    setupImageWithContainer(img).then(() => {
      loaded++;
      if (loaded === total) {
        animationList.style.opacity = "1";
      }
    });

    item.appendChild(img);
    animationList.appendChild(item);
  });
}; // Добавление обложек в шапку в HTML и их анимация
let startScroll = 0;
let maxScroll = 0;
let currentRotateZ = 0;
function getCSSVariable(variableName) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    variableName,
  );
  return parseFloat(value);
}
function updateStyles(scroll) {
  const windowWidth = window.innerWidth;
  const baseScroll = windowWidth > 768 ? 100 : 0;
  const currentScroll = scroll - baseScroll;

  if (currentScroll >= 0) {
    currentRotateZ = currentScroll * 0.1;
    if (currentRotateZ > 180) {
      currentRotateZ = 180;
      maxScroll = scroll;
    }
  } else {
    currentRotateZ = 0;
  }
  animationList.style.transform = `translate3d(0px, 1100px, 0px) scale3d(1.25, 1.25, 1) rotateX(0deg) rotateY(0deg) rotateZ(${currentRotateZ}deg) skew(0deg, 0deg)`;

  const baseColor = getCSSVariable("--animation-back-color");
  const colorProgress = (scroll / window.innerHeight) * 2;
  const r = Math.round(baseColor * colorProgress);
  const g = Math.round(baseColor * colorProgress);
  const b = Math.round(baseColor * colorProgress);
  header.style.backgroundColor = `rgb(${18 + r}, ${18 + g}, ${18 + b})`;
  header.style.color = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
}

const stickyElement = document.querySelector(".navigation");
function calculateThreshold() {
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const offset = window.innerWidth > 768 ? 55 : 100;
  return headerHeight - offset;
}
function checkStickyPosition() {
  const scrollTop = window.scrollY;
  const threshold = calculateThreshold();
  if (scrollTop >= threshold) {
    stickyElement.classList.add("has-border");
  } else {
    stickyElement.classList.remove("has-border");
  }
}

// Всё, что касается логики открытия и закрытия попапов
let openPopups = []; // Открытые попапы
let currentSlide = 0;
let isOpen = false;
let keydownListenerAdded = false;
let galleryListenersAdded = false;
let currentPhotosArray = [];
function lockBody() {
  const body = document.body;
  const scrollPosition = window.scrollY;
  body.dataset.scrollPosition = scrollPosition;
  body.style.top = `-${scrollPosition}px`;
  body.classList.add("scroll-lock");
}
function unlockBody() {
  const body = document.body;
  const scrollPosition = body.dataset.scrollPosition;
  body.style.top = "";
  body.classList.remove("scroll-lock");
  window.scrollTo(0, scrollPosition);
}
function openPopup(popup) {
  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      closePopup(popup);
    }
  });
  popup.style.display = "flex";
  openPopups.push(popup);
  if (
    popup.classList.contains("gallery-popup") ||
    (popup.classList.contains("navigation-popup") && window.innerWidth < 767)
  ) {
    lockBody();
  }
  if (popup.classList.contains("slide-popup")) {
    isOpen = true;
    currentSlide = currentSlide || 0;
  }
} // Функция отркытия попапов
function closePopup(popup) {
  popup.style.display = "none";
  openPopups.splice(openPopups.indexOf(popup), 1);
  if (
    popup.classList.contains("gallery-popup") ||
    (popup.classList.contains("navigation-popup") && window.innerWidth < 767)
  ) {
    unlockBody();
    try {
      if (galleryListenersAdded) {
        gallery.removeEventListener("click", handleGalleryClick);
        galleryListenersAdded = false;
      }
    } catch (error) {
      // Если слушатель уже удален или не существует, просто игнорируем ошибку
    }
    currentIndex = currentSlide;
    currentPhotosArray = [];
  }
  if (popup.classList.contains("slide-popup")) {
    isOpen = false;
    keydownListenerAdded = false;
  }
} // Функция закрытия попапов
function closeAllPopupsOnEsc(event) {
  if (event.key === "Escape" && openPopups.length > 0) {
    const lastPopup = openPopups[openPopups.length - 1];
    closePopup(lastPopup);
  }
} // Функция нажатия вне попапа
document.querySelectorAll(".close").forEach((closeButton) => {
  closeButton.addEventListener("click", () => {
    const popup = closeButton.closest(".popup");
    closePopup(popup);
  });
}); // Обработчики закрытия попапов на кнопки закрытия
document.addEventListener("click", (event) => {
  if (openPopups.length > 0 && event.target === document.body) {
    const lastPopup = openPopups[openPopups.length - 1];
    closePopup(lastPopup);
  }
}); // Действия при клике вне попапа
document.addEventListener("keydown", closeAllPopupsOnEsc); // Нажатие на ESC

// Всё, что касается попапа с чекбоксами
const uniqueLeagues = [
  "NBA",
  "WNBA",
  "College",
  "High School",
  "Europe",
  "Other",
];
function getTopPlayers(covers, topCount = 3) {
  const playerCount = Object.values(covers).reduce((acc, cover) => {
    cover.players.forEach((p) => (acc[p] = (acc[p] || 0) + 1));
    return acc;
  }, {});

  const teamFrequency = Object.values(covers).reduce((acc, cover) => {
    cover.team.forEach((t) => (acc[t] = (acc[t] || 0) + 1));
    return acc;
  }, {});

  return Object.entries(playerCount)
    .map(([player, count]) => {
      const teams = Object.values(covers)
        .filter((c) => c.players.includes(player))
        .flatMap((c) => c.team.filter(Boolean));

      const mainTeam = teams[0] || "Unknown";
      return {
        player,
        count,
        team: mainTeam,
        teamCount: teamFrequency[mainTeam] || 0,
      };
    })
    .sort(
      (a, b) =>
        b.count - a.count ||
        b.teamCount - a.teamCount ||
        a.player.localeCompare(b.player),
    )
    .slice(0, topCount)
    .map(({ player }) => player);
}
const topPlayers = getTopPlayers(covers); // Вывод часто повторяющихся игроков
const checkboxContainers = document.querySelector(".checkbox-containers");
function createCheckbox(labelText, container, type) {
  const label = document.createElement("label");
  label.classList.add("checkbox-label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = type;
  const textSpan = document.createElement("span");
  textSpan.textContent = labelText;
  label.appendChild(checkbox);
  label.appendChild(textSpan);
  container.appendChild(label);
  return checkbox;
} // Функция создания чекбокса
const createContainer = (className) => {
  const container = document.createElement("div");
  container.classList.add("checkbox-container", className);
  return container;
}; // Контейнеры для разных типов чекбоксов
const leaguesContainer = createContainer("leagues");
const teamsContainer = createContainer("teams");
const playersContainer = createContainer("players");
uniqueLeagues.forEach((league) =>
  createCheckbox(league, leaguesContainer, "league"),
);
topPlayers.forEach((player) =>
  createCheckbox(player, playersContainer, "player"),
);
function createTeamCheckboxes(selectedLeagues = []) {
  teamsContainer.innerHTML = "";
  const teams = Object.values(covers)
    .filter(
      (c) => !selectedLeagues.length || selectedLeagues.includes(c.league),
    )
    .flatMap((c) => c.team)
    .filter(Boolean)
    .reduce((set, t) => set.add(t), new Set());

  Array.from(teams)
    .sort((a, b) => a.localeCompare(b))
    .forEach((team) => createCheckbox(team, teamsContainer, "team"));
} // Функция создания чекбоксов команд исходя из активных чекбоксов лиг
const addTitleAndContainer = (titleText, container) => {
  const title = document.createElement("h2");
  title.textContent = titleText;
  checkboxContainers.appendChild(title);
  checkboxContainers.appendChild(container);
}; // Заголовки и контейнеры в основной контейнер
addTitleAndContainer("Athletes", playersContainer);
addTitleAndContainer("Teams", leaguesContainer);
checkboxContainers.appendChild(teamsContainer);
leaguesContainer.addEventListener("change", (event) => {
  if (event.target.type === "checkbox") {
    const selectedLeagues = Array.from(
      leaguesContainer.querySelectorAll("input:checked"),
      (checkbox) => checkbox.nextElementSibling.textContent,
    );
    createTeamCheckboxes(selectedLeagues);
    closePopup(navigationPopup);
  }
}); // Обработчик чекбоксов лиг

const navigationPopup = document.querySelector(".navigation-popup");
const filterButton = document.querySelector(".filter");
filterButton.addEventListener("click", () => {
  openPopup(navigationPopup);
}); // Открытие попапа с навигацией

function filterCovers(
  covers,
  selectedLeagues,
  selectedTeams,
  selectedPlayers,
  searchQuery,
) {
  const lowerSearch = searchQuery.toLowerCase();

  return Object.entries(covers)
    .filter(([key, cover]) => {
      const lMatch =
        !selectedLeagues.length || selectedLeagues.includes(cover.league);
      const tMatch =
        !selectedTeams.length ||
        cover.team.some((t) => selectedTeams.includes(t));
      const pMatch =
        !selectedPlayers.length ||
        cover.players.some((p) => selectedPlayers.includes(p));
      const sMatch =
        cover.title.toLowerCase().includes(lowerSearch) ||
        cover.team.some((t) => t.toLowerCase().includes(lowerSearch)) ||
        cover.players.some((p) => p.toLowerCase().includes(lowerSearch));

      return lMatch && tMatch && pMatch && sMatch;
    })
    .sort(([keyA, coverA], [keyB, coverB]) => coverB.date - coverA.date)
    .map(([key, cover]) => ({
      ...cover,
      key,
    }));
} // Фильтрация обложек
const template = document.querySelector("#cover-template");
const container = document.querySelector(".covers_list");
const emptyMessage = document.querySelector(".empty-message");
function renderCover(item) {
  const clone = template.content.cloneNode(true);
  const itemElement = clone.querySelector(".covers_item");
  const img = clone.querySelector(".cover_img");
  const number = clone.querySelector(".cover_number");
  const title = clone.querySelector(".cover_title");

  img.style.opacity = "0";
  img.alt =
    item.players.length === 1
      ? `На обложке представлен ${item.players[0]}`
      : `На обложке представлены ${item.players.join(", ")}`;
  img.src = `${basicLink}${item.key}/thumb.${getImageExtension(item.key)}`;
  setupImageWithContainer(img);

  number.textContent = item.number || "";
  title.textContent = item.title;

  itemElement.addEventListener("click", () => {
    handlePopup(item);
  });

  return clone;
} // Рендер обложки
function updateFilters() {
  const selectedLeagues = [
    ...document.querySelectorAll(".leagues input:checked"),
  ].map((checkbox) => checkbox.nextElementSibling.textContent);
  const selectedTeams = [
    ...document.querySelectorAll(".teams input:checked"),
  ].map((checkbox) => checkbox.nextElementSibling.textContent);
  const selectedPlayers = [
    ...document.querySelectorAll(".players input:checked"),
  ].map((checkbox) => checkbox.nextElementSibling.textContent);
  const searchQuery = search.value;

  const filteredCovers = filterCovers(
    covers,
    selectedLeagues,
    selectedTeams,
    selectedPlayers,
    searchQuery,
  );

  container.innerHTML = "";
  emptyMessage.style.display = filteredCovers.length ? "none" : "block";
  filteredCovers.forEach((cover) => {
    container.appendChild(renderCover(cover));
  });
} // Обновление фильтров

const search = document.querySelector(".search");
const homeButton = document.querySelector(".home_button");
search.addEventListener("input", () => {
  updateFilters();
}); // Обработчик поиска
checkboxContainers.addEventListener("change", (event) => {
  if (event.target.type === "checkbox") {
    updateFilters();
    closePopup(navigationPopup);
    document.querySelector(".main").scrollIntoView({ block: "start" });
  }
}); // Обработчик чекбоксов
homeButton.addEventListener("click", () => {
  Array.from(
    checkboxContainers.querySelectorAll('input[type="checkbox"]'),
  ).forEach((checkbox) => {
    checkbox.checked = false;
  });
  search.value = "";
  updateFilters();
  document.querySelector(".main").scrollIntoView({ block: "start" });
}); // Обработчик нажатия на главную кнопку

document.addEventListener("scroll", () => {
  const scroll = window.scrollY || window.pageYOffset;
  updateStyles(scroll);
  requestAnimationFrame(checkStickyPosition);
}); // Действия при скролле
document.addEventListener("wheel", () => {
  const scroll = window.scrollY || window.pageYOffset;
  updateStyles(scroll);
}); // Действия при скролле колесиком
document.addEventListener("DOMContentLoaded", () => {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }

  addRandomImages();
  createTeamCheckboxes();
  updateFilters();
  checkStickyPosition();

  const scroll = window.scrollY || window.pageYOffset;
  updateStyles(scroll);

  const updatePlaceholder = () => {
    search.setAttribute(
      "placeholder",
      window.innerWidth <= 767 ? "" : "Search by Keywords",
    );
  };
  updatePlaceholder();
  window.addEventListener("resize", () => {
    updatePlaceholder();
    requestAnimationFrame(checkStickyPosition);
    openPopups.forEach((popup) => {
      if (popup.classList.contains("navigation-popup")) {
        if (
          window.innerWidth < 767 &&
          !document.body.classList.contains("scroll-lock")
        ) {
          lockBody();
        } else if (
          window.innerWidth >= 767 &&
          document.body.classList.contains("scroll-lock")
        ) {
          unlockBody();
        }
      }
    });
  });
}); // Инициализация функций при открытии сайта

const popupGallery = document.querySelector(".gallery-popup");
const popupGalleryContent = popupGallery.querySelector(".popup-content");
const gallery = popupGallery.querySelector(".gallery");
function handlePopup(item) {
  gallery.innerHTML = "";

  const header = document.createElement("div");
  header.classList.add("popup-header");
  const h2 = document.createElement("h2");
  h2.textContent = item.team.join(", ");
  const h1 = document.createElement("h1");
  h1.textContent = item.players.join(", ");

  header.appendChild(h2);
  header.appendChild(h1);
  gallery.appendChild(header);

  currentPhotosArray = (() => {
    const base = `${basicLink}${item.key}/`;
    const total = 1 + item.photos;
    const ext = getImageExtension(item.key);
    return Array.from(
      { length: total },
      (_, i) => base + (i === 0 ? `full.${ext}` : `${i}.jpg`),
    );
  })();

  const photoElements = currentPhotosArray.map((photo, index) => {
    const photoDiv = document.createElement("div");
    photoDiv.classList.add("img_wrapper");
    const photoImg = document.createElement("img");
    const blurImg = document.createElement("img");

    photoImg.style.opacity = "0";
    photoImg.src = photo;
    photoImg.alt = "Фотосессия SLAM";

    if (index === 0) {
      photoDiv.classList.add("main_cover");
      photoImg.classList.add("main_cover_img");
      blurImg.classList.add("blur_img");
      blurImg.src = photo;
      blurImg.alt = "Фотосессия SLAM";
      photoDiv.appendChild(blurImg);
    }

    photoDiv.appendChild(photoImg);
    return photoDiv;
  });

  photoElements.forEach((element) => gallery.appendChild(element));

  const checkAndAddClasses = () => {
    let startIndex = 1;
    while (startIndex < photoElements.length) {
      let count = 0;
      let currentGroup = [];
      for (let i = startIndex; i < photoElements.length; i++) {
        const element = photoElements[i];
        const img = element.querySelector("img");
        currentGroup.push(element);
        count++;
        if (img.naturalWidth > img.naturalHeight) {
          element.classList.add("horizontal_photo");
          if (currentGroup.length > 1 && (currentGroup.length - 1) % 2 !== 0) {
            currentGroup[currentGroup.length - 2].classList.add("odd_photo");
          }
          startIndex = i + 1;
          currentGroup = [];
          break;
        }
        if (i === photoElements.length - 1) {
          if (currentGroup.length % 2 !== 0) {
            currentGroup[currentGroup.length - 1].classList.add("odd_photo");
          }
          startIndex = photoElements.length;
        }
      }
    }
  };

  Promise.all(
    photoElements.flatMap((element) => {
      const photoImgs = element.querySelectorAll("img");
      return Array.from(photoImgs).map((photoImg) => {
        return setupImageWithContainer(photoImg);
      });
    }),
  ).then(checkAndAddClasses);

  openPopup(popupGallery);
  popupGalleryContent.scrollTop = 0;

  // Всё, что касается открытия попапа с галереей и ее свайпы
  const slidePopup = document.querySelector(".slide-popup");
  const slideWrapper = slidePopup.querySelector(".slide_wrapper");
  const prevButton = slidePopup.querySelector(".prev");
  const nextButton = slidePopup.querySelector(".next");

  let slides = [];
  let controlsAdded = false;

  function handleGalleryClick(event) {
    const target = event.target.closest("div");
    const index = Array.from(gallery.children).findIndex(
      (child) => child === target,
    );

    if (index >= 0) {
      showFullsizeGallery(index - 1);
      openPopup(slidePopup);
    }
  }

  if (!galleryListenersAdded) {
    gallery.addEventListener("click", handleGalleryClick);
    galleryListenersAdded = true;
  }

  const showFullsizeGallery = (startIndex) => {
    slideWrapper.innerHTML = "";
    slides = [];
    currentSlide = startIndex;
    currentPhotosArray.forEach((photo, i) => {
      const slide = document.createElement("div");
      slide.classList.add("slide");
      const img = document.createElement("img");
      img.classList.add("slide_img");
      img.src = photo;
      img.alt = "Фотосессия SLAM";
      setupImageWithContainer(img);
      slide.appendChild(img);
      slideWrapper.appendChild(slide);
      slides.push(slide);
    });

    updateSlider();
    if (!controlsAdded) {
      addControls();
      controlsAdded = true;
    }
    slideWrapper.addEventListener("click", handleSlideClick);
    if (!keydownListenerAdded) {
      document.addEventListener("keydown", handleKeyboard);
      keydownListenerAdded = true;
    }
  };

  const updateSlider = () => {
    const offset = window.innerWidth < 767 ? currentSlide * 20 : 0;
    const transformValue =
      window.innerWidth < 767
        ? `calc(-${currentSlide * 100}% - ${offset}px)`
        : `-${currentSlide * 100}%`;

    slideWrapper.style.transform = `translateX(${transformValue})`;
    updateButtonState();
  };
  const addControls = () => {
    prevButton.addEventListener("click", () => navigate(-1));
    nextButton.addEventListener("click", () => navigate(1));
  };
  const navigate = (direction) => {
    if (!isOpen) return;
    if (direction === -1 && currentSlide > 0) {
      currentSlide--;
    } else if (direction === 1 && currentSlide < slides.length - 1) {
      currentSlide++;
    }
    updateSlider();
  };
  const handleKeyboard = (e) => {
    if (!isOpen) return;
    e.preventDefault();
    switch (e.key) {
      case "ArrowLeft":
        navigate(-1);
        break;
      case "ArrowRight":
        navigate(1);
        break;
      case "ArrowUp":
      case "ArrowDown":
      case " ":
        return;
    }
  };
  const updateButtonState = () => {
    prevButton.disabled = currentSlide === 0;
    nextButton.disabled = currentSlide === slides.length - 1;
    prevButton.classList.toggle("disabled", currentSlide === 0);
    nextButton.classList.toggle("disabled", currentSlide === slides.length - 1);
  };

  const handleSlideClick = (event) => {
    if (!isOpen) return;
    const rect = slidePopup.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const halfWidth = rect.width / 2;
    if (clickX < halfWidth) {
      navigate(-1);
    } else {
      navigate(1);
    }
  };
  window.addEventListener("resize", updateSlider);

  const mainCoverImg = popupGalleryContent.querySelector(".main_cover_img");
  const returnButton = popupGalleryContent.querySelector(".close");
  let maxScroll = 0;
  let currentPercent = 100;
  const threshold = 50;
  function updateDirection() {
    if (window.innerWidth > 767) {
      mainCoverImg.style.blockSize = "100%";
      mainCoverImg.style.inlineSize = "auto";
    } else {
      mainCoverImg.style.blockSize = "auto";
      mainCoverImg.style.inlineSize = "100%";
    }
  }
  function updateStyles(scroll) {
    const direction = window.innerWidth > 767 ? "blockSize" : "inlineSize";
    if (scroll >= 0) {
      currentPercent = 100 + scroll * 0.075;
      if (currentPercent > 175) {
        currentPercent = 175;
        maxScroll = scroll;
      }
    } else {
      currentPercent = 100;
    }
    mainCoverImg.style[direction] = `${currentPercent}%`;
    returnButton.classList.toggle("return-visible", scroll >= threshold);
  }
  popupGalleryContent.addEventListener("scroll", () => {
    const scroll = popupGalleryContent.scrollTop;
    updateStyles(scroll);
  }); // Анимация кнопки закрытия в попапе

  window.addEventListener("resize", () => {
    updateSlider();
    updateDirection();
  });
  updateDirection();
} // Открытие попапа с галереей
