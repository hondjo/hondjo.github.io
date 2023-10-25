window.addEventListener("load", function () {
    fetchMaps();
    playerInput();
});

let maps = [];

class TempusMap {
    name
    stier
    dtier
    course

    constructor(name, stier, dtier, course) {
        this.name = name;
        this.stier = stier;
        this.dtier = dtier;
        this.course = course ?? 1;
    }
}

function fetchMaps() {
    const url = "https://tempus2.xyz/api/v0/maps/detailedList"
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            data.forEach(e => {
                maps.push(new TempusMap(e.name, e.tier_info[3], e.tier_info[4], e.zone_counts['course']))
            })
            addOptions()
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function addOptions() {
    let select = document.getElementById("mapOptions")
    maps.forEach(map => {
        let option = document.createElement("option")
        option.text = `${map.name} (S${map.stier}-D${map.dtier})`
        option.value = map.name
        select.append(option)
    })
}

function fetchRun() {
    const pId = document.getElementById("player").value
    const map = document.getElementById("map").value
    const demo = document.getElementById('demo').checked
    const url = `https://tempus2.xyz/api/v0/maps/name/${map}/zones/typeindex/map/1/records/player/${pId}/${(demo ? 4 : 3)}`

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            dataToResult(data, map);
        })
        .catch(error => {
            console.error("Error:", error);
        });
    return false;
}

function dataToResult(data, map) {
    let time, rank, date, id;
    try {
        const timeFormat = {
            hours: Math.floor(data.result.duration / 3600),
            minutes: Math.floor((data.result.duration % 3600) / 60),
            seconds: data.result.duration % 60
        };

        time = `${(timeFormat.hours ? timeFormat.hours + " hours, " : "")}${(timeFormat.minutes ? timeFormat.minutes + " minutes, " : "")}${(data.result.duration % 60).toFixed(2)} seconds`;

        rank = data.result.rank
        date = new Date(data.result.date * 1000).toLocaleString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }
        )
        id = data.result.id
    } catch (TypeError) {
        console.log("no run")
    }
    drawResult(time, rank, date, id, map)
}

function drawResult(time, rank, date, id, map) {
    const container = document.getElementById('resultContainer')
    const runlink = document.getElementById('runlink')
    container.style.display = "block";
    if (time) {
        runlink.style.display = "block";
        container.classList.add("alert-success")
        container.classList.remove("alert-danger")
        document.getElementById('result')
            .innerText = `You have completed ${map} \n ${date} \n ${time} #${rank}`
        runlink.href = `https://tempus2.xyz/records/${id}`;
    } else {
        runlink.style.display = "none";
        container.classList.remove("alert-success")
        container.classList.add("alert-danger")
        document.getElementById('result')
            .innerText = `You have not yet completed ${map}`
    }
}

function playerInput() {
    const input = document.getElementById('player')
    const select = document.getElementById("playerOptions")

    input.addEventListener('change', e => {
        if (input.value.length < 4) return;
        const url = `https://tempus2.xyz/api/v0/search/playersAndMaps/${input.value}`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                data.players.forEach(user => {
                    let option = document.createElement("option")
                    option.text = `${user.name} - ${user.steamid}`
                    option.value = user.id
                    select.append(option)
                })
            })
            .catch(error => {
                console.error("Error:", error);
            });
    })
}