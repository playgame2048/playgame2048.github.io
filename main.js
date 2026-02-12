// زر مشاركة الموقع
const shareBtn = document.createElement('button');
shareBtn.innerHTML = '📤 Share';
shareBtn.className = 'btn share-btn';
shareBtn.onclick = () => {
  if (navigator.share) {
    navigator.share({
      title: 'GameVerse - Free Classic Games',
      text: 'Play 7 classic games online for free!',
      url: window.location.href,
    });
  } else {
    alert('Copy the link: ' + window.location.href);
  }
};
document.querySelector('.game-header').appendChild(shareBtn);
