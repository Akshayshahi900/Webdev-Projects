console.log("Let's write some script");

let currentSong = new Audio();
let songs = [];
let currFolder;

function secondsToMinuteSeconds(inputSeconds) {
    const seconds = Math.floor(inputSeconds);
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        const response = await fetch(`http://127.0.0.1:5500/${currFolder}/`);
        const text = await response.text();
        const div = document.createElement("div");
        div.innerHTML = text;
        const as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }
        const songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `
                <li>
                    <img class="invert" width="34" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Akshay</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>
                </li>`;
        }
        Array.from(document.querySelectorAll(".songList li")).forEach(e => {
            e.addEventListener("click", () => {
                const track = e.querySelector(".info").firstElementChild.innerHTML.trim();
                playMusic(track);
            });
        });
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

function playMusic(track, pause = false) {
    currentSong.src = `http://127.0.0.1:5500/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "img/pause.svg";
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00/00:00";
}

async function displayAlbums() {
    try {
        const response = await fetch("http://127.0.0.1:5500/songs/");
        const text = await response.text();
        const div = document.createElement("div");
        div.innerHTML = text;
        const anchors = div.getElementsByTagName("a");
        const allowedFolders = [ "angry" ,"diljit" ,"karanaujla" , "funky" , "nature" , "chill",  "relax"]; // Specify allowed subfolders here

        for (const e of anchors) {
            const folderName = e.href.split("/").slice(-2, -1)[0]; // Extract the folder name
            if (allowedFolders.includes(folderName)) {
                try {
                    const metaResponse = await fetch(`http://127.0.0.1:5500/songs/${folderName}/info.json`);
                    const metaData = await metaResponse.json();
                    console.log(metaData);
                    // Display the albums as per your requirements
                } catch (metaError) {
                    console.error("Error fetching metadata:", metaError);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching albums:", error); 
    }
}

async function main() {
    await getSongs("songs/cs");
    playMusic(songs[0], true);
    displayAlbums();

    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").src = "img/pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("play").src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinuteSeconds(currentSong.currentTime)} / ${secondsToMinuteSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.getElementById("previous").addEventListener("click", () => {
        const index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        const index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    Array.from(document.getElementsByClassName("cards")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });


 // Add event listener to volume
 document.querySelector(".timevol img").addEventListener("click", e=>{ 
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }

})

}

main();
