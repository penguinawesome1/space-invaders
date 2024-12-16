const dialog = document.getElementById("pause-menu");

document.getElementById("pause-button").addEventListener("click", () => {
    dialog.showModal();
    dialog.classList.remove("hidden");
});

document.getElementById("unpause").addEventListener("click", () => {
    dialog.close();
    dialog.classList.add("hidden");
});