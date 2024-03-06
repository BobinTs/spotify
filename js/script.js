console.log("Let write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];

  // Clear existing content of songUL
  let songUL = document
    .querySelector(".songslist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);

      // Append new song to songUL
      songUL.innerHTML += `<li><img class="invert" src="image/music.svg" alt="">
        <div class="info">
          <div>${songs[songs.length - 1].replaceAll("%20", " ")}</div>
          <div>Unknown</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="image/play.svg" alt="">
        </div></li>`;
    }
  }

  // Add event listeners to the newly added song items
  Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "image/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      //get meta data of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
      <div  class="play">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="40"
          height="40"
          fill="none"
          style="padding: 5px"
        >
          <path
            d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
            fill="#000"
          />
          <path d="M9 6L16.5 12L9 18V6Z" fill="#000" />
        </svg>
      </div>
      <img
        src="/songs/${folder}/cover.jpg"
        alt=""
      />
      <h2>${response.title}</h2>
      <p>${response.description}</p>
    </div>`;
    }
  }
  //  load the playlists whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // get the lists of all the songs
  await getSongs("songs/musics");
  playMusic(songs[0], true);

  //Display all the albums on the page
  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "image/pause.svg";
    } else {
      currentSong.pause();
      play.src = "image/play.svg";
    }
  });

  //time update

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add an event listener to seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add event listener to mute the track
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("image/mute.svg", "image/volume.svg");
      }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("image/volume.svg")) {
      e.target.src = e.target.src.replace("image/volume.svg", "image/mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("image/mute.svg", "image/volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });

  // mute the track

  document.querySelector(".volume").addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
      if (e.target.src.includes("image/volume.svg")) {
        e.target.src = e.target.src.replace(
          "image/volume.svg",
          "image/mute.svg"
        );
        currentSong.volume = 0;
        document
          .querySelector(".range")
          .getElementsByTagName("input")[0].value = 0;
      } else {
        e.target.src = e.target.src.replace(
          "image/mute.svg",
          "image/volume.svg"
        );
        currentSong.volume = 0.1;
        document
          .querySelector(".range")
          .getElementsByTagName("input")[0].value = 10;
      }
    }
  });

  // Add event listener to control volume
  document.querySelector(".volume").addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
      if (e.target.src.includes("image/volume.svg")) {
        e.target.src = e.target.src.replace(
          "image/volume.svg",
          "image/mute.svg"
        );
        currentSong.volume = 0;
        document
          .querySelector(".range")
          .getElementsByTagName("input")[0].value = 0;
      } else {
        e.target.src = e.target.src.replace(
          "image/mute.svg",
          "image/volume.svg"
        );
        currentSong.volume = 0.1;
        document
          .querySelector(".range")
          .getElementsByTagName("input")[0].value = 10;
      }
    }
  });

  // Add event listener to control volume using range input
  document.querySelector(".range input").addEventListener("input", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume > 0) {
      document.querySelector(".volume>img").src = document
        .querySelector(".volume>img")
        .src.replace("image/mute.svg", "image/volume.svg");
    }
  });
}
main();
