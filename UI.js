

export function hideText() {
    document.getElementById("infoBox").style.visibility = "hidden";
}

export function showText(title, text) {
    document.getElementById("infoBox").style.visibility = "visible";
    document.getElementById("infoTitle").innerHTML = title;
    document.getElementById("infoText").innerHTML = text;
}