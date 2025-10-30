// ==============================
//     METRO GRAPH STRUCTURE
// ==============================
const metroLines = {
  Blue: [
    "Noida Sector 62~B",
    "Botanical Garden~B",
    "Yamuna Bank~B",
    "Vaishali~B",
    "Rajiv Chowk~BY",
    "Moti Nagar~B",
    "Janak Puri West~BO",
    "Dwarka Sector 21~B",
  ],
  Yellow: [
    "Huda City Center~Y",
    "Saket~Y",
    "IIT Delhi~Y",
    "AIIMS~Y",
    "Rajiv Chowk~BY",
    "New Delhi~YO",
    "Chandni Chowk~Y",
    "Vishwavidyalaya~Y",
  ],
  Orange: [
    "New Delhi~YO",
    "Shivaji Stadium~O",
    "DDS Campus~O",
    "IGI Airport~O",
  ],
  Pink: [
    "Rajouri Garden~BP",
    "Punjabi Bagh West~P",
    "Netaji Subhash Place~PR",
  ],
};

const metroLineColors = {
  Blue: "#0078d7",
  Yellow: "#f1c40f",
  Orange: "#e67e22",
  Pink: "#e84393",
};

const graph = {
  // Blue Line
  "Noida Sector 62~B": { "Botanical Garden~B": 8 },
  "Botanical Garden~B": { "Noida Sector 62~B": 8, "Yamuna Bank~B": 10 },
  "Yamuna Bank~B": { "Botanical Garden~B": 10, "Vaishali~B": 8, "Rajiv Chowk~BY": 6 },
  "Vaishali~B": { "Yamuna Bank~B": 8 },
  "Rajiv Chowk~BY": {
    "Yamuna Bank~B": 6,
    "Moti Nagar~B": 9,
    "AIIMS~Y": 7,
    "New Delhi~YO": 1
  },
  "Moti Nagar~B": { "Rajiv Chowk~BY": 9, "Janak Puri West~BO": 7, "Rajouri Garden~BP": 2 },
  "Janak Puri West~BO": { "Moti Nagar~B": 7, "Dwarka Sector 21~B": 6 },
  "Dwarka Sector 21~B": { "Janak Puri West~BO": 6 },

  // Yellow Line (updated)
  "Huda City Center~Y": { "Saket~Y": 15 },
  "Saket~Y": { "Huda City Center~Y": 15, "IIT Delhi~Y": 4 },
  "IIT Delhi~Y": { "Saket~Y": 4, "AIIMS~Y": 3 },
  "AIIMS~Y": { "IIT Delhi~Y": 3, "Rajiv Chowk~BY": 7 },
  "New Delhi~YO": { "Rajiv Chowk~BY": 1, "Chandni Chowk~Y": 2, "Shivaji Stadium~O": 2 },
  "Chandni Chowk~Y": { "New Delhi~YO": 2, "Vishwavidyalaya~Y": 5 },
  "Vishwavidyalaya~Y": { "Chandni Chowk~Y": 5 },

  // Orange Line
  "Shivaji Stadium~O": { "New Delhi~YO": 2, "DDS Campus~O": 7 },
  "DDS Campus~O": { "Shivaji Stadium~O": 7, "IGI Airport~O": 8 },
  "IGI Airport~O": { "DDS Campus~O": 8 },

  // Pink Line
  "Rajouri Garden~BP": { "Moti Nagar~B": 2, "Punjabi Bagh West~P": 2 },
  "Punjabi Bagh West~P": { "Rajouri Garden~BP": 2, "Netaji Subhash Place~PR": 3 },
  "Netaji Subhash Place~PR": { "Punjabi Bagh West~P": 3 },
};


// ==============================
//        GLOBAL STATE
// ==============================
let currentMode = null;

// ==============================
//         MENU FUNCTIONS
// ==============================
function listStations() {
  const result = Object.keys(graph)
    .map((st, i) => `${i + 1}. ${st}`)
    .join("\n");
  document.getElementById("result").innerHTML =
    `<pre>📍 List of Metro Stations:\n\n${result}</pre>`;
}

// ---------- BEAUTIFUL METRO MAP ----------
function showMap() {
  let html = '<div class="metro-map">';
  for (let line in metroLines) {
    let colorClass =
      line === "Blue"
        ? "blue-line"
        : line === "Yellow"
        ? "yellow-line"
        : line === "Orange"
        ? "orange-line"
        : "pink-line";

    html += `<div class="line-card">
        <div class="line-title ${colorClass}">${line} Line</div>
        <ul class="station-list">
          ${metroLines[line].map(st => `<li>🚉 ${st}</li>`).join("")}
        </ul>
      </div>`;
  }
  html += "</div>";
  document.getElementById("result").innerHTML = html;
}

function findShortestDistance() {
  currentMode = "distance";
  document.getElementById("result").innerHTML =
    "🧭 Enter source & destination for shortest distance.";
}

function findShortestTime() {
  currentMode = "time";
  document.getElementById("result").innerHTML =
    "⏱️ Enter source & destination for shortest time.";
}

// ---------- DIJKSTRA ----------
function dijkstra(start, end, useTime = false) {
  const distances = {};
  const prev = {};
  const pq = new Set(Object.keys(graph));

  for (let v of pq) distances[v] = Infinity;
  distances[start] = 0;

  while (pq.size) {
    let u = [...pq].reduce((a, b) =>
      distances[a] < distances[b] ? a : b
    );
    pq.delete(u);
    if (u === end) break;

    for (let [neighbor, weight] of Object.entries(graph[u])) {
      const cost = useTime ? 120 + 40 * weight : weight;
      const alt = distances[u] + cost;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        prev[neighbor] = u;
      }
    }
  }

  let path = [];
  for (let at = end; at; at = prev[at]) path.push(at);
  path.reverse();

  return { distance: distances[end], path };
}

// ---------- CALCULATE ----------
function calculate() {
  const src = document.getElementById("source").value.trim();
  const dest = document.getElementById("destination").value.trim();
  if (!src || !dest) return alert("Please enter both source and destination!");

  if (!graph[src] || !graph[dest]) {
    document.getElementById("result").textContent = "❌ Invalid station name!";
    return;
  }

  const { distance, path } = dijkstra(src, dest, currentMode === "time");
  let output = `🗺️ Route from ${src} → ${dest}\n\n${path.join(" → ")}\n\n`;

  if (currentMode === "time") {
    const minutes = Math.ceil(distance / 60);
    output += `⏱️ Estimated Time: ${minutes} minutes`;
  } else {
    output += `🛤️ Distance: ${distance} km`;
  }

  document.getElementById("result").innerHTML = `<pre>${output}</pre>`;
}
