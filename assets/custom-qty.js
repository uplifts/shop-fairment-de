function showDiv1(){
  console.log('clicked');
}

function showDiv2(){
  document.getElementById('hiddenThree') && document.getElementById('hiddenThree').style.cssText += ';display:block !important;'
}

function showDiv3(){
  document.getElementById('hiddenSix') && document.getElementById('hiddenSix').style.display = 'block';
}