const menu = document.getElementById('menu');
const gameBtn = document.getElementById('gameBtn')
const shopBtn = document.getElementById('shopBtn');
const heroBtn = document.getElementById('heroBtn');
const settingsBtn = document.getElementById('settingsBtn');
const exitBtn = document.getElementById('exitBtn');

function openMap() {
  window.location.href = './html/map.html';
}
function openGame() {
  window.location.href = './html/game.html';
}
function openShop() {
  alert('Shop menu is under construction.');
}
function openHero() {
  alert('Hero menu is under construction.');
}
function openSettings() {
  alert('Settings menu is under construction.');
}
function exitGame() {
  window.close();
}

gameBtn.addEventListener('click', openGame);
shopBtn.addEventListener('click', openShop);
heroBtn.addEventListener('click', openHero);
settingsBtn.addEventListener('click', openSettings);
exitBtn.addEventListener('click', exitGame);