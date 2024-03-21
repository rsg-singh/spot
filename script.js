let currentsong = new Audio();
let songs;
let currfolder;
let song;

function secondsToMinutesSeconds(timeInSeconds) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  if (isNaN(seconds) || minutes < 0) {
    return "0:00";
  }
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

async function getsong(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${currfolder}/`);
  let response = await a.text();
  let element = document.createElement("div");
  element.innerHTML = response;
  let as = element.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];

    if (element.href.endsWith(".preview") && element.href.includes(".mp3")) {
      let songName = element.href.split("/").pop();
      songName = decodeURIComponent(songName.replace(".mp3.preview", "")); 
      songs.push(songName);
    }
  }

  let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML += `<li> 
      <img src="music.svg" alt="">
      <div class="invert info">
          <div>${song}</div>
          <div>shashank singh parihar</div>
      </div>
      <img src="play.svg" alt="">
     </li>`;
  }

  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playmusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });

  return songs;
}


const playmusic = (track, pause = false) => {
  currentsong.src = `/${currfolder}/` + track + ".mp3";
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


async function showalbum() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let element = document.createElement("div");
  element.innerHTML = response;
  let anchor = element.getElementsByTagName("a")
  Array.from(anchor).forEach(async e => {
    if (e.href.includes("/songs/")) {
      let folder = (e.href.split("/").slice(-2)[0]);
      let a2 = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json/`);
      let response2 = await a2.json();
      let cardcontainer = document.querySelector(".cardcontainer")
      console.log(response2);
      cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card">
      <div class="play">
          <svg style="width: 80%; height: auto;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="000">
              <circle cx="24" cy="24" r="20" fill="rgb(86 195 66)" />
              <path d="M26 24 L 20 20 L 20 28 Z" fill="000" />
          </svg>  
      </div>  
      <img src="songs/${folder}/cover.png/" alt="">
      <h2>${response2.title}</h2>
      <p>${response2.discription}</p>
      <h3>${response2.discription}</h3>
  </div> `
      Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
          songs = await getsong(`songs/${item.currentTarget.dataset.folder}`);
          playmusic(songs[0])
        })
      })
}
  })
  console.log(element);
}
async function main() {
  await getsong(`songs/${currfolder}`);
  playmusic(songs[0], true)

  showalbum()

  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "play.svg";
    }
  });
}
previous.addEventListener("click", () => {
  currentsong.pause();
  console.log("Previous clicked");
  let currentSongName = decodeURIComponent(currentsong.src.split("/").slice(-1)[0].replace(/%20/g, ' '));
  let currentSongIndex = songs.indexOf(currentSongName.replace(".mp3", ""));
  let previousSongIndex = currentSongIndex - 1;

  if (previousSongIndex >= 0) {
    let previousSong = songs[previousSongIndex];
    console.log("Previous Song:", previousSong);
  
    let previousSongUrl = `${currfolder}/${encodeURIComponent(previousSong)}.mp3`;
    playPreviousSong(previousSongUrl);
  } else {
    console.log("No previous songs in the directory.");
  }
});

async function playPreviousSong(songUrl) {
  currentsong.src = songUrl;
  currentsong.play();
  
  let songName = decodeURIComponent(songUrl.split("/").pop().split(".")[0].replace(/%20/g, ' '));
  
  document.querySelector(".songinfo").innerHTML = songName; 
}



after.addEventListener("click", async () => {
  currentsong.pause();
  console.log("Next clicked");

  let currentSongName = decodeURIComponent(currentsong.src.split("/").slice(-1)[0].replace(/%20/g, ' '));
  let currentSongIndex = songs.indexOf(currentSongName.replace(".mp3", ""));
  let nextSongIndex = currentSongIndex + 1;


  if (nextSongIndex < songs.length) {
    let nextSong = songs[nextSongIndex];
    console.log("Next Song:", nextSong);

    let nextSongUrl = `${currfolder}/${encodeURIComponent(nextSong)}.mp3`;

    await playNextSong(nextSongUrl);
  } else {
    console.log("No more songs in the directory.");
  }
});


async function playNextSong(songUrl) {
  currentsong.src = songUrl;
  currentsong.play();
  
  let songName = decodeURIComponent(songUrl.split("/").pop().split(".")[0].replace(/%20/g, ' '));
  
  document.querySelector(".songinfo").innerHTML = songName; 
}

currentsong.addEventListener('timeupdate', () => {
  let percent = (currentsong.currentTime / currentsong.duration) * 100;
  document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
  document.querySelector(".circle").style.left = percent + "%";
})

document.querySelector(".seekbar").addEventListener("click", (e) => {
  let percent = (e.offsetX / e.target.getBoundingClientRect().width)
  document.querySelector(".circle").style.left = percent * 100 + "%";
  currentsong.currentTime = ((currentsong.duration) * percent);
})
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0"
})
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-120%"
})


document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
  console.log("Setting volume to", e.target.value, "/ 100")
  currentsong.volume = parseInt(e.target.value) / 100
  if (currentsong.volume > 0) {
    document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "fullvol.svg")
  }
})

document.querySelector(".volume>img").addEventListener("click", e => {
  if (e.target.src.includes("fullvol.svg")) {
    e.target.src = e.target.src.replace("fullvol.svg", "mute.svg")
    currentsong.volume = 0;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
  } else {
    e.target.src = e.target.src.replace("mute.svg", "fullvol.svg")
    currentsong.volume = .10;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
  }
})

main();
