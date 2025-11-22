const slug = "the-great-heavenly-demon-sovereign";
const url = `http://127.0.0.1:8000/${slug}/`;

let characters = [];
let showImageAndDescription = true;
let customMenu, popupContainer;
let nameInput, descInput, imgInput, saveBtn, cancelBtn;

document.addEventListener("DOMContentLoaded", fetchData);

/* ----------------------------- FETCH DATA ----------------------------- */

async function fetchData() {
    try {
        const res = await fetch(url);
        const data = await res.json();

        characters = data.characters || [];
        createPopupContainer();
        wrapCharacterNames(".epcontent.entry-content");

    } catch (err) {
        console.error("Error loading novel data:", err);
    }
}

/* **********************************************************************
   SAFE TEXT NODE REPLACEMENT (NO REGEX ON innerHTML)
   ********************************************************************** */

function wrapCharacterNames(selector) {
    const root = document.querySelector(selector);
    if (!root) return;

    characters.forEach(char => {
        const escapedName = escapeRegex(char.name);
        const regex = new RegExp(escapedName, "gi");

        const spanHTML =
            `<span class="char-image" ` +
            (char.image_url ? `data-img="${escapeHtml(char.image_url)}" ` : "") +
            `data-desc="${escapeHtml(char.description || "")}">$&</span>`;

        replaceTextNodes(root, regex, spanHTML);
    });

    root.querySelectorAll(".char-image").forEach(span => {
        span.addEventListener("mouseenter", showPopup);
        span.addEventListener("mouseleave", hidePopup);
    });
}

function replaceTextNodes(root, regex, html) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

    let textNode;
    const nodes = [];

    while ((textNode = walker.nextNode())) {
        if (regex.test(textNode.nodeValue)) {
            nodes.push(textNode);
        }
    }

    nodes.forEach(node => {
        const frag = document.createElement("span");
        frag.innerHTML = node.nodeValue.replace(
            regex,
            match => html.replace("$&", match)
        );

        while (frag.firstChild) {
            node.parentNode.insertBefore(frag.firstChild, node);
        }

        node.remove();
    });
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(str) {
    return str.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ----------------------------- POPUP BOX ------------------------------ */

function createPopupContainer() {
    popupContainer = document.createElement("div");
    popupContainer.id = "image-popup-box";

    addGlobalStyle(`
        #image-popup-box {
            display: none;
            position: absolute;
            z-index: 99999;
            background: #fff;
            border: 1px solid black;
            max-width: 180px;
            padding: 6px;
            font-size: 14px;
            line-height: 1.4;
            white-space: normal;
            word-break: break-word;
            box-shadow: 0 4px 8px rgba(0,0,0,0.12);
        }
        #image-popup-box img {
            max-width: 100%;
            display: block;
            height: auto;
            margin-bottom: 6px;
        }
        #image-popup-box p {
            color: black;
            margin: 0;
        }
    `);

    document.body.appendChild(popupContainer);
}

function showPopup(e) {
    const span = e.currentTarget;
    const img = span.dataset.img;
    const desc = span.dataset.desc || "";

    let html = "";
    if (img && showImageAndDescription) html += `<img src="${img}">`;
    if (desc) html += `<p>${desc}</p>`;

    popupContainer.innerHTML = html;
    popupContainer.style.display = "block";

    positionPopup(span);
}

function hidePopup() {
    popupContainer.style.display = "none";
}

function positionPopup(span) {
    const rect = span.getBoundingClientRect();
    const popupRect = popupContainer.getBoundingClientRect();

    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 5;

    const viewportRight = window.scrollX + window.innerWidth;
    const viewportBottom = window.scrollY + window.innerHeight;

    if (left + popupRect.width > viewportRight - 8) {
        left = viewportRight - popupRect.width - 8;
    }
    if (left < window.scrollX + 8) {
        left = window.scrollX + 8;
    }

    if (top + popupRect.height > viewportBottom - 8) {
        const above = rect.top + window.scrollY - popupRect.height - 5;
        top = above >= window.scrollY + 8 ? above : viewportBottom - popupRect.height - 8;
    }

    popupContainer.style.left = `${left}px`;
    popupContainer.style.top = `${top}px`;
}

/* ----------------------------- CUSTOM MENU ---------------------------- */

function createCustomMenu() {
    addGlobalStyle(`
        .custom-menu {
            position: absolute;
            background: #fff;
            border: 1px solid #0005;
            padding: 10px;
            display: none;
            z-index: 100000;
            width: 220px;
            font-family: sans-serif;
        }
        .custom-menu p {
            margin: 0 0 6px;
            font-weight: bold;
        }
        .custom-menu input {
            width: 100%;
            margin-bottom: 8px;
            padding: 5px;
        }
        .custom-menu button {
            padding: 5px 10px;
            border: none;
            cursor: pointer;
        }
        .custom-menu #saveChar {
            background: #007bff;
            color: white;
        }
        .custom-menu #cancelChar {
            background: #ddd;
        }
    `);

    customMenu = document.createElement("div");
    customMenu.className = "custom-menu";
    customMenu.innerHTML = `
        <p>Add Character</p>
        <input id="charName" placeholder="Name">
        <input id="charDesc" placeholder="Description">
        <input id="charImg" placeholder="Image URL (optional)">
        <div style="text-align:right;">
            <button id="saveChar">Save</button>
            <button id="cancelChar">Cancel</button>
        </div>
    `;

    document.body.appendChild(customMenu);

    nameInput = customMenu.querySelector("#charName");
    descInput = customMenu.querySelector("#charDesc");
    imgInput = customMenu.querySelector("#charImg");
    saveBtn = customMenu.querySelector("#saveChar");
    cancelBtn = customMenu.querySelector("#cancelChar");

    cancelBtn.onclick = () => hideMenu();

    saveBtn.onclick = async () => {
        const newChar = {
            name: nameInput.value.trim(),
            description: descInput.value.trim(),
            image_url: imgInput.value.trim() || null
        };

        await saveCharacter(newChar);
    };
}

/* --------------------------- SAVE CHARACTERS --------------------------- */

async function saveCharacter(data) {
    if (!data.name) return;

    saveBtn.disabled = true;
    const original = saveBtn.textContent;
    saveBtn.textContent = "Saving...";

    const result = await addCharacter(data);

    saveBtn.textContent = result ? "Saved!" : "Error!";
    setTimeout(() => (saveBtn.textContent = original), 1500);

    saveBtn.disabled = false;

    if (result) {
        fetchData();
    }

    nameInput.value = "";
    descInput.value = "";
    imgInput.value = "";

    hideMenu();
}

async function addCharacter(payload) {
    try {
        const res = await fetch(`${url}characters`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.error("Error adding character:", await res.json());
            return null;
        }

        return await res.json();
    } catch (err) {
        console.error("Network error:", err);
        return null;
    }
}

/* ----------------------------- CONTEXT MENU ---------------------------- */

document.addEventListener("contextmenu", e => {
    if (!e.altKey) return;
    e.preventDefault();

    if (!customMenu) createCustomMenu();

    customMenu.style.left = `${e.pageX}px`;
    customMenu.style.top = `${e.pageY}px`;
    customMenu.style.display = "block";
});

document.addEventListener("click", e => {
    if (customMenu && !customMenu.contains(e.target)) hideMenu();
});

function hideMenu() {
    if (customMenu) customMenu.style.display = "none";
}

/* ----------------------------- UTILITIES ------------------------------- */

function addGlobalStyle(css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
}

fetchData();
