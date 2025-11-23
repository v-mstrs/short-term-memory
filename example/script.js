const SLUG = "the-great-heavenly-demon-sovereign";
const URL = `http://127.0.0.1:8000/${SLUG}/`;
const TOOLTIP_ID = "information-tooltip";
const tooltip = createTooltip(); 

let characters = [];
let customMenu;
let wrappedCharacters = new Set();
let saveBtn, nameInput, descInput, imgInput; 

async function fetchData() {
    try {
        const res = await fetch(URL);
        const data = await res.json();

        characters = data.characters || [];
        wrapCharacterNames();

    } catch (err) {
        console.error("Error loading novel data:", err);
    }
}

function wrapCharacterNames() {
    const content = document.querySelector(".epcontent.entry-content");
    if (!content) return;

    let html = content.innerHTML;

    characters.forEach(char => {
        if (!char.name || wrappedCharacters.has(char.name))
            return;

        const regex = new RegExp(char.name, "gi");

        html = html.replace(regex, (match) => {
            return `<span class="char-tooltip" 
                data-img="${char.image_url || ''}" 
                data-desc="${char.description || ''}">${match}</span>`;
        });
        
        wrappedCharacters.add(char.name);
    });

    content.innerHTML = html;

    document.querySelectorAll(".char-tooltip").forEach(span => {
        span.onmouseenter = showTooltip;
        span.onmouseleave = hideTooltip;
    });
}

function createTooltip() {
    let tooltip = document.createElement("div");
    tooltip.id = TOOLTIP_ID;

    tooltip.style.cssText = `
    display: none; position: fixed; background: white; border: 1px solid black;
    padding: 8px; max-width: 200px; z-index: 10000; box-shadow: 0 4px 8px rgba(0,0,0,0.1);`;

    return document.body.appendChild(tooltip);
}

function showTooltip(e) {
    const span = e.currentTarget;
    const desc = span.dataset.desc || "";
    const img = span.dataset.img;
    
    let html = "";
    if (img) html += `<img src="${img}" style="max-width:100%">`;
    if (desc) html += `<p style="color:black; margin:0;">${desc}</p>`;

    if (!html) return hideTooltip();

    tooltip.innerHTML = html;
    
    tooltip.style.display = "block"; 
    
    const rect = span.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect(); 
    
    
    let top = rect.bottom + 5;
    
    if (top + tooltipRect.height > window.innerHeight) {
        top = rect.top - tooltipRect.height - 5;
    }
    
    let left = rect.left;
    if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    if (left < 10) left = 10;
    
    Object.assign(tooltip.style, {
        left: left + "px",
        top: top + "px"
    });
}

function hideTooltip() {
    document.getElementById(TOOLTIP_ID).style.display = "none";
}

function hideMenu() {
    if (customMenu) customMenu.style.display = "none";
}

async function saveCharacter(data) {
    if (!data.name) return;

    const originalText = saveBtn.textContent;

    try {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";
        
        const res = await fetch(`${URL}characters`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            console.error("Error adding character:", await res.json());
            saveBtn.textContent = "Error!";
            return;
        }

        saveBtn.textContent = "Saved!";

        // Await fetchData to ensure updated characters are loaded
        await fetchData();

    } catch (err) {
        console.error("Network error:", err);
        saveBtn.textContent = "Error!";
        
    } finally {
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }, 1500);

        nameInput.value = "";
        descInput.value = "";
        imgInput.value = "";

        hideMenu();
    }
}

function createCustomMenu() {
    customMenu = document.createElement("div");
    customMenu.className = "custom-menu";

    customMenu.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid black;
        padding: 10px;
        z-index: 10000;
        width: 250px;
        min-width: 200px;
        min-height: 150px;
        display: none;
        resize: both;
        overflow: auto;
        box-sizing: border-box;
        border-radius: 6px;
        cursor: default;
        display: flex;
        flex-direction: column;
        gap: 8px; /* spacing between children */
    `;
    customMenu.innerHTML = `
        <p id="menuHeader" style="font-weight:bold; margin:0; cursor: move;">Add Character</p>

        <input id="charName" placeholder="Name" style="width:100%; padding:4px; box-sizing:border-box;">

        <textarea id="charDesc" placeholder="Description" style="width:100%; padding:4px; box-sizing:border-box; resize:none; flex-grow: 1;"></textarea>

        <input id="charImg" placeholder="Image URL (optional)" style="width:100%; padding:4px; box-sizing:border-box;">

        <select id="charMode" style="width:100%; padding:4px; margin-top:4px; box-sizing:border-box;">
            <option value="append">Append Description</option>
            <option value="overwrite">Overwrite Description</option>
        </select>

        <div style="text-align:right;">
            <button id="saveChar" style="margin-right:4px;">Save</button>
            <button id="cancelChar">Cancel</button>
        </div>
    `;

    document.body.appendChild(customMenu);
    
    saveBtn = customMenu.querySelector("#saveChar");
    cancelBtn = customMenu.querySelector("#cancelChar");
    nameInput = customMenu.querySelector("#charName");
    descInput = customMenu.querySelector("#charDesc");
    imgInput = customMenu.querySelector("#charImg");
    modeInput = customMenu.querySelector("#charMode");

    cancelBtn.onclick = hideMenu;

    saveBtn.onclick = async () => {
        const newChar = {
            name: nameInput.value.trim(),
            description: descInput.value.trim(),
            image_url: imgInput.value.trim() || null,
            mode: modeInput.value
        };
        
        await saveCharacter(newChar);
    };

    makeDraggable(customMenu, customMenu.querySelector("#menuHeader"));
}

document.addEventListener("contextmenu", e => {
    if (!e.altKey) return;
    e.preventDefault();

    if (!customMenu) createCustomMenu();

    customMenu.style.left = `${e.pageX}px`;
    customMenu.style.top = `${e.pageY}px`;
    customMenu.style.display = "flex"; // flex keeps children responsive
});

function makeDraggable(element, handle) {
    let isDown = false;
    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener("mousedown", e => {
        isDown = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        element.style.cursor = "grabbing";
        document.body.style.userSelect = "none"; // prevent text selection
    });

    document.addEventListener("mousemove", e => {
        if (!isDown) return;
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
        if (!isDown) return;
        isDown = false;
        element.style.cursor = "default";
        document.body.style.userSelect = "";
    });
}

fetchData();